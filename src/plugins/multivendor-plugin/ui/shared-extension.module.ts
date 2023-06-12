import { NgModule } from "@angular/core";
import {
  SharedModule,
  registerFormInputComponent,
  RichTextFormInputComponent,
} from "@vendure/admin-ui/core";
import { IsApprovedComponent } from "./components/customFields.isApproved.component";

@NgModule({
  imports: [SharedModule],
  declarations: [IsApprovedComponent],
  providers: [registerFormInputComponent("is-approved", IsApprovedComponent)],
})
export class AdminSellerSharedExtensionModule {}
