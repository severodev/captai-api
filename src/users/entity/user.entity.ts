import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../../roles/role.entity';
import { Profile } from '../../profiles/entity/profile.entity';
import { Collaborator } from '../../collaborators/entity/collaborator.entity';
import { PasswordRecovery } from './password-recovery.entity';
import { Exclude, Transform, Type } from 'class-transformer';
import { FirstAccess } from './first-access.entity';
import { Segment } from 'src/segment/entity/segment.entity';
import { State } from 'src/location/entity/state.entity';
import { Activite } from 'src/activities/entity/Activite.entity';
import { Edital } from 'src/edital/entity/edital.entity';
import { Institution } from 'src/institution/entity/institution.entity';

@Entity({ name: 'tb_user' })
export class User {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  id: number;

  @Column({ name: 'ds_name', length: 50, nullable: true })
  name: string;

  @Column({ name: 'ds_last_name', length: 50, nullable: true })
  lastName: string;

  @Column({ name: 'ds_email', length: 150, default: '' })
  email: string;

  @Column({ name: 'ds_cpf_cnpj', length: 20, nullable: true})
  cpfCnpj: string;

  @Exclude()
  @Column({ name: 'ds_password', length: 255 })
  password: string;

  @Exclude()
  @Column({ name: 'ds_refresh_token', length: 255, nullable: true })
  refreshToken: string;

  @Column({ name: 'st_active', type: 'bool', default: false })
  active: boolean;

  @Column({ name: 'st_email_verified', type: 'bool', default: false })
  emailVerified : boolean;

  @Column({ name: 'st_terms_of_use_accepted', type: 'bool', default: true })
  acceptedTermsOfUse : boolean;

  @Column({ name: 'st_privacy_policy_accepted', type: 'bool', default: true })
  acceptedPrivacyPolicy : boolean;

  @Column({ name: 'ds_language', default: 'pt_BR' })
  language: string;

  @Column({ name: 'ds_profile_image_id', length: 50, nullable: true})
  profileImageId: string;

  @Column({ name: 'ds_subscription_id', length: 50, nullable: true})
  subscriptionId: string;

  @Column({ name: 'ds_background', nullable: true})
  background: string;

  @Column({ name: 'nm_target_value', nullable: true })
  targetValue: number;

  @Transform(obj => obj.key)
  @ManyToOne(type => State, { eager: true })
  @JoinColumn({ name: 'id_state' })
  state: State;

  @ManyToMany(type => Institution, { cascade: true })
  @JoinTable({
    name: 'tb_user_institutions',
    joinColumn: { name: 'id_user' },
    inverseJoinColumn: { name: 'id_institution' },
  })
  institutions: Institution[];

  @ManyToMany(type => Edital, { cascade: true, eager: true })
  @JoinTable({
    name: 'tb_user_edital',
    joinColumn: { name: 'id_user' },
    inverseJoinColumn: { name: 'id_edital' },
  })
  savedEditais: Edital[];

  @Exclude()
  @Column({ name: 'dt_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created: number;

  @Column({ name: 'dt_last_update', type: 'timestamp', nullable: true })
  lastUpdate: number;

  @ManyToOne(type => Role, { eager: true })
  @JoinColumn({ name: 'id_role' })
  role: Role;

  @Transform(obj => obj.key)
  @ManyToOne(type => Profile, { eager: true })
  @JoinColumn({ name: 'id_profile' })
  profile: Profile;
 
  @Transform(obj => obj.key)
  @OneToOne(type => Collaborator)
  @JoinColumn({ name: 'id_collaborator' })
  collaborator: Collaborator;

  @Exclude()
  @OneToMany(type => PasswordRecovery, passwordRecovery => passwordRecovery.user)
  @JoinColumn()
  passwordRecovery: PasswordRecovery[];

  @Exclude()
  @OneToMany(type => FirstAccess, firstAccess => firstAccess.user)
  @JoinColumn()
  firstAccess: FirstAccess[];

  @ManyToOne(type => Segment, { eager: true })
  @JoinColumn({ name: 'id_segment' })
  segment: Segment;

  @ManyToMany(() => State, state => state.User, { eager: true })
  @JoinTable({
    name: 'tb_user_abrangency',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'state_id',
      referencedColumnName: 'id'
    }
  })
  abrangency: State[];

  @ManyToMany(() => Activite, activite => activite.User, { eager: true })
  @JoinTable({
    name: 'tb_user_activites',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'activite_id',
      referencedColumnName: 'id'
    }
  })
  activite: Activite[];
}