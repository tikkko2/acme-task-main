import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { CompanyRepository } from '../company/company.repository';
import { EntityManager } from '@mikro-orm/core';
import { Company } from '../company/company.entity';

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
      populate: ['company', 'relatedWorkers']
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
          relatedWorkers: user.relatedWorkers?.getItems().map(w => w.id) || []
        } as UserInfoDto;
      });
  }

  async create(userData: Partial<User>, companyId?: string): Promise<User> {
    const user = this.userRepository.create(userData);

    if (companyId) {
      const company = await this.companyRepository.findOne(companyId);
      if (company) {
        // user.company = company;
        user.company = this.em.getReference<Company>(
          company.constructor.name as any,
          company.id
        ) as any;
      }
    }

    await this.em.persistAndFlush(user);
    return user;
  }

  async update(
    id: string,
    userData: Partial<User>,
    companyId?: string
  ): Promise<User | null> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      return null;
    }

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

    await this.em.flush();
    return user;
  }

  async getPotentialCoworkers(userId: string): Promise<User[]> {
    const user = await this.userRepository.findOne(userId, { populate: ['company'] });
    if (!user || !user.company) {
      return [];
    }

    return this.userRepository.findAll({
      where: {
        company: user.company,
        id: { $ne: userId }
      }
    });
  }

  async addCoworker(userId: string, coworkerId: string): Promise<User | null> {
    const user = await this.userRepository.findOne(userId, {
      populate: ['relatedWorkers', 'company'],
    });

    const coworker = await this.userRepository.findOne(coworkerId, {
      populate: ['company'],
    });

    if (!user || !coworker || user.company?.id !== coworker.company?.id) {
      return null;
    }

    user.relatedWorkers.add(coworker);
    await this.em.flush();

    return user;
  }

  async removeCoworker(userId: string, coworkerId: string): Promise<User | null> {
    const user = await this.userRepository.findOne(userId, {
      populate: ['relatedWorkers'],
    });

    if (!user) {
      return null;
    }

    const currentWorkers = user.relatedWorkers.getItems().filter(w => w.id !== coworkerId);
    
    user.relatedWorkers.removeAll();
    currentWorkers.forEach(worker => user.relatedWorkers.add(worker));
    
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
