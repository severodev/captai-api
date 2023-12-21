
export class AudityEntryDto {

    userId: number;

    userRole?: string;

    userProfile?: string;
  
    actionType: string;
  
    actionDescription?: string;
    
    targetTable: string;  
    
    targetEntity: string;

    targetEntityId: number;  
  
    targetEntityBody?: string;
  
    errorType?: string;
    
    errorDescription?: string;

}