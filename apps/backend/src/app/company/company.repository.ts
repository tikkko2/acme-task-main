import { EntityRepository } from '@mikro-orm/postgresql';
import { Company } from './company.entity';

export class CompanyRepository extends EntityRepository<Company> {}
