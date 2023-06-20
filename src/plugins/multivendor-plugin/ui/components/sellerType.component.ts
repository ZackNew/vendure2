import { Component, AfterViewInit, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";

import {
  IntCustomFieldConfig,
  FormInputComponent,
} from "@vendure/admin-ui/core";

@Component({
  template: `
    <vdr-form-field>
      <input #sellerType type="text" disabled [(ngModel)]="model" />
    </vdr-form-field>
  `,
})
export class SellerTypeComponent
  implements FormInputComponent<IntCustomFieldConfig>, OnInit
{
  model: boolean;
  formControl: FormControl;
  constructor() {}
  readonly: boolean;
  config: IntCustomFieldConfig;
  ngOnInit(): void {
    this.model = this.formControl.value;
  }
}
