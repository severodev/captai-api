import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity({ name: 'tb_project_extension' })
export class ProjectExtension {

    constructor(_id?: number){
        if(_id){
            this.id = _id;
        }
    }

    @PrimaryGeneratedColumn({ name: 'id_project_extension' })
    id: number;

    @ManyToOne(type => Project)
    @JoinColumn({ name: 'id_project' })
    project: Project;

    @Column({ name: 'st_active', type: 'bool', default: true })
    active: boolean;

    @Column({ name: 'dt_start', type: 'date' })
    start: Date;

    @Column({ name: 'dt_end', type: 'date' })
    end: Date;

    @Column({ name: 'nm_total_value', type: 'float' })
    totalValue: number;

    @Column({ name: 'nm_monthly_value', type: 'float', nullable: true })
    monthlyValue: number;


}