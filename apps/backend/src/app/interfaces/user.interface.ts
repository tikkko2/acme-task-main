export interface UserInfoDto {
  id?: string;
  name: string;
  email: string;
  companyName?: string;
  relatedWorkers?: string[];
}

export interface CreateUserDto {
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

export interface CreateCompanyDto {
  name: string;
  description?: string;
  address?: string;
}