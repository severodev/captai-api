import { ProjectDto } from "../../projects/interfaces/project.dto";

export class CostShareDto {
    
    id: number;    
    expense: number;
    project: ProjectDto;
    value: number;
}