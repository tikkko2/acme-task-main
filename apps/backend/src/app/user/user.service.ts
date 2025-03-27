import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { CompanyRepository } from '../company/company.repository';
import { EntityManager } from '@mikro-orm/core';
import { Company } from '../company/company.entity';
import { UpdateUserDto } from './user.controller';

export interface UserInfoDto {
  id?: string;
  name: string;
  email: string;
  companyName?: string;
  relatedWorkers?: string[];
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: UserRepository,
    @InjectRepository(Company)
    private readonly companyRepository: CompanyRepository,
    private readonly em: EntityManager
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll({
      populate: ['company', 'relatedWorkers'],
    }) as Promise<User[]>;
  }

  async getUser(id: string): Promise<UserInfoDto> {
    return this.userRepository
      .findOne({ id }, { populate: ['company', 'relatedWorkers'] })
      .then((user) => {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          companyName: user.company?.name,
          relatedWorkers:
            user.relatedWorkers?.getItems().map((w) => w.id) || [],
        } as UserInfoDto;
      });
  }

  async create(userData: Partial<User>, companyId?: string): Promise<User> {
    const user = this.userRepository.create(userData);

    if (companyId) {
      const company = await this.companyRepository.findOne(companyId);
      if (company) {
        user.company = this.em.getReference<Company>(
          company.constructor.name as any,
          company.id
        ) as any;
      }
    }

    await this.em.persistAndFlush(user);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne(id, {
        populate: ['relatedWorkers'],
      });

      if (!user) {
        return null;
      }

      const { relatedWorkers, companyId, ...userData } = updateUserDto;

      this.em.assign(user, userData);

      if (companyId) {
        const company = await this.companyRepository.findOne(companyId);
        if (company) {
          user.company = this.em.getReference<Company>(
            company.constructor.name as any,
            company.id
          ) as any;
        }
      }

      if (relatedWorkers !== undefined) {
        await user.relatedWorkers.init();
        
        const currentWorkers = user.relatedWorkers.getItems();
        
        if (!relatedWorkers || relatedWorkers.length === 0) {
          for (const worker of currentWorkers) {
            await worker.relatedWorkers.init();
            worker.relatedWorkers.remove(user);
          }
          user.relatedWorkers.removeAll();
        } else {
          const workersToRemove = currentWorkers.filter(
            worker => !relatedWorkers.includes(worker.id)
          );

          for (const worker of workersToRemove) {
            await worker.relatedWorkers.init();
            worker.relatedWorkers.remove(user);
            user.relatedWorkers.remove(worker);
          }

          const workersToAdd = relatedWorkers.filter(
            workerId => !currentWorkers.some(worker => worker.id === workerId)
          );

          if (workersToAdd.length > 0) {
            const newWorkers = await this.userRepository.find({
              id: { $in: workersToAdd },
            });

            for (const worker of newWorkers) {
              await worker.relatedWorkers.init();
              user.relatedWorkers.add(worker);
              worker.relatedWorkers.add(user);
            }
          }
        }
      }

      await this.em.flush();
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async getPotentialCoworkers(userId: string): Promise<User[]> {
    const user = await this.userRepository.findOne(userId, {
      populate: ['company'],
    });
    if (!user || !user.company) {
      return [];
    }

    return this.userRepository.findAll({
      where: {
        company: user.company,
        id: { $ne: userId },
      },
    });
  }

  async addCoworker(userId: string, coworkerId: string): Promise<User | null> {
    const user = await this.userRepository.findOne(userId, {
      populate: ['relatedWorkers', 'company'],
    });

    const coworker = await this.userRepository.findOne(coworkerId, {
      populate: ['relatedWorkers', 'company'],
    });

    if (!user || !coworker || user.company?.id !== coworker.company?.id) {
      return null;
    }

    user.relatedWorkers.add(coworker);
    coworker.relatedWorkers.add(user);
    await this.em.flush();

    return user;
  }

  async removeCoworker(
    userId: string,
    coworkerId: string
  ): Promise<User | null> {
    const user = await this.userRepository.findOne(userId, {
      populate: ['relatedWorkers'],
    });

    const coworker = await this.userRepository.findOne(coworkerId, {
      populate: ['relatedWorkers'],
    });

    if (!user || !coworker) {
      return null;
    }

    user.relatedWorkers.remove(coworker);
    coworker.relatedWorkers.remove(user);
    await this.em.flush();

    return user;
  }

  async remove(id: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne(id);
      if (!user) {
        return false;
      }

      await this.em.removeAndFlush(user);
      return true;
    } catch (error) {
      return error;
    }
  }
}
