import { ID, VendureEntity, Administrator } from "@vendure/core";
import { Seller } from "@vendure/core/dist/entity/seller/seller.entity";
import { PrimaryColumn, Entity, ManyToOne, JoinColumn } from "typeorm";

@Entity()
export class AdminSellerEntity {
  @PrimaryColumn()
  sellerId: ID;

  @PrimaryColumn()
  administratorId: ID;

  @ManyToOne(() => Seller, { cascade: true, eager: true })
  @JoinColumn({ name: "sellerId" })
  seller: Seller;

  @ManyToOne(() => Administrator, { cascade: true, eager: true })
  @JoinColumn({ name: "administratorId" })
  administrator: Administrator;
}
