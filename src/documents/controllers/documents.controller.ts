/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BadRequestException, Controller, Delete, Get, NotFoundException, Param, Post, Query, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from '@nestjs/swagger';
import * as filesize from "filesize";
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FileManagementService } from '../../filemanagement/services/filemanagement.service';
import { Roles } from '../../roles/roles.decorator';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { CreateDocumentDto } from '../interfaces/create-document.dto';
import { DocumentTypeDto } from '../interfaces/document-type.dto';
import { DocumentDto } from '../interfaces/document.dto';
import { DocumentTypeService } from '../services/document-type.service';
import { DocumentsService } from '../services/documents.service';
import { FileTypeService } from '../services/file-type.service';
import { I18nContext } from 'nestjs-i18n';

@UseGuards(JwtAuthGuard)
@ApiTags('Documents')
@Controller('documents')
@UseFilters(AllExceptionsFilter)
export class DocumentsController {

    constructor(private readonly documentsService: DocumentsService,
        private readonly documentTypeService: DocumentTypeService,
        private readonly fileTypeService: FileTypeService,
        private readonly fileManagementService: FileManagementService,
    ) { }

    @Get('type/dropdown')
    dropdown(@Query('category') category: number): Promise<DocumentTypeDto[]> {
        return this.documentTypeService.dropdown(category);
    }

    @Post('upload/type/:id')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any, @Param('id') typeId): Promise<DocumentDto> {

        // {
        //     fieldname: 'file',
        //     originalname: 'Utilization Report.pdf',
        //     encoding: '7bit',
        //     mimetype: 'application/pdf',
        //     size: 26547
        // }

        const documentType = await this.documentTypeService.findById(typeId);
        const maxSize = documentType.maxSize ? documentType.maxSize : parseInt(process.env.MAX_SIZE_UPLOAD);
        if (file.size > maxSize) {
            throw new BadRequestException(
                await I18nContext.current().translate('document.VALIDATION.MAX_SIZE_EXCEDED', {
                    args: { maxSize: filesize.filesize(maxSize) },
                })
            );
        }

        let fileType = await this.fileTypeService.findByMimeType(file.mimetype);
        if(!fileType){
            fileType = await this.fileTypeService.findByMimeType('UNKNOWN');
        }

        const destinatinPath = `${documentType.documentCategory.directory}/${documentType.key}`;
        const uploadResult: any = await this.fileManagementService.singleFileUpload(file, destinatinPath);

        const createDocumentDto = <CreateDocumentDto>{
            filename: file.originalname,
            url: uploadResult.Location,
            documentType: documentType,
            fileType: fileType,
            size: file.size,
            // TODO: create specific field for mimetype instead of using notes field
            notes: file.mimetype
        };

        const savedDocumentDto = await this.documentsService.create(createDocumentDto);
        return savedDocumentDto;
    }

    @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @Delete(':id')
    async delete(@Param('id') id): Promise<boolean> {

        const document = await this.documentsService.findOne(id);
        if (!document) {
            throw new NotFoundException(
                await I18nContext.current().translate('document.NOT_FOUND', {
                    args: { id: id },
                })
            );
        }

        const deletedOnS3 = await this.fileManagementService.deleteFile(document.url);
        if (deletedOnS3) {
            return await this.documentsService.delete(id);
        } else {
            throw new NotFoundException(
                await I18nContext.current().translate('document.ERROR_DELETE_S3', {
                    args: { id: document.id, url: document.url },
                })
            );
        }

    }

}
