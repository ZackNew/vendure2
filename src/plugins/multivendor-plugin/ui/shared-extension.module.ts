import { NgModule } from "@angular/core";
import {
  SharedModule,
  registerFormInputComponent,
} from "@vendure/admin-ui/core";
import { IsApprovedComponent } from "./components/customFields.isApproved.component";

@NgModule({
  imports: [SharedModule],
  declarations: [IsApprovedComponent],
  providers: [registerFormInputComponent("is-approved", IsApprovedComponent)],
  exports: [],
})
export class AdminSellerSharedExtensionModule {}
