import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateDependentDto } from './create-dependent.dto';
import { CreatePayRollDto } from './create-payroll.dto';

export class UpdateAllPaymentsStatusDto {
  
  status: boolean;

  paymentIds: number[];

}
