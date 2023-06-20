import { ID } from "@vendure/common/lib/shared-types";
import { createWriteStream, ReadStream } from "fs";
import { Injectable } from "@nestjs/common";
import { getRepository, In } from "typeorm";
import {
  CreateAdministratorInput,
  Permission,
} from "@vendure/common/lib/generated-types";
import { normalizeString } from "@vendure/common/lib/normalize-string";
import {
  Administrator,
  AdministratorService,
  Channel,
  ChannelService,
  ConfigService,
  defaultShippingCalculator,
  InternalServerError,
  isGraphQlErrorResult,
  manualFulfillmentHandler,
  RequestContext,
  RequestContextService,
  RoleService,
  SellerService,
  ShippingMethod,
  ShippingMethodService,
  StockLocation,
  StockLocationService,
  TaxSetting,
  TransactionalConnection,
  User,
  UserService,
} from "@vendure/core";

import { multivendorShippingEligibilityChecker } from "../config/mv-shipping-eligibility-checker";
import {
  ChangeApprovedStateInput,
  CreateAssetInput,
  CreateSellerInput,
} from "../types";
import { AdminSellerEntity } from "../entities/seller_admin.entity";

@Injectable()
export class MultivendorService {
  constructor(
    private administratorService: AdministratorService,
    private sellerService: SellerService,
    private roleService: RoleService,
    private channelService: ChannelService,
    private shippingMethodService: ShippingMethodService,
    private configService: ConfigService,
    private stockLocationService: StockLocationService,
    private userService: UserService,
    private requestContextService: RequestContextService,
    private connection: TransactionalConnection
  ) {}

  async registerNewSeller(
    ctx: RequestContext,
    input: { shopName: string; seller: CreateSellerInput }
  ) {
    const superAdminCtx = await this.getSuperAdminContext(ctx);
    const channel = await this.createSellerChannelRoleAdmin(
      superAdminCtx,
      input
    );
    await this.createSellerShippingMethod(
      superAdminCtx,
      input.shopName,
      channel
    );
    await this.createSellerStockLocation(
      superAdminCtx,
      input.shopName,
      channel
    );
    return channel;
  }

  private async createSellerShippingMethod(
    ctx: RequestContext,
    shopName: string,
    sellerChannel: Channel
  ) {
    const defaultChannel = await this.channelService.getDefaultChannel(ctx);
    const {
      shippingEligibilityCheckers,
      shippingCalculators,
      fulfillmentHandlers,
    } = this.configService.shippingOptions;
    const shopCode = normalizeString(shopName, "-");
    const checker = shippingEligibilityCheckers.find(
      (c) => c.code === multivendorShippingEligibilityChecker.code
    );
    const calculator = shippingCalculators.find(
      (c) => c.code === defaultShippingCalculator.code
    );
    const fulfillmentHandler = fulfillmentHandlers.find(
      (h) => h.code === manualFulfillmentHandler.code
    );
    if (!checker) {
      throw new InternalServerError(
        "Could not find a suitable ShippingEligibilityChecker for the seller"
      );
    }
    if (!calculator) {
      throw new InternalServerError(
        "Could not find a suitable ShippingCalculator for the seller"
      );
    }
    if (!fulfillmentHandler) {
      throw new InternalServerError(
        "Could not find a suitable FulfillmentHandler for the seller"
      );
    }
    const shippingMethod = await this.shippingMethodService.create(ctx, {
      code: `${shopCode}-shipping`,
      checker: {
        code: checker.code,
        arguments: [],
      },
      calculator: {
        code: calculator.code,
        arguments: [
          { name: "rate", value: "500" },
          { name: "includesTax", value: TaxSetting.auto },
          { name: "taxRate", value: "20" },
        ],
      },
      fulfillmentHandler: fulfillmentHandler.code,
      translations: [
        {
          languageCode: defaultChannel.defaultLanguageCode,
          name: `Standard Shipping for ${shopName}`,
        },
      ],
    });

    await this.channelService.assignToChannels(
      ctx,
      ShippingMethod,
      shippingMethod.id,
      [sellerChannel.id]
    );
  }

  private async createSellerStockLocation(
    ctx: RequestContext,
    shopName: string,
    sellerChannel: Channel
  ) {
    const stockLocation = await this.stockLocationService.create(ctx, {
      name: `${shopName} Warehouse`,
    });
    await this.channelService.assignToChannels(
      ctx,
      StockLocation,
      stockLocation.id,
      [sellerChannel.id]
    );
  }

  private async createSellerChannelRoleAdmin(
    ctx: RequestContext,
    input: { shopName: string; seller: CreateSellerInput }
  ) {
    const defaultChannel = await this.channelService.getDefaultChannel(ctx);
    const shopCode = normalizeString(input.shopName, "-");
    let isApproved;
    if (input.seller.customFields.sellerType === "subscription") {
      isApproved = true;
    } else {
      isApproved = false;
    }
    const seller = await this.sellerService.create(ctx, {
      name: input.shopName,
      customFields: {
        connectedAccountId: Math.random().toString(30).substring(3),
        phoneNumberOffice: input.seller.customFields.phoneNumberOffice,
        phoneNumberMobile: input.seller.customFields.phoneNumberMobile,
        city: input.seller.customFields.city,
        subCity: input.seller.customFields.subCity,
        woreda: input.seller.customFields.woreda,
        houseNumber: input.seller.customFields.houseNumber,
        vatCertificate: input.seller.customFields.vatCertificate,
        tinCertificate: input.seller.customFields.tinCertificate,
        businessRegistrationCertificate:
          input.seller.customFields.businessRegistrationCertificate,
        businessLicence: input.seller.customFields.businessLicence,
        sellerType: input.seller.customFields.sellerType,
        isApproved: isApproved,
        tinNumber: input.seller.customFields.tinNumber,
      },
    });
    console.log("cuuuuuuuunt", input.seller.customFields.tinNumber);

    const channel = await this.channelService.create(ctx, {
      code: shopCode,
      sellerId: seller.id,
      token: `${shopCode}-token`,
      currencyCode: defaultChannel.defaultCurrencyCode,
      defaultLanguageCode: defaultChannel.defaultLanguageCode,
      pricesIncludeTax: defaultChannel.pricesIncludeTax,
      defaultShippingZoneId: defaultChannel.defaultShippingZone.id,
      defaultTaxZoneId: defaultChannel.defaultTaxZone.id,
    });
    if (isGraphQlErrorResult(channel)) {
      throw new InternalServerError(channel.message);
    }
    const superAdminRole = await this.roleService.getSuperAdminRole(ctx);
    const customerRole = await this.roleService.getCustomerRole(ctx);
    await this.roleService.assignRoleToChannel(
      ctx,
      superAdminRole.id,
      channel.id
    );
    let permissions: Array<Permission>;
    if (input.seller.customFields.sellerType === "subscription") {
      permissions = [
        Permission.CreateProduct,
        Permission.UpdateProduct,
        Permission.ReadProduct,
        Permission.DeleteProduct,
        Permission.CreateFacet,
        Permission.UpdateFacet,
        Permission.ReadFacet,
        Permission.DeleteFacet,
        Permission.CreateAsset,
        Permission.UpdateAsset,
        Permission.ReadAsset,
        Permission.DeleteAsset,
        Permission.CreateOrder,
        Permission.ReadOrder,
        Permission.UpdateOrder,
        Permission.DeleteOrder,
        Permission.ReadCustomer,
        Permission.ReadPaymentMethod,
        Permission.ReadShippingMethod,
        Permission.ReadPromotion,
        Permission.ReadCountry,
        Permission.ReadZone,
        Permission.CreateCustomer,
        Permission.UpdateCustomer,
        Permission.DeleteCustomer,
        Permission.CreateTag,
        Permission.ReadTag,
        Permission.UpdateTag,
        Permission.DeleteTag,
        Permission.CreateStockLocation,
        Permission.ReadStockLocation,
        Permission.DeleteStockLocation,
        Permission.UpdateStockLocation,
      ];
    } else {
      permissions = [];
    }
    const role = await this.roleService.create(ctx, {
      code: `${shopCode}-admin`,
      channelIds: [channel.id],
      description: `Administrator of ${input.shopName}`,
      permissions: permissions,
    });
    const administrator = await this.administratorService.create(ctx, {
      firstName: input.seller.firstName,
      lastName: input.seller.lastName,
      emailAddress: input.seller.emailAddress,
      password: input.seller.password,
      roleIds: [role.id],
    });
    const repo = this.connection.getRepository(AdminSellerEntity);
    const newAdminSeller = repo.create({
      sellerId: seller.id,
      administratorId: administrator.id,
      seller: seller,
      administrator: administrator,
    });
    await repo.save(newAdminSeller);

    return channel;
  }

  private async getSuperAdminContext(
    ctx: RequestContext
  ): Promise<RequestContext> {
    const { superadminCredentials } = this.configService.authOptions;
    const superAdminUser = await this.connection
      .getRepository(ctx, User)
      .findOne({
        where: {
          identifier: superadminCredentials.identifier,
        },
      });
    return this.requestContextService.create({
      apiType: "shop",
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      user: superAdminUser!,
    });
  }

  async uploadImage(
    ctx: RequestContext,
    input: CreateAssetInput
  ): Promise<String> {
    const { createReadStream, filename } = await input.file;
    const readStream = createReadStream() as ReadStream;
    let filePath = `/assets/sellers/${Math.random()
      .toString(36)
      .slice(2, 7)}_${filename}`;
    const ws = createWriteStream(`./static${filePath}`);
    readStream.pipe(ws);
    return filePath;
  }

  async changeApprovedState(ctx: RequestContext, value: boolean, sellerID: ID) {
    try {
      await this.sellerService.update(ctx, {
        id: sellerID,
        customFields: { isApproved: value },
      });
      const repo = this.connection.getRepository(AdminSellerEntity);
      const seller = await repo.findOneBy({ sellerId: sellerID });
      let admin;
      if (seller) {
        admin = await this.administratorService.findOneByUserId(
          ctx,
          seller?.administratorId,
          ["user.roles"]
        );
      }
      let user;
      if (admin) {
        user = await this.userService.getUserById(ctx, admin.user.id);
      }
      if (user) {
        await this.roleService.update(ctx, {
          id: user.roles[0].id,
          permissions: [
            Permission.CreateProduct,
            Permission.UpdateProduct,
            Permission.ReadProduct,
            Permission.DeleteProduct,
            Permission.CreateFacet,
            Permission.UpdateFacet,
            Permission.ReadFacet,
            Permission.DeleteFacet,
            Permission.CreateAsset,
            Permission.UpdateAsset,
            Permission.ReadAsset,
            Permission.DeleteAsset,
            Permission.CreateOrder,
            Permission.ReadOrder,
            Permission.UpdateOrder,
            Permission.DeleteOrder,
            Permission.ReadCustomer,
            Permission.ReadPaymentMethod,
            Permission.ReadShippingMethod,
            Permission.ReadPromotion,
            Permission.ReadCountry,
            Permission.ReadZone,
            Permission.CreateCustomer,
            Permission.UpdateCustomer,
            Permission.DeleteCustomer,
            Permission.CreateTag,
            Permission.ReadTag,
            Permission.UpdateTag,
            Permission.DeleteTag,
            Permission.CreateStockLocation,
            Permission.ReadStockLocation,
            Permission.DeleteStockLocation,
            Permission.UpdateStockLocation,
          ],
        });
      }
    } catch (error) {}
  }
}
