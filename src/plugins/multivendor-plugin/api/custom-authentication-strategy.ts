import { ID } from "@vendure/common/lib/shared-types";
import {
  AuthenticationStrategy,
  TransactionalConnection,
  Injector,
  RequestContext,
  User,
  NativeAuthenticationMethod,
  AdministratorService,
} from "@vendure/core";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export interface CustomAuthenticationData {
  username: string;
  password: string;
}

export const CUSTOM_AUTH_STRATEGY_NAME = "custom";

/**
 * @description
 * This strategy implements a username/password credential-based authentication, with the credentials
 * being stored in the Vendure database. This is the default method of authentication, and it is advised
 * to keep it configured unless there is a specific reason not to.
 *
 * @docsCategory auth
 */
export class CustomAuthenticationStrategy
  implements AuthenticationStrategy<CustomAuthenticationData>
{
  readonly name = CUSTOM_AUTH_STRATEGY_NAME;

  private connection: TransactionalConnection;
  private administratorService: AdministratorService;
  private passwordCipher: import("@vendure/core/dist/service/helpers/password-cipher/password-cipher").PasswordCipher;
  private userService: import("@vendure/core/dist/service/services/user.service").UserService;

  async init(injector: Injector) {
    this.connection = injector.get(TransactionalConnection);
    this.administratorService = injector.get(AdministratorService);
    // These are lazily-loaded to avoid a circular dependency
    const { PasswordCipher } = await import(
      "@vendure/core/dist/service/helpers/password-cipher/password-cipher.js"
    );
    const { UserService } = await import(
      "@vendure/core/dist/service/services/user.service.js"
    );
    this.passwordCipher = injector.get(PasswordCipher);
    this.userService = injector.get(UserService);
  }

  defineInputType(): DocumentNode {
    return gql`
      input NativeAuthInput {
        username: String!
        password: String!
      }
    `;
  }

  async authenticate(
    ctx: RequestContext,
    data: CustomAuthenticationData
  ): Promise<User | false> {
    const user = await this.userService.getUserByEmailAddress(
      ctx,
      data.username
    );
    if (!user) {
      return false;
    }
    const adminUser = await this.administratorService.findOneByUserId(
      ctx,
      user.id
    );
    const passwordMatch = await this.verifyUserPassword(
      ctx,
      user.id,
      data.password
    );
    if (!passwordMatch) {
      return false;
    }
    return user;
  }

  /**
   * Verify the provided password against the one we have for the given user.
   */
  async verifyUserPassword(
    ctx: RequestContext,
    userId: ID,
    password: string
  ): Promise<boolean> {
    const user = await this.connection.getRepository(ctx, User).findOne({
      where: { id: userId },
      relations: ["authenticationMethods"],
    });
    if (!user) {
      return false;
    }
    const nativeAuthMethod = user.getNativeAuthenticationMethod(false);
    if (!nativeAuthMethod) {
      return false;
    }
    const pw =
      (
        await this.connection
          .getRepository(ctx, NativeAuthenticationMethod)
          .findOne({
            where: { id: nativeAuthMethod.id },
            select: ["passwordHash"],
          })
      )?.passwordHash ?? "";
    const passwordMatches = await this.passwordCipher.check(password, pw);
    if (!passwordMatches) {
      return false;
    }
    return true;
  }
}
