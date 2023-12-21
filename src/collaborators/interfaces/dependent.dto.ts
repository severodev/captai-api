import { DocumentDto } from "./../../documents/interfaces/document.dto";

export class DependentDto {
    id: number;
    name: string;
    relationship: string;
    birthDate: string;
    documents?: DocumentDto[];
}