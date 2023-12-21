import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Institute } from './institute.entity';

@Entity({ name: 'tb_report_year_plan' })
export class ReportYearPlan {
    @PrimaryGeneratedColumn({ name: 'id_report_year_plan' })
    id: number;

    @ManyToOne(type => Institute)
    @JoinColumn({ name: 'id_institute' })
    institute: Institute;

    @Column({ name: 'nm_year' })
    year: number;

    @Column({ name: 'nm_month' })
    month: number;

    @Column({ name: 'dt_start', type: 'date' })
    start: Date;

    @Column({ name: 'dt_end', type: 'date' })
    end: Date;

}