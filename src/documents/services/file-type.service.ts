import { Inject, Injectable } from '@nestjs/common';
import { FindOneOptions, Raw, Repository } from 'typeorm';
import { FileType } from '../entity/file-type.entity';

@Injectable()
export class FileTypeService {

    constructor(
        @Inject('FILE_TYPE_REPOSITORY')
        private fileTypeRepository: Repository<FileType>,
    ) { }

    async findByMimeType(mime: string): Promise<FileType> {
        const filters = <FindOneOptions<FileType>>{           
           where : {
                acceptedMimes: Raw(alias => `${alias} ilike '%${mime}%'`)
           }
        };        
        return this.fileTypeRepository.findOne(filters);
    }

}
