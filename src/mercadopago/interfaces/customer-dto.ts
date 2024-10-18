export interface CustomerDto {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    liveMode?: boolean;
    dateRegistered?: string;
    cards?: any[] ;
  }