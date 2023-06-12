import {MigrationInterface, QueryRunner} from "typeorm";

export class now1686553983880 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `seller` CHANGE `customFieldsIsapproved` `customFieldsIsapproved` tinyint NULL DEFAULT 0", undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `seller` CHANGE `customFieldsIsapproved` `customFieldsIsapproved` tinyint NULL", undefined);
   }

}
