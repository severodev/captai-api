/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as filesize from "filesize";
import { I18nContext } from 'nestjs-i18n';
import { AllExceptionsFilter } from '../../_filters/all-exceptions.filter';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ImagekitService } from '../services/imagekit.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileObject } from 'imagekit/dist/libs/interfaces';
import { UsersService } from 'src/users/services/users.service';

@UseGuards(JwtAuthGuard)
@ApiTags('ImageKit.io')
@Controller('imagekit')
@UseFilters(AllExceptionsFilter)
export class ImagekitController {

    constructor(private readonly imagekitService: ImagekitService,
        private readonly userService: UsersService
    ) { }

    @Get('files')
    listFolder(@Query('path') path: string): Promise<FileObject[]> {
        return this.imagekitService.listContent(path);
    }

    @Get('fileUrl')
    getFile(@Query('fileId') fileId: string, @Query('thumbnail') thumbnail: string): Promise<string> {
        return this.imagekitService.getFileUrl(fileId, thumbnail);
    }

    @Post('updateProfileImage')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any, @Body() body:any): Promise<any> {

        const result = await this.imagekitService.uploadProfileImage(file, body.fileName, body.userId);
        if(result){
            await this.userService.updateProfileImage(+body.userId, result.fileId);
            const newUrl = await this.imagekitService.getFileUrl(result.fileId);
            return { newId: result.fileId, newUrl: newUrl };
        }

        return null;
    }

    // @Roles('ADMIN','GERENTE','COORDENADOR_ADM','ANALISTA_ADM','ASSISTENTE_ADM')
    @Delete(':fileId')
    async delete(@Param('fileId') fileId): Promise<boolean> {

        // const document = await this.documentsService.findOne(fileId);
        // if (!document) {
        //     throw new NotFoundException(
        //         await I18nContext.current().translate('document.NOT_FOUND', {
        //             args: { id: fileId },
        //         })
        //     );
        // }

        // const deletedOnS3 = await this.fileManagementService.deleteFile(document.url);
        // if (deletedOnS3) {
        //     return await this.documentsService.delete(fileId);
        // } else {
        //     throw new NotFoundException(
        //         await I18nContext.current().translate('document.ERROR_DELETE_S3', {
        //             args: { id: document.id, url: document.url },
        //         })
        //     );
        // }

        return false;
    }

}
