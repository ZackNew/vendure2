import { Component, AfterViewInit, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Apollo, gql } from "apollo-angular";
import { ActivatedRoute } from "@angular/router";

import {
  IntCustomFieldConfig,
  FormInputComponent,
  NotificationService,
} from "@vendure/admin-ui/core";

@Component({
  template: `
    <input
      #isApproved
      type="checkbox"
      (change)="isApprovedToggled($event)"
      style="width:4%"
      [(ngModel)]="model"
    />
  `,
})
export class IsApprovedComponent
  implements FormInputComponent<IntCustomFieldConfig>, OnInit
{
  readonly: boolean;
  config: IntCustomFieldConfig;
  formControl: FormControl;
  id: String;
  model: boolean;
  constructor(
    private apollo: Apollo,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((params) => {
      this.id = params["id"];
    });
  }
  ngOnInit(): void {
    this.model = this.formControl.value;
  }

  async isApprovedToggled(event: any) {
    this.formControl.setValue(event.target.checked);
    this.formControl.markAsDirty();
    var ChangeAdminsApprovedState = gql`
      mutation ChangeAdminsApprovedState($value: Boolean!, $sellerId: ID!) {
        changeApprovedState(value: $value, sellerId: $sellerId)
      }
    `;

    try {
      var reply = await this.apollo
        .mutate<any>({
          mutation: ChangeAdminsApprovedState,
          variables: {
            value: event.target.checked,
            sellerId: Number(this.id),
          },
          context: {
            useMultipart: true,
          },
        })
        .toPromise();
      if (event.target.checked)
        this.notificationService.success(`Approved Successully`);
      else this.notificationService.success(`Approval Revoked Successfully`);
    } catch (err) {
      this.notificationService.error(`Couldn't Finish Action`);
    }
  }
}
