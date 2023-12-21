import { Project } from "../../../projects/entity/project.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'tb_contribution' })
export class Contribution {
    @PrimaryGeneratedColumn({ name: 'id_contribution' })
    id: number;

    @Column({ name: 'st_active', type: 'bool', default: true })
    active: boolean;

    @Column({ name: 'dt_receipt', type: 'date' })
    receiptDate: Date;

    @Column({ name: 'nm_amount', type: 'float', nullable: true })
    amount: number;

    @Column({ name: 'ds_confirmation_of_receive', type: 'bool', default: false})
    confirmationOfReceive: boolean;

    @Column({ name: 'st_transfer', type: 'boolean', nullable: true })
    isTranfer?: boolean;

    @Column({ name: 'dt_tranfer', type: 'date', nullable: true})
    transferDate?: Date;
    
    @ManyToOne(type => Project, { nullable: true })
    @JoinColumn({ name: 'id_project' })
    project: Project;
}
