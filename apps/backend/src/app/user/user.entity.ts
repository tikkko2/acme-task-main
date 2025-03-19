import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 }             from 'uuid';
import { UserRepository } from './user.repository';

@Entity({ repository: () => UserRepository })
export class User extends BaseEntity {
  @PrimaryKey()
  id: string = v4();

  @Property()
  name: string;

  @Property({ nullable: true })
  position: string | null;
}
