import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
[x: string]: any;
  title = 'learnReactiveForms';
  formSubmitted: boolean = false;


  constructor(private fb: FormBuilder) {}


  studentForm = new FormGroup({
    userName: new FormControl('',[Validators.required, Validators.minLength(3)]),
    age : new FormControl('',[Validators.required, this.ageRangeValidator(18,60)]),
    email: new FormControl('',[Validators.email,this.emailDomainValidator(['gmail.com'])]),
    subscribe: new FormControl(false),
    phones: this.fb.array([this.createPhoneControl()]), // Initialize with one phone control
    password: new FormControl('',[Validators.required, Validators.minLength(8), this.dynamicPasswordValidator(),  this.noCommonPasswordValidator()]),
    confirmPassword: new FormControl('',[Validators.required ,this.passwordMatchValidator,Validators.minLength(8), this.dynamicPasswordValidator()]),
    addressForm: new FormGroup({
      street: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{6}$')]) // Assuming 5-digit ZIP code
    })
  },
{
  validators: this.passwordMatchValidator()
});


ngOnInit() {
  this.studentForm.get('subscribe')?.valueChanges.subscribe((checked: boolean | null) => {
    if (checked !== null) {
      this.adjustEmailValidatorBasedOnSubscription(checked);
    }
  });
}

 
adjustEmailValidatorBasedOnSubscription(checked: boolean) {
  const emailControl = this.studentForm.get('email');
  if (checked) {
    emailControl?.setValidators([Validators.required, Validators.email, this.emailDomainValidator(['gmail.com'])]);
  } else {
    emailControl?.setValidators([Validators.email, this.emailDomainValidator(['gmail.com'])]);
  }
  emailControl?.updateValueAndValidity();
}


getFormControlState(controlName: string): string {
  const control = this.studentForm.get(controlName);


  if (control?.touched && control?.invalid) {
    return 'touched-invalid';

  } else if (control?.touched && control?.valid) {
    return 'touched-valid';
  } else if (control?.pristine) {
    return 'pristine';
  } else if (control?.dirty) {
    return 'dirty';
  }
  return '';
}

get phoneControls() {
  return this.studentForm.get('phones') as FormArray;
}

createPhoneControl(): FormControl {
  return this.fb.control('', [Validators.required, Validators.pattern('^[0-9]{10}$')]);
}

addPhone() {
  this.phoneControls.push(this.createPhoneControl());
}

removePhone(index: number) {
  this.phoneControls.removeAt(index);
}

 ageRangeValidator(min: number ,max : number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if(value< min || value >max){
        return{ageOutOfRange : true}
      }
      return null;
    };
}

emailDomainValidator(allowedDomains: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value) {
      const emailDomain = value.split('@')[1];
      if (emailDomain && !allowedDomains.includes(emailDomain)) {
        return { invalidDomain: true };
      }
    }
    return null;
  };
}

noCommonPasswordValidator(): ValidatorFn {
  // List of common passwords to check against
  const commonPasswords = ['password123', 'admin', '123456', 'password', 'qwerty'];

  // Return a function that acts as the validator
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value; // Get the current value of the form control

    // Check if the value is included in the list of common passwords
    if (commonPasswords.includes(value)) {
      // If it is, return an error object indicating the password is common
      return { commonPassword: true };
    } else {
      // If it isn't, return null indicating no errors
      return null;
    }
  };
}





  // Custom validator to check if password and confirm password match
  passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const password = form.get('password')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;

      if (password !== confirmPassword) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }


  dynamicPasswordValidator(): ValidatorFn{
    return (control: AbstractControl): ValidationErrors | null =>{
      const value = control.value;

      if(!value){
        return null;
      }


      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /\d/.test(value);
      const hasSpecialChar = /[@$!%*?&]/.test(value);

      const errors: ValidationErrors = {};

      if (!hasUpperCase) {
        errors['missingUpperCase'] = 'Password must contain at least one uppercase letter.';
      }
      if (!hasLowerCase) {
        errors['missingLowerCase'] = 'Password must contain at least one lowercase letter.';
      }
      if (!hasNumeric) {
        errors['missingNumeric'] = 'Password must contain at least one number.';
      }
      if (!hasSpecialChar) {
        errors['missingSpecialChar'] = 'Password must contain at least one special character.';
      }
      return Object.keys(errors).length ? errors : null;
      }
  }



onSubmit(){
  this.formSubmitted = true;
  if(this.studentForm.valid){
    console.log('form Data :',this.studentForm.value);
    // this.studentForm.reset();
    // this.formSubmitted = false;
  }
}
















































  // confirmPassword: string | undefined;

  // confirmPasswordError = false;

  // onSubmit(form: any): void {
  //   this.checkPasswords(form); // Ensure passwords are checked on submit as well
  //   if (form.valid && !this.confirmPasswordError) {
  //     console.log('Form Submitted!', form.value);
  //   } else {
  //     console.log('Form not valid');
  //   }
  // }

  // checkPasswords(form: any) {
  //   const password = form.controls['password'].value;
  //   const confirmPassword = form.controls['confirmPassword'].value;
  //   this.confirmPasswordError = password !== confirmPassword;
  // }
}
