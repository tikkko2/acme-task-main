import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User, UserService } from '../../../services/user.service';
import { CompanyService, Company } from '../../../services/company.service';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

interface DialogData {
  id?: string;
  user?: User;
}

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
})
export class AddUserComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  companyLoading = false;
  error = '';
  companies: Company[] = [];
  potentialCoworkers: User[] = [];
  isNewCompany = false;
  editMode = false;
  userId: string | null = null;
  companyId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private companyService: CompanyService,
    private dialogRef: MatDialogRef<AddUserComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private data: DialogData
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      companyId: [''],
      newCompany: [''],
      relatedWorkers: [[]],
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.editMode = true;
      this.userId = this.data.id;

      if (this.data.user) {
        this.populateForm(this.data.user);
      } else {
        this.loading = true;
        this.userService.getUser(this.data.id).subscribe({
          next: (userData) => {
            this.populateForm(userData);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error fetching user data:', error);
            this.error = 'Failed to load user data.';
            this.loading = false;
          },
        });
      }
    }

    this.fetchCompanies();
  }

  fetchCompanies(): void {
    this.companyLoading = true;
    this.companyService
      .getCompanies()
      .pipe(
        catchError((error) => {
          console.error('Error fetching companies:', error);
          return of([]);
        })
      )
      .subscribe((companies) => {
        this.companies = companies;
        this.companyLoading = false;
      });
  }

  onCompanyChange(): void {
    const companyId = this.userForm.get('companyId')?.value;
    if (companyId) {
      this.companyLoading = true;
      const selectedCompany = this.companies.find((c) => c.id === companyId);
      if (selectedCompany?.employees) {
        this.potentialCoworkers = selectedCompany.employees.filter(
          (employee) => !this.editMode || employee.id !== this.userId
        );
      } else {
        this.potentialCoworkers = [];
      }
      this.companyLoading = false;
    }
  }

  toggleWorker(workerId: string) {
    const currentRelatedWorkers = [
      ...(this.userForm.get('relatedWorkers')?.value || []),
    ];
    const index = currentRelatedWorkers.indexOf(workerId);

    let updatedWorkers = [];

    if (index === -1) {
      updatedWorkers = [...currentRelatedWorkers, workerId];
    } else {
      updatedWorkers = currentRelatedWorkers.filter((id) => id !== workerId);
    }

    this.userForm.patchValue({ relatedWorkers: updatedWorkers });
  }

  populateForm(user: User): void {
    const relatedWorkers =
      user.relatedWorkers?.map((worker) => worker.id) || [];

    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      companyId: user.company?.id || '',
      relatedWorkers: relatedWorkers,
    });

    if (user.company && user.company.id) {
      this.companyId = user.company.id;
      if (this.companies.length === 0) {
        this.companyService.getCompany(user.company.id).subscribe({
          next: (company) => {
            if (!this.companies.find((c) => c.id === company.id)) {
              this.companies.push(company);
            }
            this.onCompanyChange();
          },
          error: (error) => {
            console.error('Error fetching company:', error);
          },
        });
      } else {
        this.onCompanyChange();
      }
    }
  }

  toggleNewCompany(): void {
    this.isNewCompany = !this.isNewCompany;
    if (this.isNewCompany) {
      this.userForm.get('companyId')?.setValue('');
      this.userForm.get('newCompany')?.setValidators([Validators.required]);
    } else {
      this.userForm.get('newCompany')?.setValue('');
      this.userForm.get('newCompany')?.clearValidators();
    }
    this.userForm.get('newCompany')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;
      this.error = '';

      const formData = this.userForm.value;
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        companyId: formData.companyId,
        relatedWorkers: formData.relatedWorkers || [],
      };
      console.log('Submitting user data:', userData);
      if (this.editMode && this.userId) {
        this.userService.updateUser(this.userId, userData).subscribe({
          next: (updatedUser) => {
            this.snackBar.open('User updated successfully', 'Close', {
              duration: 3000,
            });
            this.dialogRef.close(updatedUser);
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.error = 'Failed to update user.';
          },
          complete: () => {
            this.loading = false;
          },
        });
      } else {
        this.userService.createUser(userData).subscribe({
          next: (newUser) => {
            this.snackBar.open('User created successfully', 'Close', {
              duration: 3000,
            });
            this.dialogRef.close(newUser);
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.loading = false;
            this.error = 'Email already exists.';
          },
          complete: () => {
            this.loading = false;
          },
        });
      }
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
