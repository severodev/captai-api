import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DocumentCategory } from '../entity/document-category.entity';

@Injectable()
export class DocumentCategoryService {

    constructor(
        @Inject('DOCUMENT_CATEGORY_REPOSITORY')
        private documentCategoryRepository: Repository<DocumentCategory>,
    ) { }

    async findById(id: number): Promise<DocumentCategory> {
        return await this.documentCategoryRepository.findOne(id);
    }

}
