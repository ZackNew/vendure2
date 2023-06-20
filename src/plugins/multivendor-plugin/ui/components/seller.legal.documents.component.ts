import { Component, AfterViewInit, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Apollo, gql } from "apollo-angular";

import {
  IntCustomFieldConfig,
  FormInputComponent,
} from "@vendure/admin-ui/core";

@Component({
  template: `<img
    [src]="imageUrl"
    style="width:100px; height:100px"
    (click)="openImageInNewTab()"
  />`,
})
export class SellerLegalDocumnetsComponent
  implements FormInputComponent<IntCustomFieldConfig>, OnInit
{
  model: boolean;
  url: string;
  imageUrl: string;
  formControl: FormControl;
  constructor(private apollo: Apollo) {}
  readonly: boolean;
  config: IntCustomFieldConfig;
  ngOnInit(): void {
    this.model = this.formControl.value;
    this.url = window.location.href;
    this.imageUrl = `${this.url.split("/admin")[0]}${this.model}`;
  }
  openImageInNewTab() {
    window.open(this.imageUrl, "_blank");
  }
}
