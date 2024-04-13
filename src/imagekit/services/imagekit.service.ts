
import { Injectable } from '@nestjs/common';
import * as accents from "remove-accents";
import { ImageKitClient} from '@platohq/nestjs-imagekit';
import { file } from 'jszip';
import { FileObject, UploadResponse } from 'imagekit/dist/libs/interfaces';

@Injectable()
export class ImagekitService {

    private readonly CAPTI_ROOT = "captir/";
    private readonly PROFILE_ROOT = "profile/";    
    private readonly CAPTI_PROFILE_FOLDER_PAD = 8;

    constructor(private readonly imClient: ImageKitClient) { }

    async checkIfFileOrFolderExists(fullPath: string) : Promise<boolean> {
        const result = await this.imClient.listFiles({
            searchQuery : `name = ${fullPath}`
        });
        console.log(`Checando de arquivo/pasta existe: ${fullPath}`);
        console.log(`Resultado: ${result}`);
        return result.length > 0;
    }

    async listContent(fullPath: string) : Promise<FileObject[]> {
        const result: FileObject[] = await this.imClient.listFiles({
            searchQuery : `name="${fullPath}"`
        });
        console.log(`Listando conteúdo de : ${fullPath}`);
        console.log(`Resultado: ${result}`);
        return result;
    }

    async createFolder(folderName: string, parentFolder: string): Promise<boolean> {
        const normalizedFolderName = accents.remove(folderName).replace(/[ ]/g, '_');
        const result = await this.imClient.createFolder({
            folderName: normalizedFolderName,
            parentFolderPath: parentFolder
        });
        console.log(`Criando pasta em ${parentFolder} ${normalizedFolderName}`);
        console.log(`Resultado: ${result}`);
        return result != null;
    }
    
    async createProfileImageFolder(userId: string) : Promise<void> {
        const folderName = userId.padStart(this.CAPTI_PROFILE_FOLDER_PAD, '0');
        const parentFolderPath = this.CAPTI_ROOT + this.PROFILE_ROOT + folderName;
        if(await !this.checkIfFileOrFolderExists(parentFolderPath + folderName)){
            const result = await this.createFolder(folderName, parentFolderPath);
            console.log(`Criando pasta de imagem de perfil em ${parentFolderPath} ${folderName}`);
            console.log(`Resultado: ${result}`);
        }
    }

    private async uploadFile(file: any, fileName: string, path: string) : Promise<UploadResponse> {
        try {
            const result = await this.imClient.upload({
                file : file.buffer,
                fileName : fileName,
                folder: path
            });
            console.log(`Upload de arquivo ${fileName} em ${path}`);
            console.log(`Resultado: ${result}`);
    
            return result;
        } catch (error) {
            console.log(error);
        }
        return null;  
    }

    async uploadProfileImage(file: any, fileName: string, userId: string) : Promise<UploadResponse> {

        const path = this.CAPTI_ROOT + this.PROFILE_ROOT + userId.padStart(this.CAPTI_PROFILE_FOLDER_PAD, '0')
        const result = await this.uploadFile(file, fileName, path);
        
        return result;
    }

    async getFileUrl(fileId: string, thumbnail = "true") : Promise<string> {
        const result:FileObject = await this.imClient.getFileDetails(fileId);
        if(result){
            const createthumbnail = thumbnail && thumbnail.toLowerCase() === "true"
            // const transformations = createthumbnail ? [
            //     {"height" : "300"},
            //     {"quality": "80"},
            //     {"aspectRatio": "1:1"}
            // ] : [];
            // const transformedUrl = await this.imClient.url({
            //     path: result.filePath,
            //     transformation: transformations
            // });
            return createthumbnail ? result.url + "?tr=w-300,h-300,cm-pad_resize,bg-F3F3F3" : result.url;
        }
        return "";
    }
}
