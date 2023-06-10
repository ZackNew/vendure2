import {MigrationInterface, QueryRunner} from "typeorm";

export class forth1686431458218 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `administrator` DROP COLUMN `customFieldsIsapproved`", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsPhonenumberoffice` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsPhonenumbermobile` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsCity` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsSubcity` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsWoreda` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsHousenumber` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsVatcertificate` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsTincertificate` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsBusinessregistrationcertificate` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsBusinesslicence` varchar(255) NULL", undefined);
        await queryRunner.query("ALTER TABLE `seller` ADD `customFieldsIsapproved` tinyint NULL", undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsIsapproved`", undefined);
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsBusinesslicence`", undefined);
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsBusinessregistrationcertificate`", undefined);
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsTincertificate`", undefined);
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsVatcertificate`", undefined);
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsHousenumber`", undefined);
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsWoreda`", undefined);
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsSubcity`", undefined);
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsCity`", undefined);
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsPhonenumbermobile`", undefined);
        await queryRunner.query("ALTER TABLE `seller` DROP COLUMN `customFieldsPhonenumberoffice`", undefined);
        await queryRunner.query("ALTER TABLE `administrator` ADD `customFieldsIsapproved` tinyint NULL", undefined);
   }

}
