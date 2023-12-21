import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Institute } from '../../institutes/entity/institute.entity';
import { Project } from '../../projects/entity/project.entity';
import { BenefitType } from './benefit-type.entity';

@Entity({ name: 'tb_benefit' })
export class Benefit {

  @PrimaryGeneratedColumn({ name: 'id_benefit' })
  id: number;

  @ManyToOne(type => BenefitType, { eager: true })
  @JoinColumn({ name: 'id_benefit_type' })
  benefitType: BenefitType;

  @ManyToOne(type => Institute)
  @JoinColumn({ name: 'id_institute' })
  institute: Institute;

  @ManyToOne(type => Project)
  @JoinColumn({ name: 'id_project' })
  project: Project;

  @Column({ name: 'ds_description', length: 250, nullable: true })
  description: string;

  @Column({ name: 'ds_comment', length: 250, nullable: true })
  comments: string;

  @Column({ name: 'nm_amount_value', type: 'float', nullable: true })
  amountValue: number;

  @Column({ name: 'tp_amount_type', length: 15, nullable: true  })
  amountType: string;

  @Column({ name: 'nm_deduction_value', type: 'float', nullable: true })
  deductionValue: number;

  @Column({ name: 'tp_deduction_type', length: 15, nullable: true  })
  deductionType: string;

  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

  toString(): string {
    const value = this.amountType == 'R$' ?  `${this.amountType} ${this.amountValue}` : `${this.amountValue} ${this.amountType}`;
    const deduction = this.deductionType == 'R$' ?  `- ${this.deductionType} ${this.deductionValue}` : `- ${this.deductionValue} ${this.deductionType}`;
    return `${this.benefitType.name} (${value}, ${deduction})`;
}

}