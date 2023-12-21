import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { classToPlain } from 'class-transformer';
import { I18nRequestScopeService } from 'nestjs-i18n';
import { PayrollService } from '../../collaborators/services/payroll.service';
import { Repository } from "typeorm";
import { AudityEntryDto } from '../../audit/interface/audit-entry.dto';
import { AuditService } from '../../audit/service/audit.service';
import { ProjectMember } from '../entity/project-member.entity';

@Injectable()
export class ProjectMemberService {

    constructor(
        @Inject('PROJECT_MEMBER_REPOSITORY')
        private projectMemberRepository: Repository<ProjectMember>,
        private readonly i18n: I18nRequestScopeService,
        private readonly auditService: AuditService,
        private readonly payrollService : PayrollService
    ) { }

    async findOne(id: number) : Promise<ProjectMember> {
        const result = await this.projectMemberRepository.findOne(id);
        return result;
    }
    
    async findWithIds(ids: number[]) : Promise<ProjectMember[]> {
        const result = await this.projectMemberRepository.findByIds(ids);
        return result;
    }

    async deleteOrphan(ids: number[]) : Promise<boolean> {
        const result = await this.projectMemberRepository.delete(ids);
        return result.affected > 0;
    }

    async changeMemberStatus(collaboratorId: number, functionCallingSecurity : string){

        let [dbProjectMember] = await this.projectMemberRepository
            .createQueryBuilder('projectMember')
            .leftJoinAndSelect('projectMember.project', 'project')
            .leftJoinAndSelect('projectMember.collaborator', 'collaborator')
            .leftJoinAndSelect('collaborator.payroll', 'payroll')
            .where('collaborator.id = :collaboratorId', {collaboratorId})
            .getMany()

        if (!dbProjectMember) {
            throw new NotFoundException(
                await this.i18n.translate('project_member.NOT_FOUND', {
                    args: { cid: collaboratorId },
                })
            );
        }

        let lastStatus = dbProjectMember.collaborator.active;
        if(functionCallingSecurity == 'DELETE' && lastStatus == true || functionCallingSecurity == 'ACTIVATE' && lastStatus == false){
            dbProjectMember.active = !lastStatus;
            this.payrollService.changePayrollStatus(collaboratorId, functionCallingSecurity);
            this.projectMemberRepository.save(dbProjectMember);
            return dbProjectMember.active === false;
        }
        
    }
    
    async removeProjectMember(projectId: number, collaboratorId: number, auditEntry: AudityEntryDto): Promise<void> {

        let dbProjectMember = await this.projectMemberRepository.findOne({
            where: {
                collaborator: collaboratorId,
                project: projectId
            }
        });

        if (!dbProjectMember) {
            throw new NotFoundException(
                await this.i18n.translate('project_member.NOT_FOUND', {
                    args: { pid: projectId, cid: collaboratorId },
                })
            );
        }

        await this.projectMemberRepository.delete(dbProjectMember.id);

        if (auditEntry) {
            auditEntry.actionType = 'DELETE';
            auditEntry.targetEntity = this.projectMemberRepository.metadata.targetName;
            auditEntry.targetTable = this.projectMemberRepository.metadata.tableName;
            auditEntry.targetEntityId = dbProjectMember.id;
            auditEntry.targetEntityBody = JSON.stringify(classToPlain(dbProjectMember));
            this.auditService.audit(auditEntry);
        }

        return;
    }


}
