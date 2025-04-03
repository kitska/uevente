import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRightsEnum1710345600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("CREATE TYPE \"rights_enum\" AS ENUM ('owner', 'editor', 'viewer')");
    
    await queryRunner.query(
      "ALTER TABLE \"calendar_users\" ADD COLUMN \"rights\" rights_enum NOT NULL DEFAULT 'viewer'"
    );
    
    await queryRunner.query(
      "ALTER TABLE \"event_users\" ADD COLUMN \"rights\" rights_enum NOT NULL DEFAULT 'viewer'"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE \"calendar_users\" DROP COLUMN \"rights\"");
    await queryRunner.query("ALTER TABLE \"event_users\" DROP COLUMN \"rights\"");
    await queryRunner.query("DROP TYPE \"rights_enum\"");
  }
}
