import { Project } from "../../../projects/entity/project.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'tb_loan' })
export class Loan {
    @PrimaryGeneratedColumn({ name: 'id_loan' })
    id: number;

    @Column({ name: 'st_active', type: 'bool', default: true })
    active: boolean;

    @Column({ name: 'dt_receipt', type: 'date', nullable: false })
    receiptDate: Date;

    @Column({ name: 'dt_return', type: 'date', nullable: true })
    returnDate: Date;

    @Column({ name: 'ds_confirmation_of_receive', type: 'bool', default: false})
    confirmationOfReceive: boolean;

    @Column({ name: 'dt_confirmation_of_loan', type: 'date', nullable: true })
    confirmationOfLoan: Date;

    @Column({ name: 'nm_amount', type: 'float', nullable: false })
    amount: number;

    @Column({ name: 'dt_devolution', type: 'date', nullable: true })
    devolutionDate: Date;

    @Column({ name: 'ds_confirmation_of_devolution', type: 'bool', default: false})
    confirmationOfDevolution: boolean;

    @ManyToOne(
        () => Project,
        project => project.loanCameOut,
    )
    @JoinColumn({ name : 'id_origin_project' })
    originProject : Project;

    @ManyToOne(
        () => Project,
        project => project.loanEntered,
    )
    @JoinColumn({ name : 'id_target_project' })
    targetProject : Project;

}
