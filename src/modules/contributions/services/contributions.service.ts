import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { Repository } from 'typeorm';
import { AudityEntryDto } from '../../../audit/interface/audit-entry.dto';
import { AuditService } from '../../../audit/service/audit.service';
import { Project } from '../../../projects/entity/project.entity';
import { Contribution } from '../entities/contribution.entity';
import { CreateContributionDto } from '../interfaces/create-contribution.dto';
import { UpdateContributionDto } from '../interfaces/update-contribution.dto';
import * as moment from 'moment-business-days';
import { BudgetTransferDto } from '../../../projects/interfaces/budget-transfer.dto';
import { ProjectsService } from '../../../projects/services/projects.service';
import { I18nContext } from 'nestjs-i18n';
moment.locale('pt-br');

@Injectable()
export class ContributionsService {

  constructor(
    @Inject('CONTRIBUTION_REPOSITORY')
    private contributionRepository : Repository<Contribution>,
    @Inject('PROJECT_REPOSITORY')
    private projectRepository: Repository<Project>,
    private readonly projectService: ProjectsService,
    private readonly auditService: AuditService
  ){

  }

  async confirmContribution(contributionId: number, auditEntry: AudityEntryDto) {
    const dbContribution = await this.contributionRepository.findOne({ where: { id: contributionId }});
    if (!dbContribution) {
      throw new NotFoundException(
          await I18nContext.current().translate('contribution.NOT_FOUND', {
              args: { id: contributionId },
          })
      );
    }

    dbContribution.confirmationOfReceive = true;
    try {
      await this.contributionRepository.save(dbContribution);
      if (auditEntry) {
        auditEntry.actionType = 'CONFIRM';
        auditEntry.targetEntity = this.contributionRepository.metadata.targetName;
        auditEntry.targetTable = this.contributionRepository.metadata.tableName;
        auditEntry.targetEntityId = dbContribution.id;
        auditEntry.targetEntityBody = '';
        this.auditService.audit(auditEntry);
    }
      return dbContribution.confirmationOfReceive === true;
    } catch (error) {
      throw new BadRequestException(error);
    }

  }

  async contributionsReceivedInTableStyle(projectId : number) : Promise<any>{
    const dbProject = await this.projectRepository.findOne({ where: { id: projectId }});
    if (!dbProject) {
      throw new NotFoundException(
          await I18nContext.current().translate('project.NOT_FOUND', {
              args: { id: projectId },
          })
      );
    }

    let start = moment(dbProject.start);
    let end = moment(dbProject.end);

    const months = new Array();

    do {
      let formatedDate = start.format('MMM/YYYY');
      months.push({
          amount: 0,
          name: formatedDate
      })

      start = start.add(1, 'M');
    } while (start.isBefore(end));
    months.push({
        amount: 0,
        name: start.format('MMM/YYYY')
    });
    months.map((dateInfos) => {
        let toUpper = dateInfos.name.split('/');
        dateInfos.name = `${toUpper[0].toUpperCase()}/${toUpper[1]}`
    });

    
    const contributions = await this.contributionRepository.find({
      where : { project : { id: projectId }, active : true, confirmationOfReceive: true }
    });

    contributions.map((contribution) => {
      let formatedDate = moment(contribution.receiptDate).format('MMM/YYYY').split('/')
      let toUpper = `${formatedDate[0].toUpperCase()}/${formatedDate[1]}`;

      months.map((monthInfo) => {
        if(monthInfo.name == toUpper){
          monthInfo.amount += contribution.amount;
        }
      })
    })
    
    return months;
  }

  async InformationAboutContributionsByProjectId(projectId : number) : Promise<any> {

    const dbProject = await this.projectRepository.findOne({ where: { id: projectId }});
    if (!dbProject) {
      throw new NotFoundException(
          await I18nContext.current().translate('project.NOT_FOUND', {
              args: { id: projectId },
          })
      );
    }

    const dbContributions = await this.contributionRepository.find({
      where : {
        project : { id: projectId },
        active : true
      }
    });

    let totalProject = 0;
    let totalReceived = 0;
    let totalReceivable = 0;

    dbContributions.forEach((element) => {
      totalProject += element.amount;

      if(element.confirmationOfReceive == true){
        totalReceived += element.amount;
      }

      else{
        totalReceivable += element.amount;
      }
    })


    return {
      totalProject,
      totalReceived,
      totalReceivable
    }
  }

  async create(createContributionDto: CreateContributionDto, auditEntry: AudityEntryDto) {

    const { amount, project, receiptDate, isTransfer, transferDate } = createContributionDto;

    const dbProject = await this.projectRepository.findOne({ where: { id: project}});
    if (!dbProject) {
      throw new NotFoundException(
          await I18nContext.current().translate('project.NOT_FOUND', {
              args: { id: project },
          })
      );
    }

    const newContribuition = new Contribution();
    newContribuition.active = true;
    newContribuition.amount = amount;
    newContribuition.project = dbProject;
    newContribuition.receiptDate = receiptDate;
    newContribuition.confirmationOfReceive = false;
    newContribuition.isTranfer = isTransfer;
    newContribuition.transferDate = transferDate

    try {
      let dbContribution = await this.contributionRepository.save(newContribuition);

      if (auditEntry) {
        auditEntry.actionType = 'CREATE';
        auditEntry.targetEntity = this.contributionRepository.metadata.targetName;
        auditEntry.targetTable = this.contributionRepository.metadata.tableName;
        auditEntry.targetEntityId = dbContribution.id;
        auditEntry.targetEntityBody = JSON.stringify(classToPlain(newContribuition));
        this.auditService.audit(auditEntry);
      }

      return dbContribution;
    } catch (error) {
      throw new BadRequestException(error);
    }
 
  }

  async findValueOfAllNotConfirmedContributionsByProjectId(projectId : number){
    try {

      const dbProject = await this.projectRepository.findOne({ where: {id: projectId }});
      if (!dbProject) {
        throw new NotFoundException(
            await I18nContext.current().translate('project.NOT_FOUND', {
                args: { id: projectId },
            })
        );
      }

      const dbContribution = await this.contributionRepository.find({
        relations : ['project'],
        where : {
          active : true,
          confirmationOfReceive : false,
          project : { id: projectId }
        }
      })

      let notConfirmedContributions = 0;
      dbContribution.forEach((contribution) => {
        notConfirmedContributions += contribution.amount;
      });

      return {
        'valueOfAllContributionsNotConfirmed' : notConfirmedContributions
      }

    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findValueOfAllContributionsByProjectId(projectId : number) {
    try {

      const dbProject = await this.projectRepository.findOne({ where: { id: projectId}});
      if (!dbProject) {
        throw new NotFoundException(
            await I18nContext.current().translate('project.NOT_FOUND', {
                args: { id: projectId },
            })
        );
      }

      const dbContribution = await this.contributionRepository.find({
        relations : ['project'],
        where : {
          active : true,
          project : { id: projectId}
        }
      })

      let activeContributions = 0;
      dbContribution.forEach((contribution) => {
        activeContributions += contribution.amount;
      });

      return {
        'valueOfAllContributions' : activeContributions
      }

    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findValueOfAllConfirmedContributionsByProjectId(projectId : number) {
    try {

      const dbProject = await this.projectRepository.findOne({ where: { id: projectId}});
      if (!dbProject) {
        throw new NotFoundException(
            await I18nContext.current().translate('project.NOT_FOUND', {
                args: { id: projectId },
            })
        );
      }

      const dbContribution = await this.contributionRepository.find({
        relations : ['project'],
        where : {
          active : true,
          confirmationOfReceive : true,
          project : { id: projectId }
        }
      })

      let confirmedContributions = 0;
      dbContribution.forEach((contribution) => {
        confirmedContributions += contribution.amount;
      });

      return {
        'valueOfAllContributionsConfirmed' : confirmedContributions
      }

    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAllContributions() : Promise<Contribution[]> {
    try {
      return await this.contributionRepository.createQueryBuilder('contribution')
      .leftJoinAndSelect('contribution.project', 'project')
      .select([
        'contribution.id',
        'contribution.amount',
        'contribution.receivement',
        'project.id',
        'project.name',
    ])
      .getMany();
 
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findContributionById(contributionId: number) {
    try {
      let dbContribution = await this.contributionRepository.find({
        where : {
          id : contributionId
        }, 
        relations : ['project']
      });

      if(dbContribution.length == 0){
        throw new NotFoundException(
          await I18nContext.current().translate('contribution.NOT_FOUND', {
              args: { id: contributionId },
          })
      );
      }

      return dbContribution;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findContributionsByProjectId(projectId: number) : Promise<Contribution[]> {

    const dbProject = await this.projectRepository.findOne({ where: { id: projectId}});
    if (!dbProject) {
      throw new NotFoundException(
          await I18nContext.current().translate('project.NOT_FOUND', {
              args: { id: projectId },
          })
      );
    }

    return await this.contributionRepository.find({
      where : { project : { id: projectId} , active : true }
    });
  }

  async update(contributionId: number, updateContributionDto: UpdateContributionDto, auditEntry: AudityEntryDto) {
    const { amount, project, receiptDate } = updateContributionDto;

    const dbProject = await this.projectRepository.findOne({ where: { id: project}});
    if (!dbProject) {
      throw new NotFoundException(
          await I18nContext.current().translate('project.NOT_FOUND', {
              args: { id: project },
          })
      );
    }

    let dbContribution = await this.contributionRepository.findOne({ where: { id: contributionId}});

    if (!dbContribution) {
      throw new NotFoundException(
          await I18nContext.current().translate('contribution.NOT_FOUND', {
              args: { id: contributionId },
          })
      );
    }
    try {
      dbContribution.amount = amount;
      dbContribution.project = dbProject;
      dbContribution.receiptDate = receiptDate;

      this.contributionRepository.save(dbContribution);

      if (auditEntry) {
        auditEntry.actionType = 'UPDATE';
        auditEntry.targetEntity = this.contributionRepository.metadata.targetName;
        auditEntry.targetTable = this.contributionRepository.metadata.tableName;
        auditEntry.targetEntityId = dbContribution.id;
        auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbContribution));
        this.auditService.audit(auditEntry);
    }

      return dbContribution;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async remove(contributionId: number, auditEntry: AudityEntryDto) {
    let dbContribution = await this.contributionRepository.findOne({ where: { id: contributionId}});

    if (!dbContribution) {
      throw new NotFoundException(
          await I18nContext.current().translate('contribution.NOT_FOUND', {
              args: { id: contributionId },
          })
      );
  }

  try {
    dbContribution.active = false;
    dbContribution = await this.contributionRepository.save(dbContribution);

    if (auditEntry) {
      auditEntry.actionType = 'DELETE';
      auditEntry.targetEntity = this.contributionRepository.metadata.targetName;
      auditEntry.targetTable = this.contributionRepository.metadata.tableName;
      auditEntry.targetEntityId = dbContribution.id;
      auditEntry.targetEntityBody = '';
      this.auditService.audit(auditEntry);
    }

    return dbContribution.active === false;
  } catch (error) {
    throw new BadRequestException(error);
  }

  }

  async transferBetweenProjects(budgetTransferDto: BudgetTransferDto, auditEntry: AudityEntryDto) {
    const donatingProject: Project = await this.projectRepository.findOne( { where: { id: budgetTransferDto.donatingProjectId }, relations:['institute']})
    const receivingProject: Project = await this.projectRepository.findOne( { where: { id: budgetTransferDto.receivingProjectId } ,relations:['institute']})
        
    if (moment(moment.now()) < moment(donatingProject.end) ) {
      throw new BadRequestException(
        await I18nContext.current().translate('contribution.PROJECT_NOT_YET_FINISHED', {
            args: { date: donatingProject.end },
        }) 
    )
    }
    if (!donatingProject) {
        throw new NotFoundException(
            await I18nContext.current().translate('contribution.DONATING_PROJECT_NOT_FOUND', {
                args: { id: budgetTransferDto.donatingProjectId },
            }) 
        )
    }
    if (!receivingProject) {
        throw new NotFoundException(
            await I18nContext.current().translate('contribution.RECEIVING_PROJECT_NOT_FOUND', {
                args: { id: budgetTransferDto.receivingProjectId },
            }) 
        )
    }
    if (budgetTransferDto.donatedAmount > donatingProject.lastMargin) {
        throw new BadRequestException(
            await I18nContext.current().translate('contribution.NOT_ENOUGH_MARGIN_FOR_TRANFER')
        )
    }
    if (donatingProject.institute.id != receivingProject.institute.id) {
        throw new BadRequestException(
            await I18nContext.current().translate('contribution.TRANSFER_TO_DIFFERENT_INSTITUTE_NOT_ALLOWED')
        )
    }

    const contribution: CreateContributionDto = {
      amount: budgetTransferDto.donatedAmount,
      project: budgetTransferDto.receivingProjectId,
      receiptDate: moment(budgetTransferDto.transferDate,'YYYY-MM-DD').toDate(),
      transferDate: moment(budgetTransferDto.transferDate,'YYYY-MM-DD').toDate(),
      isTransfer: true
  }
    const incomingDonatorBudget = donatingProject.budget
    const incomingReceiverBudget = receivingProject.budget

    donatingProject.budget = (donatingProject.budget - budgetTransferDto.donatedAmount);
    await this.projectRepository.save(donatingProject);
    
    receivingProject.budget = (receivingProject.budget + budgetTransferDto.donatedAmount);
    await this.projectRepository.save(receivingProject);

    await this.projectService.updateProjectMargin(donatingProject.id);
    await this.projectService.updateProjectMargin(receivingProject.id);

    this.create(contribution, auditEntry)

    if (auditEntry) {
        auditEntry.actionType = 'CREATE';
        auditEntry.targetEntity = this.projectRepository.metadata.targetName;
        auditEntry.targetTable = this.projectRepository.metadata.tableName;
        auditEntry.targetEntityId = budgetTransferDto.receivingProjectId;
        auditEntry.targetEntityBody = '';
        this.auditService.audit(auditEntry);
    }

    return {
        previousDonatorBudget: incomingDonatorBudget,
        newDonatorBudget: donatingProject.budget,
        previousReceiverBudget: incomingReceiverBudget,
        newReceiverBudget: receivingProject.budget
    }
  }
}
