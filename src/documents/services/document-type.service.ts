import { Inject, Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { DocumentType } from "../entity/document-type.entity";
import { DocumentTypeDto } from '../interfaces/document-type.dto';

@Injectable()
export class DocumentTypeService {

    constructor(        
        @Inject('DOCUMENT_TYPE_REPOSITORY')
        private documentTypeRepository: Repository<DocumentType>        
    ) { }

    async dropdown(categoryId: number): Promise<DocumentTypeDto[]> {
        const filters = <FindManyOptions>{
            relations: ["documentCategory"],
            order: {
                name: "ASC",
            }
        };
        if (categoryId && categoryId > 0) {
            filters.where = {
                documentCategory: {
                    id: categoryId
                }
            }
        }
        return (await this.documentTypeRepository.find(filters))
            .map(d => <DocumentTypeDto>{
                id: d.id,
                name: d.name,
                category: {
                    id: d.documentCategory.id,
                    name: d.documentCategory.name
                }
            });
    }

    async findById(id: number): Promise<DocumentType> {
        return await this.documentTypeRepository.findOne(id, { relations: ['documentCategory']});
    }

    async findByKey(_key: string): Promise<DocumentType> {
        return await this.documentTypeRepository.findOne({ where: { key: _key }, relations: ['documentCategory']});
    }
}
