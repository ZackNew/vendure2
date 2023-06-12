import {MigrationInterface, QueryRunner} from "typeorm";

export class removedTrial1686579505767 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `administrator` DROP COLUMN `customFieldsIsnotapproved`", undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `administrator` ADD `customFieldsIsnotapproved` tinyint NULL DEFAULT 0", undefined);
   }

}
