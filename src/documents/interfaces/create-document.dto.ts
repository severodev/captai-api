import { DocumentType } from "../entity/document-type.entity";
import { FileType } from "../entity/file-type.entity";

export class CreateDocumentDto {
    documentType: DocumentType;
    fileType: FileType;
    filename: string;
    url: string;
    size: number;
    notes: string;
}