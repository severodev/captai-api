import { DocumentTypeDto } from "./document-type.dto";
import { FileTypeDto } from "./file-type.dto";

export class DocumentDto {
    id: number;
    documentType: DocumentTypeDto;
    fileType: FileTypeDto;
    filename: string;
    size?: string;
    created?: string;
    url?: string;
    icon?: string;
    iconHighContrast?: string;
}