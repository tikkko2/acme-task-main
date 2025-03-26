import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable  } from 'rxjs';
import { environment } from '../../environments/environment';
import { Company } from './company.service';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  position?: string;
  company?: Company;
  relatedWorkers?: User[];
  coworkers?: User[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  success: boolean;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/user`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user`, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/user/${id}`, user);
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/user/${id}`);
  }

  getPotentialCoworkers(userId: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/user/${userId}/potential-coworkers`);
  }

  addCoworker(userId: string, coworkerId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user/${userId}/coworkers`, { coworkerId });
  }

  removeCoworker(userId: string, coworkerId: string): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/user/${userId}/coworkers/${coworkerId}`);
  }
}
