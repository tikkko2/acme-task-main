import {
  BaseEntity,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { UserRepository } from './user.repository';
import { Company } from '../company/company.entity';
import { Collection } from '@mikro-orm/core';

@Entity({ repository: () => UserRepository })
export class User extends BaseEntity {
  @PrimaryKey()
  id: string = v4();

  @Property()
  name: string;

  @Property({ nullable: true })
  position: string | null;

  @Property({ unique: true })
  email: string;

  @Property({ nullable: true })
  address: string | null;

  @ManyToOne(() => Company, { nullable: true })
  company?: Company;

  @ManyToMany(() => User, (user) => user.coworkers, { owner: true })
  relatedWorkers = new Collection<User>(this);

  @ManyToMany(() => User, (user) => user.relatedWorkers, {
    mappedBy: 'relatedWorkers',
  })
  coworkers = new Collection<User>(this);
}
