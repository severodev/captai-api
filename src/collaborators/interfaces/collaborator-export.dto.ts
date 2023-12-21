import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CollaboratorExportDto {
  @IsInt()
  @ApiProperty({ example: '1', description: 'Collaborator ID' })
  id: number;

  @IsString()
  @ApiProperty({ example: 'Murilo Barata', description: 'Collaborator name' })
  name: string;

  socialName: string;

  @IsString()
  @ApiProperty({ example: '000.000.000-00', description: 'Collaborator CPF' })
  cpf: string;

  rg: string;

  rgEmitter: string;

  pis?: string;

  maritalStatus: string;

  nationality: string;

  birthDate: string;

  email: string;

  personalEmail: string;

  phone: string;

  motherName?: string;

  fatherName?: string;

  address: string;

  neighbourhood?: string;

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

  academicDegree?: string;

  educationalInstitution?: string;

  lattes?: string;

  gender?: string;

  dependents?: number;

  benefits?: string;

  payRoll?: string;
}
