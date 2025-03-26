import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyService } from '../../../services/company.service';

interface DialogData {
  companyId?: string;
}

@Component({
  selector: 'app-add-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-company.component.html',
})
export class AddCompanyComponent implements OnInit {
  companyForm: FormGroup;
  companyId: string | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private dialogRef: MatDialogRef<AddCompanyComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private data: DialogData
  ) {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.companyId = this.data?.companyId || null;
    this.isEditMode = !!this.companyId;

    if (this.isEditMode && this.companyId) {
      this.loadCompanyData(this.companyId);
    }
  }

  loadCompanyData(id: string): void {
    this.loading = true;
    this.error = '';

    this.companyService.getCompany(id).subscribe({
      next: (company) => {
        this.companyForm.patchValue({
          name: company.name,
          description: company.description,
          address: company.address,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading company:', error);
        this.error = 'Error loading company data';
        this.showNotification('Error loading company data', 'error');
        this.loading = false;
      },
    });
  }

  saveCompany(): void {
    if (this.companyForm.get('name')?.invalid) {
      return;
    }

    this.submitting = true;
    this.error = '';
    const companyData = this.companyForm.value;

    if (this.isEditMode && this.companyId) {
      this.companyService.updateCompany(this.companyId, companyData).subscribe({
        next: (company) => {
          if (company) {
            this.dialogRef.close(company);
          } else {
            this.error = 'Failed to update company';
          }
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error updating company:', error);
          this.error = 'Error updating company';
          this.submitting = false;
        },
      });
    } else {
      this.companyService.createCompany(companyData).subscribe({
        next: (company) => {
          this.dialogRef.close(company);
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error creating company:', error);
          this.error = 'Error creating company';
          this.submitting = false;
        },
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass:
        type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
    });
  }
}
