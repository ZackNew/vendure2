import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Apollo, gql } from "apollo-angular";

import {
  IntCustomFieldConfig,
  SharedModule,
  FormInputComponent,
  registerFormInputComponent,
} from "@vendure/admin-ui/core";

@Component({
  template: `
    <input #isApproved type="text" (change)="isApprovedToggled($event)" />
  `,
})
export class IsApprovedComponent
  implements FormInputComponent<IntCustomFieldConfig>
{
  readonly: boolean;
  config: IntCustomFieldConfig;
  formControl: FormControl;
  constructor(private apollo: Apollo) {}

  async isApprovedToggled(event: any) {
    console.log("this data", event);
  }
}
