import { HttpService, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment-business-days';
import 'moment/locale/pt-br';
import { Repository } from 'typeorm';
import { AudityEntryDto } from '../../audit/interface/audit-entry.dto';
import { AuditService } from '../../audit/service/audit.service';
import { Collaborator } from '../../collaborators/entity/collaborator.entity';
import { CollaboratorMonthlyReportDto } from '../../collaborators/interfaces/collaborator-monthly-report.dto';
import { CollaboratorsService } from '../../collaborators/services/collaborators.service';
import { DocumentTypeService } from '../../documents/services/document-type.service';
import { FileManagementService } from '../../filemanagement/services/filemanagement.service';
import { Project } from '../../projects/entity/project.entity';
import { ProjectsService } from '../../projects/services/projects.service';
import { ReportYearPlan } from '../entity/report-year-plan.entity';
import { InstitutesService } from './institutes.service';

moment.locale('pt-br');

var Docxtemplater = require("docxtemplater");
var PizZip = require('pizzip');
@Injectable()
export class InstituteReportService {

    private MONTHLY_REPORT_KEY = 'RELATORIO_BOLSA';

    constructor(
        @Inject('REPORT_YEAR_PLAN_REPOSITORY')
        private instituteMRPRepository: Repository<ReportYearPlan>,
        private readonly collaboratorService: CollaboratorsService,
        private readonly instituteService: InstitutesService,
        private readonly projectService: ProjectsService,
        private readonly fileManagementService: FileManagementService,
        private readonly documentTypeService: DocumentTypeService,
        private httpService: HttpService,
        private readonly auditService: AuditService
    ) {

    }

    async currentReportLink(idInstitute: number): Promise<string> {
        return (await this.instituteService.findOne(idInstitute)).monthlyReportUrl;
    }

    async generateMonthlyReport(collaboratorMonthlyReport: CollaboratorMonthlyReportDto, auditEntry: AudityEntryDto): Promise<any> {

        const project = await this.projectService.findOne(collaboratorMonthlyReport.idProject);
        const collaborator = await this.collaboratorService.findOne(collaboratorMonthlyReport.idCollaborator);
        const reportPath = await this.generateFile(project, collaborator, collaboratorMonthlyReport, auditEntry);

        return { path: reportPath };
    }

    private async generateFile(project: Project, collaborator: Collaborator, reportDto: CollaboratorMonthlyReportDto, auditEntry: AudityEntryDto) {

        const current = moment();
        const plan = await this.instituteMRPRepository.findOne({ where: { 
                year: current.year(), month: current.month() + 1 ,
                institute: project.institute.id
            } 
        });

        if(!plan){
            throw new InternalServerErrorException('Plano de datas de relatório não encontrado para esse Instituto no Ano/Mês atual. Entre em contato com a equipe de Administração e RH.');
        }
        
        const reportData = {
            fullname: collaborator.name,
            rg: collaborator.rg,
            cpf: collaborator.cpf,
            activities: reportDto.activities.split('\n').map(act => ({ description: act })),
            report_month: current.format('MMMM'),
            report_month_abbr: current.format('MMM').toUpperCase(),
            report_year: current.format('YYYY'),
            period_start: moment(plan.start).format('DD/MM/YYYY'),
            period_end: moment(plan.end).format('DD/MM/YYYY'),
            signature_day: current.format('DD'),
            signature_month: current.format('MMMM'),
            signature_year: current.format('YYYY')
        };

        const content = await this.httpService.request({ method: 'GET', url: project.institute.monthlyReportUrl, responseType: 'arraybuffer' })
            .toPromise()
            .then(res => res.data)
            .catch(err => this.errorHandler(err));

        var zip = new PizZip(Buffer.from(content, 'binary'));
        var doc = new Docxtemplater().loadZip(zip);
        doc.setData(
            reportData
        );
        try {
            doc.render();
        } catch (error) {
            function replaceErrors(key, value) {
                if (value instanceof Error) {
                    return Object.getOwnPropertyNames(value).reduce(function (
                        error,
                        key
                    ) {
                        error[key] = value[key];
                        return error;
                    },
                        {});
                }
                return value;
            }
            console.log(JSON.stringify({ error: error }, replaceErrors));

            if (error.properties && error.properties.errors instanceof Array) {
                const errorMessages = error.properties.errors
                    .map(function (error) {
                        return error.properties.explanation;
                    })
                    .join("\n");
                console.log("errorMessages", errorMessages);
            }
            throw error;
        }

        var buf = doc.getZip()
            .generate({ type: 'nodebuffer' });

        const filename = ` Relatório Atividades - ${project.name} - ${reportData.fullname} [${current.format('MMM YYYY').toUpperCase()}].docx`;

        const documentType = await this.documentTypeService.findByKey(this.MONTHLY_REPORT_KEY);
        let s3Path = `${documentType.documentCategory.directory}`;

        // Path variables filling
        // _CAPTIA_TEMP_COLLABORATOR_ID_/relatorio/_CAPTIA_TEMP_INSTITUTE_ID_/_CAPTIA_TEMP_PROJECT_ID_/_CAPTIA_TEMP_YEAR_/_CAPTIA_TEMP_MONTH_
        s3Path = s3Path.replace(/_CAPTIA_TEMP_COLLABORATOR_ID_/g, collaborator.id.toString());
        s3Path = s3Path.replace(/_CAPTIA_TEMP_INSTITUTE_ID_/g, `${project.institute.id.toString()}_${project.institute.abbreviation}`);
        s3Path = s3Path.replace(/_CAPTIA_TEMP_PROJECT_ID_/g, `${project.id.toString()}_${project.name}`);
        s3Path = s3Path.replace(/_CAPTIA_TEMP_YEAR_/g, current.format('YYYY'));
        s3Path = s3Path.replace(/_CAPTIA_TEMP_MONTH_/g, current.format('MM'));

        const result: any = await this.fileManagementService.byteFileUpload(buf, s3Path, filename);

        // Saving in the database
        if (result.Location) {
            reportDto.year = current.year();
            reportDto.month = current.month() + 1;
            reportDto.url = result.Location;
            this.collaboratorService.saveMonthlyReport(reportDto, auditEntry);
        }

        return result.Location;
    }

    private replaceErrors(key: any, value: any) {
        if (value instanceof Error) {
            return Object.getOwnPropertyNames(value).reduce(function (error, key) {
                error[key] = value[key];
                return error;
            }, {});
        }
        return value;
    }

    private errorHandler(error) {
        console.log(JSON.stringify({ error: error }, this.replaceErrors));

        if (error.properties && error.properties.errors instanceof Array) {
            const errorMessages = error.properties.errors.map(function (error) {
                return error.properties.explanation;
            }).join("\n");
            console.log('errorMessages', errorMessages);
        }
        throw error;
    }

    @Cron('0 15 8 * * 1-5')
    async sendReportReminders(){
        console.debug('Reminder for Report Filling Process... Every day in the week as 8:15 AM');
    }
}
