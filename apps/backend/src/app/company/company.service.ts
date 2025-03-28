import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Company } from './company.entity';
import { CompanyRepository } from './company.repository';
import { CreateCompanyDto, UpdateUserDto } from '../interfaces/user.interface';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: CompanyRepository,
    private readonly em: EntityManager
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.em.create(Company, createCompanyDto);
    await this.em.persistAndFlush(company);
    return company;
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.findAll({ populate: ['employees'] });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne(id, {
      populate: ['employees'],
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateUserDto
  ): Promise<Company> {
    const company = await this.findOne(id);

    this.em.assign(company, updateCompanyDto);
    await this.em.flush();

    return company;
  }

  async remove(id: string): Promise<void> {
    const company = await this.findOne(id);
    await this.em.removeAndFlush(company);
  }
}
