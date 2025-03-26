import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { User, UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { AddUserComponent } from './add-user/add-user.component';
import { CompanyService } from '../../services/company.service';

@Component({
  imports: [
    MatIconModule,
    RouterModule,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';

  constructor(
    private userService: UserService,
    private companyService: CompanyService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.error = '';

    this.companyService.getCompanies().subscribe({
      next: (companies) => {
        this.userService.getUsers().subscribe({
          next: (response) => {
            this.users = response.map(user => {
              if (user.company) {
                const company = companies.find(c => c.id === user.company?.id);
                if (company) {
                  user.company = company;
                }
              }
              return user;
            });
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching users:', error);
            this.error = 'Failed to load users. Please try again later.';
            this.showNotification('Error loading users', 'error');
            this.loading = false;
          },
        });
      },
      error: (error) => {
        console.error('Error fetching companies:', error);
        this.error = 'Failed to load companies. Please try again later.';
        this.showNotification('Error loading companies', 'error');
        this.loading = false;
      },
    });
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe(
        () => {
          this.showNotification('User deleted successfully', 'success');
          this.fetchUsers();
        },
        (error) => {
          this.showNotification(error || 'Failed to delete user', 'error');
        }
      );
    }
  }

  getCoworkerNames(coworkers: User[] | undefined): string {
    if (!coworkers || coworkers.length === 0) {
      return 'None';
    }

    return coworkers.map((coworker) => coworker.name).join(', ');
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }

  openDialog(user?: User): void {
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: { id: user?.id, user: user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showNotification('User updated successfully', 'success');
        this.fetchUsers();
      }
    });
  }
}
