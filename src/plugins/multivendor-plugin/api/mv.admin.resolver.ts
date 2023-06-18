import { Args, Mutation, Resolver } from "@nestjs/graphql";
import {
  Allow,
  Ctx,
  Permission,
  RequestContext,
  Transaction,
} from "@vendure/core";

import { MultivendorService } from "../service/mv.service";

@Resolver()
export class MultivendorAdminResolver {
  constructor(private multivendorService: MultivendorService) {}

  @Mutation()
  @Transaction()
  @Allow(Permission.SuperAdmin)
  changeApprovedState(@Ctx() ctx: RequestContext, @Args() arg: any) {
    return this.multivendorService.changeApprovedState(
      ctx,
      arg.value,
      arg.sellerId
    );
  }
}
