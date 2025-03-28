import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import { CompanyRepository } from '../company/company.repository';
import { EntityManager } from '@mikro-orm/core';
import { Company } from '../company/company.entity';
import { UserInfoDto, UpdateUserDto } from '../interfaces/user.interface';

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
      // Find the user to be updated
      const user = await this.userRepository.findOne(id, {
        populate: ['relatedWorkers'],
      });
      
      if (!user) {
        return null;
      }
  
      // Extract relatedWorkers and companyId from the update DTO
      const { relatedWorkers: newRelatedWorkerIds, companyId, ...userData } = updateUserDto;
  
      // Update basic user data
      this.em.assign(user, userData);
  
      // Update company if provided
      if (companyId) {
        const company = await this.companyRepository.findOne(companyId);
        if (company) {
          user.company = this.em.getReference<Company>(
            company.constructor.name as any, 
            company.id
          ) as any;
        }
      }
  
      // Handle related workers if provided in the DTO
      if (newRelatedWorkerIds !== undefined) {
        await this.updateRelatedWorkers(user, newRelatedWorkerIds);
      }
  
      // Persist changes and flush to database
      this.em.persist(user);
      await this.em.flush();
  
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  /**
   * Updates bidirectional relationships between a user and their related workers
   */
  private async updateRelatedWorkers(user: User, newRelatedWorkerIds: string[]): Promise<void> {
    // Initialize the user's relatedWorkers collection
    await user.relatedWorkers.init();
    
    // Get current related worker IDs
    const currentRelatedWorkerIds = user.relatedWorkers.getItems().map(worker => worker.id);
    
    // Calculate which relationships to add and remove
    const workerIdsToAdd = newRelatedWorkerIds?.filter(id => !currentRelatedWorkerIds.includes(id)) || [];
    const workerIdsToRemove = currentRelatedWorkerIds.filter(id => !newRelatedWorkerIds?.includes(id));
    
    // Process removals
    if (workerIdsToRemove.length > 0) {
      const workersToRemove = user.relatedWorkers.getItems().filter(
        worker => workerIdsToRemove.includes(worker.id)
      );
      
      for (const worker of workersToRemove) {
        await worker.relatedWorkers.init();
        
        // Ensure we remove the relationship from both sides
        worker.relatedWorkers.remove(user);
        user.relatedWorkers.remove(worker);
        
        // Make sure to persist each worker individually
        this.em.persist(worker);
      }
      
      // Explicitly verify that the relationship was removed
      for (const workerId of workerIdsToRemove) {
        const worker = await this.userRepository.findOne(workerId);
        if (worker) {
          await worker.relatedWorkers.init();
          if (worker.relatedWorkers.contains(user)) {
            worker.relatedWorkers.remove(user);
            this.em.persist(worker);
          }
        }
      }
    }
    
    // Process additions
    if (workerIdsToAdd.length > 0) {
      const workersToAdd = await this.userRepository.find({
        id: { $in: workerIdsToAdd },
      });
      
      for (const worker of workersToAdd) {
        await worker.relatedWorkers.init();
        
        // Add bidirectional relationship
        worker.relatedWorkers.add(user);
        user.relatedWorkers.add(worker);
        
        this.em.persist(worker);
      }
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
