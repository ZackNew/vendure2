export interface MultivendorPluginOptions {
  platformFeePercent: number;
  platformFeeSKU: string;
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
}

export interface CreateSellerInput {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  customFields: SellerCustomFields;
}
