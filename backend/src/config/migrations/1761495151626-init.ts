import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Init1761495151626 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "inverter",
            columns: [{
                name: "id",
                type: "int",
                isPrimary: true,
                primaryKeyConstraintName: "inverter_id_pk",
                generationStrategy: "increment",
            }, {
                name: "name",
                type: "varchar",
            }, {
                name: "type",
                type: "varchar",
            }, {
                name: "options",
                type: "json",
            }],
        }));
        
        await queryRunner.createTable(new Table({
            name: "action",
            columns: [{
                name: "id",
                type: "int",
                isPrimary: true,
                primaryKeyConstraintName: "action_id_pk",
                generationStrategy: "increment",
            }, {
                name: "inverter_id",
                type: "int",
                foreignKeyConstraintName: "action_inverter_id_fk",
            }, {
                name: "action",
                type: "enum",
                enum: ["charge"],
            }, {
                name: "active_from",
                type: "timestamp",
            }, {
                name: "active_until",
                type: "timestamp",
            }, {
                name: "repeat_weekly",
                type: "bool",
            }, {
                name: "value",
                type: "int",
            }, {
                name: "created_at",
                type: "timestamp",
                generatedIdentity: "BY DEFAULT",
            }, {
                name: "deleted_at",
                type: "timestamp",
            }],
            foreignKeys: [{
                name: "action_inverter_id_fk",
                columnNames: ["inverter_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "inverter",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }],
        }));

        await queryRunner.createTable(new Table({
            name: "schedule",
            columns: [{
                name: "id",
                type: "int",
                isPrimary: true,
                primaryKeyConstraintName: "schedule_id_pk",
                generationStrategy: "increment",
            }, {
                name: "inverter_id",
                type: "int",
                foreignKeyConstraintName: "schedule_inverter_id_fk",
            }, {
                name: "action",
                type: "varchar",
            }, {
                name: "value",
                type: "int",
            }, {
                name: "from",
                type: "int",
            }, {
                name: "to",
                type: "int",
            }],
            foreignKeys: [{
                name: "schedule_inverter_id_fk",
                columnNames: ["inverter_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "inverter",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("action");
        await queryRunner.dropTable("inverter");
        await queryRunner.dropTable("schedule");
    }
}
