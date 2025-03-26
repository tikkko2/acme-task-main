import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Company {
  id: string;
  name: string;
  description?: string;
  address?: string;
  employees?: any[];
  employeeCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/companies`).pipe(
      map(companies => companies.map(company => ({
        ...company,
        employeeCount: company.employees?.length || 0
      }))),
    );
  }

  getCompany(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/companies/${id}`).pipe(
      map(company => ({
        ...company,
        employeeCount: company.employees?.length || 0
      })),
    );
  }

  createCompany(company: Partial<Company>): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/companies`, company).pipe(
      map(company => ({
        ...company,
        employeeCount: company.employees?.length || 0
      })),
    );
  }

  updateCompany(id: string, company: Partial<Company>): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/companies/${id}`, company).pipe(
      map(company => ({
        ...company,
        employeeCount: company.employees?.length || 0
      })),
    );
  }

  deleteCompany(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/companies/${id}`);
  }

  searchCompanies(term: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.apiUrl}/companies/search/${term}`).pipe(
      map(companies => companies.map(company => ({
        ...company,
        employeeCount: company.employees?.length || 0
      }))),
    );
  }
}
