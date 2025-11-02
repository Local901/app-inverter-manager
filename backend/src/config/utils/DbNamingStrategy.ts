import { NamingStrategyInterface, Table, View } from "typeorm";

function snakeCase(input: string): string {
    return input
        // AB -> a_b
        .replaceAll(/([a-zA-Za-z0-9])([A-Z])/g, "$1_$2")
        // replace not character tokens to "_"
        .replaceAll(/[^a-zA-Za-z0-9]+/g, "_")
        .toLowerCase();
}

function getTableName(table: string | Table | View): string {
    if (typeof table === "string") {
        return table;
    }
    return table.name;
}

export class SnakeCaseStrategy implements NamingStrategyInterface {
    public readonly name = "snake_case";
    public readonly nestedSetColumnNames = { left: "nsl", right: "nsr" };
    public readonly materializedPathColumnName = "mp";

    public tableName(targetName: string, userSpecifiedName: string | undefined): string {
        return snakeCase(userSpecifiedName ?? targetName);
    }
    public columnName(propertyName: string, customName: string | undefined, embeddedPrefixes: string[]): string {
        return snakeCase([...embeddedPrefixes, customName ?? propertyName].join("_"));
    }
    public closureJunctionTableName(originalClosureTableName: string): string {
        return snakeCase(originalClosureTableName);
    }
    public relationName(propertyName: string): string {
        return snakeCase(propertyName);
    }
    public primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
        return snakeCase([getTableName(tableOrName), ...[...columnNames].sort(), "pk"].join("_"));
    }
    public uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string {
        return snakeCase([getTableName(tableOrName), ...[...columnNames].sort(), "unq"].join("_"));
    }
    public relationConstraintName(tableOrName: Table | string, columnNames: string[], where?: string): string {
        return snakeCase([getTableName(tableOrName), ...[...columnNames].sort(), "rel"].join("_"));
    }
    public defaultConstraintName(tableOrName: Table | string, columnName: string): string {
        return snakeCase([getTableName(tableOrName), columnName, "def"].join("_"));
    }
    public foreignKeyName(tableOrName: Table | string, columnNames: string[], referencedTablePath?: string, referencedColumnNames?: string[]): string {
        return snakeCase([getTableName(tableOrName), ...[...columnNames].sort(), "fk"].join("_"));
    }
    public indexName(tableOrName: Table | View | string, columns: string[], where?: string): string {
        return snakeCase([getTableName(tableOrName), ...[...columns].sort(), "idx"].join("_"));
    }
    public checkConstraintName(tableOrName: Table | string, expression: string, isEnum?: boolean): string {
        return snakeCase([getTableName(tableOrName), expression, "cc"].join("_"));
    }
    public exclusionConstraintName(tableOrName: Table | string, expression: string): string {
        return snakeCase([getTableName(tableOrName), expression, "exc"].join("_"));
    }
    public joinColumnName(relationName: string, referencedColumnName: string): string {
        return snakeCase([relationName, referencedColumnName].join("_"));
    }
    public joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string, secondPropertyName: string): string {
        return snakeCase([firstTableName, secondTableName].sort().join("_"));
    }
    public joinTableColumnDuplicationPrefix(columnName: string, index: number): string {
        if (index === 0) {
            return snakeCase(columnName);
        }
        return snakeCase(`${columnName}_${index}`);
    }
    public joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
        return snakeCase([tableName, columnName ?? propertyName].join("_"));
    }
    public joinTableInverseColumnName(tableName: string, propertyName: string, columnName?: string): string {
        return snakeCase([tableName, columnName ?? propertyName].join("_"));
    }
    public prefixTableName(prefix: string, tableName: string): string {
        return snakeCase([prefix, tableName].join("_"));
    }
}
