import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1742039546616 implements MigrationInterface {
    name = 'InitialMigration1742039546616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_users" DROP COLUMN "rights"`);
        await queryRunner.query(`ALTER TABLE "calendar_users" DROP COLUMN "rights"`);
        await queryRunner.query(`DROP TYPE "public"."rights_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."rights_enum" AS ENUM('owner', 'editor', 'viewer')`);
        await queryRunner.query(`ALTER TABLE "calendar_users" ADD "rights" "public"."rights_enum" NOT NULL DEFAULT 'viewer'`);
        await queryRunner.query(`ALTER TABLE "event_users" ADD "rights" "public"."rights_enum" NOT NULL DEFAULT 'viewer'`);
    }

}
