import { NgModule } from "@angular/core";
import {
  SharedModule,
  registerFormInputComponent,
} from "@vendure/admin-ui/core";
import { IsApprovedComponent } from "./components/customFields.isApproved.component";
import { SellerLegalDocumnetsComponent } from "./components/seller.legal.documents.component";
import { SellerTypeComponent } from "./components/sellerType.component";

@NgModule({
  imports: [SharedModule],
  declarations: [
    IsApprovedComponent,
    SellerLegalDocumnetsComponent,
    SellerTypeComponent,
  ],
  providers: [
    registerFormInputComponent("is-approved", IsApprovedComponent),
    registerFormInputComponent(
      "legal-documents",
      SellerLegalDocumnetsComponent
    ),
    registerFormInputComponent("seller-type", SellerTypeComponent),
  ],
  exports: [],
})
export class AdminSellerSharedExtensionModule {}
