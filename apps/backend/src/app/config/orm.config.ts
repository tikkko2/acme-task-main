import { LoadStrategy, PopulateHint } from '@mikro-orm/core';
import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { PostgreSqlOptions } from '@mikro-orm/postgresql/PostgreSqlMikroORM';
import { User }              from '../user/user.entity';

const user = 'postgres';
const port = 5432;
const password = 'postgres';
const dbName = 'acmedb';
const host = '127.0.0.1';

const ormConfig: PostgreSqlOptions = {
  driver: PostgreSqlDriver,
  user,
  password,
  host,
  dbName,
  port,
  schema: 'public',
  debug: true,
  entities: [
    User
  ],
  subscribers: [],
  multipleStatements: true,
  discovery: {
    disableDynamicFileAccess: true,
  },
  loadStrategy: LoadStrategy.JOINED,
  populateWhere: PopulateHint.INFER,
  preferTs: true,
  migrations: {
    snapshot: false,
  },
  autoJoinRefsForFilters: false,
  allowGlobalContext: true,
};

export default defineConfig(ormConfig);
