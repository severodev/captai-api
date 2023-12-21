import { DocumentCategoryDto } from "./document-category.dto";

export interface DocumentTypeDto {
    id: number;
    name: string;
    category: DocumentCategoryDto;
}