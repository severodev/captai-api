import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { AudityEntryDto } from '../../../audit/interface/audit-entry.dto';
import { Repository } from 'typeorm';
import { AuditService } from '../../../audit/service/audit.service';
import { Project } from '../../../projects/entity/project.entity';
import { Loan } from '../entities/loan.entity';
import { CreateLoanDto } from '../interfaces/create-loan.dto';
import { UpdateLoanDto } from '../interfaces/update-loan.dto';

@Injectable()
export class LoanService {
  constructor(
    @Inject('LOAN_REPOSITORY')
    private readonly loanRepository : Repository<Loan>,
    @Inject('PROJECT_REPOSITORY')
    private projectRepository: Repository<Project>,
    private readonly i18n: I18nRequestScopeService,
    private readonly auditService: AuditService

  ){

  }

  async InformationAboutLoansByProjectId(projectId : number) : Promise<any> {

    let totalProject = 0;
    let totalReceived = 0;
    let totalToBeReturned = 0;

    const dbProject = await this.projectRepository.findOne(projectId);
    if (!dbProject) {
      throw new NotFoundException(
          await this.i18n.translate('project.NOT_FOUND', {
              args: { id: projectId },
          })
      );
    }

    const dbLoansOrigin = await this.loanRepository.find({
      where : {
        originProject : projectId,
        active : true
      }
    });

    const dbLoansTarget = await this.loanRepository.find({
      where : {
        targetProject : projectId,
        active : true
      }
    });

    dbLoansOrigin.forEach((element) => {
      totalProject += element.amount;

      if(element.confirmationOfReceive == true){
        totalReceived += element.amount;
      }
    });

    dbLoansTarget.forEach((element) => {
      totalProject += element.amount;

      if(element.confirmationOfReceive == true){
        totalReceived += element.amount;
        if(element.confirmationOfDevolution == false){
          totalToBeReturned += element.amount;
        }
      }
    });

    return {
      totalProject,
      totalReceived,
      totalToBeReturned
    }
  }

  async returnLoan(loanId: number, auditEntry: AudityEntryDto) {
    const dbLoan = await this.loanRepository.findOne(loanId);

    if (!dbLoan) {
      throw new NotFoundException(
          await this.i18n.translate('loan.NOT_FOUND', {
              args: { id: dbLoan },
          })
      );
    }

    if(dbLoan.confirmationOfReceive == true){
      dbLoan.confirmationOfDevolution = true;
      dbLoan.devolutionDate = new Date();
    } else {
      return dbLoan.confirmationOfDevolution === true;
    }

    try {
      await this.loanRepository.save(dbLoan);

      if (auditEntry) {
        auditEntry.actionType = 'CONFIRM';
        auditEntry.targetEntity = this.loanRepository.metadata.targetName;
        auditEntry.targetTable = this.loanRepository.metadata.tableName;
        auditEntry.targetEntityId = dbLoan.id;
        auditEntry.targetEntityBody = '';
        this.auditService.audit(auditEntry);
    }
      return dbLoan.confirmationOfDevolution === true;
    } catch (error) {
      throw new BadRequestException(error);
    }

  }

  async confirmLoan(loanId: number, auditEntry: AudityEntryDto) {
    const dbLoan = await this.loanRepository.findOne(loanId);

    if (!dbLoan) {
      throw new NotFoundException(
          await this.i18n.translate('loan.NOT_FOUND', {
              args: { id: dbLoan },
          })
      );
    }

    dbLoan.confirmationOfReceive = true;
    dbLoan.confirmationOfLoan = new Date();

    try {
      await this.loanRepository.save(dbLoan);

      if (auditEntry) {
        auditEntry.actionType = 'CONFIRM';
        auditEntry.targetEntity = this.loanRepository.metadata.targetName;
        auditEntry.targetTable = this.loanRepository.metadata.tableName;
        auditEntry.targetEntityId = dbLoan.id;
        auditEntry.targetEntityBody = '';
        this.auditService.audit(auditEntry);
    }
      return dbLoan.confirmationOfReceive === true;
    } catch (error) {
      throw new BadRequestException(error);
    }

  }

  async create(createLoanDto: CreateLoanDto, auditEntry: AudityEntryDto) {

    const { amount, originProject, targetProject, receiptDate, returnDate } = createLoanDto;
    
    try {
      let dbOriginProject = await this.projectRepository.findOne(originProject);
      if (!dbOriginProject) {
        throw new NotFoundException(
            await this.i18n.translate('project.NOT_FOUND', {
                args: { id: originProject },
            })
        );
      }

      let dbTargetProject = await this.projectRepository.findOne(targetProject);
      if (!dbTargetProject) {
        throw new NotFoundException(
            await this.i18n.translate('project.NOT_FOUND', {
                args: { id: targetProject },
            })
        );
      }

      const newLoan = new Loan();
      newLoan.active = true;
      newLoan.amount = amount;
      newLoan.receiptDate = receiptDate;
      newLoan.returnDate = returnDate;
      newLoan.confirmationOfLoan = null;
      newLoan.originProject = dbOriginProject;
      newLoan.targetProject = dbTargetProject;

      let dbLoan = await this.loanRepository.save(newLoan);

       if (auditEntry) {
        auditEntry.actionType = 'CREATE';
        auditEntry.targetEntity = this.loanRepository.metadata.targetName;
        auditEntry.targetTable = this.loanRepository.metadata.tableName;
        auditEntry.targetEntityId = dbLoan.id;
        auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbLoan));
        this.auditService.audit(auditEntry);
      }

      return dbLoan;

    } catch (error) {
      throw new BadRequestException(error);
    }
    
  }

  async findLoansReceivedByProjectId(projectId : number){  

    const dbProject = await this.projectRepository.findOne(projectId);
    if (!dbProject) {
      throw new NotFoundException(
          await this.i18n.translate('project.NOT_FOUND', {
              args: { id: projectId },
          })
      );
    }
       return await this.loanRepository.find({
        relations : ['originProject', 'targetProject'],
        where : { targetProject : projectId, active : true },
      });
  }

  async findLoansGivenByProjectId(projectId : number){  

    const dbProject = await this.projectRepository.findOne(projectId);
    if (!dbProject) {
      throw new NotFoundException(
          await this.i18n.translate('project.NOT_FOUND', {
              args: { id: projectId },
          })
      );
    }
       return await this.loanRepository.find({
        relations : ['originProject', 'targetProject'],
        where : { originProject : projectId, active : true },
      });
  }

  async findAllLoans() : Promise<Loan[]>{
    try {
      return await this.loanRepository.find({
        relations : ['originProject', 'targetProject']
      })
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findLoanById(loanId: number) {
    try {
      let dbLoan = await this.loanRepository.find({
        where : {
          id : loanId
        }, 
        relations : ['originProject', 'targetProject']
      });

      if(dbLoan.length == 0){
        throw new NotFoundException(
          await this.i18n.translate('loan.NOT_FOUND', {
              args: { id: loanId },
          })
      );
      }

      return dbLoan;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async update(loanId: number, updateLoanDto: UpdateLoanDto, auditEntry: AudityEntryDto) {
    const { amount, originProject, targetProject, receiptDate, returnDate } = updateLoanDto;

    try {
      let dbLoan = await this.loanRepository.findOne(loanId);

      if(!dbLoan){
        throw new NotFoundException(
          await this.i18n.translate('loan.NOT_FOUND', {
              args: { id: loanId },
          })
      );
      }

      let dbOriginProject = await this.projectRepository.findOne(originProject);
        if (!dbOriginProject) {
          throw new NotFoundException(
              await this.i18n.translate('project.NOT_FOUND', {
                  args: { id: originProject },
              })
          );
        }

        let dbTargetProject = await this.projectRepository.findOne(targetProject);
        if (!dbTargetProject) {
          throw new NotFoundException(
              await this.i18n.translate('project.NOT_FOUND', {
                  args: { id: targetProject },
              })
          );
        }

        dbLoan.amount = amount;
        dbLoan.originProject = dbOriginProject;
        dbLoan.targetProject = dbTargetProject;
        dbLoan.receiptDate = receiptDate;
        dbLoan.returnDate = returnDate;

        this.loanRepository.save(dbLoan);

        if (auditEntry) {
          auditEntry.actionType = 'UPDATE';
          auditEntry.targetEntity = this.loanRepository.metadata.targetName;
          auditEntry.targetTable = this.loanRepository.metadata.tableName;
          auditEntry.targetEntityId = dbLoan.id;
          auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbLoan));
          this.auditService.audit(auditEntry);
        }

        return dbLoan;
    } catch (error) {
      throw new BadRequestException(error);
    }

  }

  async remove(loanId: number, auditEntry: AudityEntryDto) {
    
    try {
      let dbLoan = await this.loanRepository.findOne(loanId);

      if(!dbLoan){
        throw new NotFoundException(
          await this.i18n.translate('loan.NOT_FOUND', {
              args: { id: loanId },
          })
        );
      }

      dbLoan.active = false;
      dbLoan = await this.loanRepository.save(dbLoan);

      if (auditEntry) {
        auditEntry.actionType = 'DELETE';
        auditEntry.targetEntity = this.loanRepository.metadata.targetName;
        auditEntry.targetTable = this.loanRepository.metadata.tableName;
        auditEntry.targetEntityId = dbLoan.id;
        auditEntry.targetEntityBody = '';
        this.auditService.audit(auditEntry);
      }

      return dbLoan.active === false;

    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
