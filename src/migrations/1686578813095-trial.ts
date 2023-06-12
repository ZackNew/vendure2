import {MigrationInterface, QueryRunner} from "typeorm";

export class trial1686578813095 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `administrator` ADD `customFieldsIsnotapproved` tinyint NULL DEFAULT 0", undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `administrator` DROP COLUMN `customFieldsIsnotapproved`", undefined);
   }

}
