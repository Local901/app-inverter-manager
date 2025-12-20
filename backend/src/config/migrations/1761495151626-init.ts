import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Init1761495151626 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "inverter",
            columns: [{
                name: "id",
                type: "int",
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment",
                primaryKeyConstraintName: "inverter_id_pk",
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
            name: "schedule",
            columns: [{
                name: "id",
                type: "int",
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment",
                primaryKeyConstraintName: "schedule_id_pk",
            }, {
                name: "name",
                type: "varchar",
            }, {
                name: "type",
                type: "enum",
                enum: ["DAY"],
            }],
        }));

        await queryRunner.createTable(new Table({
            name: "inverter_schedule",
            columns: [{
                name: "inverter_id",
                type: "int",
                foreignKeyConstraintName: "inverter_schedule_inverter_id_fk",
            }, {
                name: "schedule_id",
                type: "int",
                foreignKeyConstraintName: "inverter_schedule_schedule_id_fk",
            }, {
                name: "order",
                type: "int",
            }],
            foreignKeys: [{
                columnNames: ["inverter_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "inverter",
                name: "inverter_schedule_inverter_id_fk",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }, {
                columnNames: ["schedule_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "schedule",
                name: "inverter_schedule_schedule_id_fk",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }],
        }));

        await queryRunner.createTable(new Table({
            name: "schedule_item",
            columns: [{
                name: "id",
                type: "int",
                isPrimary: true,
                isGenerated: true,
                generationStrategy: "increment",
                primaryKeyConstraintName: "schedule_item_id_pk",
            }, {
                name: "schedule_id",
                type: "int",
                foreignKeyConstraintName: "schedule_item_schedule_id_fk",
            }, {
                name: "start_at",
                type: "int",
            }, {
                name: "end_at",
                type: "int",
                isNullable: true,
            }, {
                name: "action",
                type: "varchar",
            }, {
                name: "value",
                type: "int",
            }],
            foreignKeys: [{
                columnNames: ["schedule_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "schedule",
                name: "schedule_item_schedule_id_fk",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }],
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("action");
        await queryRunner.dropTable("inverter");
        await queryRunner.dropTable("schedule");
    }
}
