import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Company } from '../company/company.entity';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [MikroOrmModule.forFeature([User, Company]), CompanyModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
