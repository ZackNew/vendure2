import { ID } from "@vendure/common/lib/shared-types";

export interface MultivendorPluginOptions {
  platformFeePercent: number;
  platformFeeSKU: string;
}
export enum SellerType {
  MARKUP = "markup",
  SUBSCRIPTION = "subscription",
}
interface SellerCustomFields {
  phoneNumberOffice: string;
  phoneNumberMobile: string;
  city: string;
  subCity: string;
  woreda: string;
  houseNumber: string;
  vatCertificate: string;
  tinCertificate: string;
  businessRegistrationCertificate: string;
  businessLicence: string;
  sellerType: SellerType;
  isApproved: boolean;
  tinNumber: string;
}

export interface CreateSellerInput {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  customFields: SellerCustomFields;
}
export type CreateAssetInput = {
  file: any;
  tags?: string;
  customFields?: JSON;
};
export type ChangeApprovedStateInput = {
  value: Boolean;
  sellerId: ID;
};
