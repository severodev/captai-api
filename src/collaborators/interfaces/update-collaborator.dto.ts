import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateDependentDto } from './create-dependent.dto';
import { CreatePayRollDto } from './create-payroll.dto';

export class UpdateCollaboratorDto {
  
  id?: number;

  @IsString()
  @ApiProperty({ example: 'Murilo Barata', description: 'Collaborator name' })
  name: string;

  socialName?: string;

  @IsString()
  @ApiProperty({ example: '000.000.000-00', description: 'Collaborator CPF' })
  cpf: string;

  rg?: string;

  rgEmitter?: string;

  identityDocumentType?: string;

  identityDocument?: string;

  pis?: string;

  maritalStatus: string;

  nationality: string;

  birthDate: string;

  email?: string;

  personalEmail: string;

  phone: string;

  motherName: string;

  fatherName?: string;

  address: string;

  neighbourhood: string;

  postalCode: string;

  state?: number;

  stateStr?: string;

  city?: number;

  cityStr?: string;

  emergencyContact1?: string;

  emergencyParentage1?: string;

  emergencyPhone1?: string;

  emergencyContact2?: string;

  emergencyParentage2?: string;

  emergencyPhone2?: string;

  jobTitle: string;

  activities?: string;

  academicDegree?: string;

  educationalInstitution?: string;

  lattes?: string;

  image?: string;

  gender?: string;

  documents?: number[];

  dependents?: CreateDependentDto[];

  benefits?: number[];

  payRoll?: CreatePayRollDto[];
}
