import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import ormConfig from './config/orm.config';
import { UserModule } from './user/user.module';

@Module({
  imports: [MikroOrmModule.forRoot(ormConfig), UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
