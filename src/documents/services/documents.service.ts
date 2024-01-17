import { Inject, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Document } from '../entity/document.entity';
import { DocumentCategoryService } from './document-category.service';
import { CreateDocumentDto } from '../interfaces/create-document.dto';
import { DocumentDto } from '../interfaces/document.dto';
import { DocumentTypeService } from './document-type.service';
import * as filesize from "filesize";
import * as moment from 'moment';
import { FileTypeDto } from '../interfaces/file-type.dto';
import { DocumentTypeDto } from '../interfaces/document-type.dto';

@Injectable()
export class DocumentsService {

    constructor(
        @Inject('DOCUMENT_REPOSITORY')
        private documentRepository: Repository<Document>,
        private readonly documentCategoryService: DocumentCategoryService,
        private readonly documentTypeService: DocumentTypeService,

    ) { }

    async findOne(id: number): Promise<Document> {
        return await this.documentRepository.findOne({ where: {id}});
    }

    async findByIds(ids: number[]): Promise<Document[]> {
        return await this.documentRepository.find({ where: { id: In(ids) }, relations: ['documentType', 'fileType']});
    }
    
    async create(createDocumentDto: CreateDocumentDto): Promise<DocumentDto> {

        const newDocument = new Document();
        newDocument.filename = createDocumentDto.filename,
        newDocument.size = createDocumentDto.size;
        newDocument.documentType = createDocumentDto.documentType;
        newDocument.fileType = createDocumentDto.fileType;
        newDocument.url = createDocumentDto.url;
        newDocument.notes = createDocumentDto.notes;
        
        const savedDocument = await this.documentRepository.create(newDocument);
        await this.documentRepository.save(newDocument);

        return <DocumentDto>{
            id: newDocument.id,
            documentType: newDocument.documentType && <DocumentTypeDto>{
                id: newDocument.documentType.id,
                name: newDocument.documentType.name
            },
            fileType: newDocument.fileType && <FileTypeDto>{
                id: newDocument.fileType.id,
                name: newDocument.fileType.name
            },
            filename: newDocument.filename,
            size: filesize.filesize(newDocument.size),
            created: moment(newDocument.created).format('DD/MM/YYYY [às] HH:mm'),
            url: newDocument.url,
            icon: newDocument.fileType.icon,
            iconHighContrast: newDocument.fileType.iconHighContrast
        };
    }

    async delete(id: number): Promise<boolean> {
        const deleteResult = await this.documentRepository.delete(id);
        return deleteResult.raw > 0;
    }

}
