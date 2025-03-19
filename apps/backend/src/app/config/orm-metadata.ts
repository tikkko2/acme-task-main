import { MetadataStorage, MikroORM, Options } from '@mikro-orm/core';
import { Dictionary, EntityMetadata } from '@mikro-orm/core/typings';
import { PostgreSqlDriver } from '@mikro-orm/postgresql/PostgreSqlDriver';

export class OrmMetadata {
  static metadata: Dictionary<EntityMetadata>;
  static metadataStorage: MetadataStorage;
  static orm: MikroORM;

  static async init(config: Options<PostgreSqlDriver>) {
    this.orm = await MikroORM.init(config);

    this.metadataStorage = this.orm.em.getMetadata();
    this.metadata = this.metadataStorage.getAll();
  }

  static async synchronizeDbSchema() {
    const generator = this.orm.getSchemaGenerator();
    await generator.updateSchema({
      // safe: true,
    });
  }

  static async runMigartions() {
    await this.orm.getMigrator().up();
  }
}
