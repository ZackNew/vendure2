import {MigrationInterface, QueryRunner} from "typeorm";

export class pinker1686573898071 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsIsapproved`", undefined);
        await queryRunner.query("ALTER TABLE `administrator` ADD `customFieldsIsapproved` tinyint NULL DEFAULT 0", undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `administrator` DROP COLUMN `customFieldsIsapproved`", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsIsapproved` tinyint NULL DEFAULT 0", undefined);
   }

}
