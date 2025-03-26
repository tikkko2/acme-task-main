import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyService, Company } from '../../services/company.service';
import { AddCompanyComponent } from './add-company/add-company.component';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './company.component.html',
})
export class CompanyComponent implements OnInit {
  companies: Company[] = [];
  loading = false;
  error = '';

  constructor(
    private companyService: CompanyService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchCompanies();
  }

  fetchCompanies(): void {
    this.loading = true;
    this.error = '';

    this.companyService.getCompanies().subscribe({
      next: (response) => {
        this.companies = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching companies:', error);
        this.error = 'Failed to load companies. Please try again later.';
        this.showNotification('Error loading companies', 'error');
        this.loading = false;
      },
    });
  }

  deleteCompany(companyId: string): void {
    if (confirm('Are you sure you want to delete this company?')) {
      this.companyService.deleteCompany(companyId).subscribe(
        () => {
          this.showNotification('Company deleted successfully', 'success');
          this.fetchCompanies(); 
        },
        (error) => {
          this.showNotification(error || 'Failed to delete company', 'error');
        }
      );
    }
  }

  getEmployeeCount(company: Company): string {
    if (company.employeeCount !== undefined) {
      return company.employeeCount.toString();
    }
    if (company.employees) {
      return company.employees.length.toString();
    }
    return '0';
  }

  openDialog(companyId?: string): void {
    const dialogRef = this.dialog.open(AddCompanyComponent, {
      width: '500px',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: { companyId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showNotification(
          companyId
            ? 'Company updated successfully'
            : 'Company added successfully',
          'success'
        );
        this.fetchCompanies();
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }
}
