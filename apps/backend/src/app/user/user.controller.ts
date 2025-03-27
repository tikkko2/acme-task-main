import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserInfoDto } from './user.service';

interface CreateUserDto {
  name: string;
  email: string;
  position?: string;
  address?: string;
  companyId?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  position?: string;
  address?: string;
  companyId?: string;
  relatedWorkers?: string[];
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserInfoDto | null> {
    return this.userService.getUser(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const { companyId, ...userData } = createUserDto;
    return this.userService.create(userData, companyId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User | null> {
    const { ...userData } = updateUserDto;
    return this.userService.update(id, userData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    const result = await this.userService.remove(id);
    return { success: result };
  }

  @Post(':id/coworkers')
  async addCoworker(
    @Param('id') id: string,
    @Body() body: { coworkerId: string }
  ): Promise<User> {
    return this.userService.addCoworker(id, body.coworkerId);
  }

  @Delete(':id/coworkers/:coworkerId')
  async removeCoworker(
    @Param('id') id: string,
    @Param('coworkerId') coworkerId: string
  ): Promise<User> {
    return this.userService.removeCoworker(id, coworkerId);
  }

  @Get(':id/potential-coworkers')
  async getPotentialCoworkers(@Param('id') id: string): Promise<User[]> {
    return this.userService.getPotentialCoworkers(id);
  }
}
