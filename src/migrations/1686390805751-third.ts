import {MigrationInterface, QueryRunner} from "typeorm";

export class third1686390805751 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `administrator` ADD `customFieldsIsapproved` tinyint NULL", undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `administrator` DROP COLUMN `customFieldsIsapproved`", undefined);
   }

}
