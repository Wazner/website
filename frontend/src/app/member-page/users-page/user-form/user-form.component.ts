import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export interface UserForm {
  email: FormControl<string | null>,
  name: FormControl<string | null>,
  reset_password_on_login: FormControl<boolean | null>,

  studbook_heideschaap: FormControl<boolean | null>,
  studbook_heideschaap_ko: FormControl<boolean | null>,
  studbook_schoonebeeker: FormControl<boolean | null>,
  studbook_schoonebeeker_ko: FormControl<boolean | null>,

  role_website_contributor: FormControl<boolean | null>,
  role_member_administrator: FormControl<boolean | null>,
  role_studbook_administrator: FormControl<boolean | null>,
  role_studbook_inspector: FormControl<boolean | null>,
  role_marktplaats_administrator: FormControl<boolean | null>
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent {
  @Input()
  formGroup!: FormGroup<UserForm>

  @Input()
  addNew!: boolean

  constructor() { }
}

export function createFormGroup(): FormGroup<UserForm> {
  return new FormGroup<UserForm>({
    email: new FormControl<string>('', [
      Validators.required,
      Validators.email
    ]),
    name: new FormControl<string>('', [
      Validators.required
    ]),
    reset_password_on_login: new FormControl<boolean>(false),

    studbook_heideschaap: new FormControl<boolean>(false),
    studbook_heideschaap_ko: new FormControl<boolean>(false),
    studbook_schoonebeeker: new FormControl<boolean>(false),
    studbook_schoonebeeker_ko: new FormControl<boolean>(false),

    role_website_contributor: new FormControl<boolean>(false),
    role_member_administrator: new FormControl<boolean>(false),
    role_studbook_administrator: new FormControl<boolean>(false),
    role_studbook_inspector: new FormControl<boolean>(false),
    role_marktplaats_administrator: new FormControl<boolean>(false)
  });
}