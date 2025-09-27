import { config } from "../../config/index.js";
import { DataStore } from "../DataStore.js";
import type { InverterData } from "../types/InverterData.js";
import mysql, { type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import type { GeneralSettings } from "../../types/Inverter.js";
import { Action } from "../../models/Action.js";
import type { ActionCreationInfo } from "../../types/Action.js";
import { Schedule } from "../../models/Schedule.js";
import type { ScheduleCreationInfo } from "../../types/Schedule.js";

export class SqlStore implements DataStore {
    private pool;

    public constructor() {
        this.pool = mysql.createPool({
            host: config.store.host,
            port: config.store.port ? Number(config.store.port) : undefined,
            database: config.store.database,
            user: config.store.user,
            password: config.store.password,
        });
    }

    /** @inheritdoc */
    public async start(): Promise<void> {
        await this.pool.execute(`
            CREATE TABLE IF NOT EXISTS inverter (
                id int NOT NULL AUTO_INCREMENT,
                type varchar(255) NOT NULL,
                name varchar(255) NOT NULL,
                options text NOT NULL COMMENT 'JSON object string with only one layer.',
                PRIMARY KEY (id)
            )
        `);

        await this.pool.execute(`
            CREATE TABLE IF NOT EXISTS action (
                id int NOT NULL AUTO_INCREMENT,
                inverterId int NOT NULL,
                action varchar(255) NOT NULL,
                value int NOT NULL,
                activeFrom timestamp NOT NULL,
                activeUntil timestamp NOT NULL,
                repeatWeekly tinyint(1) NOT NULL DEFAULT 0,
                createdAt timestamp(0) NOT NULL DEFAULT CURRENT_timestamp(),
                deletedAt timestamp(0) NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (inverterId) REFERENCES inverter(id) ON UPDATE CASCADE ON DELETE CASCADE
            )  
        `);

        await this.pool.execute(`
            CREATE TABLE IF NOT EXISTS schedule (
                id int NOT NULL AUTO_INCREMENT,
                inverterId int NOT NULL,
                action varchar(255) NOT NULL,
                value int NOT NULL,
                from int NOT NULL,
                to int NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (inverterId) REFERENCES inverter(id) ON UPDATE CASCADE ON DELETE CASCADE
            )
        `)
    }

    /** @inheritdoc */
    public async stop(): Promise<void> {
        return;
    }


    /** @inheritdoc */
    public async saveNewInverter(data: InverterData): Promise<number> {
        const [headers] = await this.pool.execute<ResultSetHeader>(`
            INSERT INTO inverter (type, name, options)
            VALUES (?, ?, ?)
        `, [data.type, data.name, JSON.stringify(data.options)]);
        return headers.insertId;
    }

    /** @inheritdoc */
    public async saveOptions(id: number, name: string, options: GeneralSettings): Promise<boolean> {
        const [result] = await this.pool.execute<ResultSetHeader>(`
            UPDATE inverter
            SET options = ?, name = ?
            WHERE id = ?
        `, [JSON.stringify(options), name, id]);
        return result.affectedRows === 1;
    }

    /** @inheritdoc */
    public async getInverterById(id: number): Promise<InverterData | null> {
        const [results] = await this.pool.execute<RowDataPacket[]>(`
            SELECT *
            FROM inverter
            WHERE id = ?
        `, [id]);
        if (results.length === 0) {
            return null;
        }
        return {
            id: results[0].id,
            type: results[0].type,
            name: results[0].name,
            options: JSON.parse(results[0].options),
        } as InverterData;
    }

    /** @inheritdoc */
    public async getAllInverters(): Promise<InverterData[]> {
        const [results] = await this.pool.execute<RowDataPacket[]>(`
            SELECT *
            FROM inverter
        `);
        return results.map((data) => ({
            id: data.id,
            type: data.type,
            name: data.name,
            options: JSON.parse(data.options),
        }));
    }

    /** @inheritdoc */
    public async deleteInverterById(id: number): Promise<boolean> {
        try {
            await this.pool.execute(`
                DELETE FROM inverter WHERE id = ?
            `, [id]);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    // ##### ACTIONS #####

    private createActionObject(props: Partial<Action>): Action {
        const action = new Action();
        Object.assign(action, {
            ...props,
            // @ts-expect-error repeatWeekly is expected to be boolean but is at this moment a number.
            repeatWeekly: props.repeatWeekly === 1,
        });
        return action;
    }

    public async getAction(id: number): Promise<Action | null> {
        const [result] = await this.pool.execute<RowDataPacket[]>(`
            SELECT *
            FROM action
            WHERE id = ?
        `, [id]);
        if (result.length === 0) {
            return null;
        }
        // @ts-expect-error Not correct type
        return this.createActionObject(result[0]);
    }

    /** @inheritdoc */
    public async getActionsForInverter(inverterId: number, rangeStart?: Date, rangeEnd?: Date): Promise<Action[]> {
        const [results] = await this.pool.execute<RowDataPacket[]>(`
            SELECT *
            FROM action
            WHERE inverterId = ?
              AND createdAt < ?
              AND (deletedAt is NULL OR deletedAt > ?)
        `, [inverterId, rangeEnd ?? new Date(), rangeStart ?? new Date()]);
        // @ts-expect-error Not correct type
        return results.map((data) => this.createActionObject(data));
    }

    /** @inheritdoc */
    public async createAction(info: ActionCreationInfo): Promise<Action> {
        const [headers] = await this.pool.execute<ResultSetHeader>(`
            INSERT INTO action (inverterId, action, value, activeFrom, activeUntil, repeatWeekly)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [info.inverterId, info.action, info.value, info.activeFrom, info.activeUntil, !!info.repeatWeekly]);
        return this.createActionObject({
            id: headers.insertId,
            ...info,
            createdAt: new Date(),
        });
    }

    /** @inheritdoc */
    public async deleteAction(id: number): Promise<boolean> {
        try {
            await this.pool.execute(`
                DELETE FROM action WHERE id = ?
            `, [id]);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    /** @inheritdoc */
    public async endActionAt(id: number, when: Date): Promise<boolean> {
        try {
            await this.pool.execute(`
                UPDATE action
                SET deletedAt = ?
                WHERE id = ?
            `, [when, id]);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    /** @inheritdoc */
    public async splitAction(actionId: number, fromDate: Date, toDate: Date): Promise<Action | null> {
        // COPY
        const [headers] = await this.pool.execute<ResultSetHeader>(`
            INSERT INTO action (inverterId, action, value, activeFrom, activeUntil, repeatWeekly, createdAt, deletedAt)
            SELECT inverterId, action, value, activeFrom, activeUntil, repeatWeekly, ? AS createdAt, deletedAt
            FROM action
            WHERE id = ? AND (deletedAt IS NULL OR deletedAt > NOW())
        `, [toDate, actionId]);
        // end original action.
        await this.endActionAt(actionId, fromDate);
        // Return new action.
        return this.getAction(headers.insertId);
    }

    /** @inheritdoc */
    public async getSchedule(inverterId: number): Promise<Schedule[]> {
        const [results] = await this.pool.execute<RowDataPacket[]>(`
            SELECT *
            FROM schedule
            WHERE inverterId = ?
        `, [inverterId]);
        return results.map((data) => Object.assign(new Schedule(), data));
    }
    
    /** @inheritdoc */
    public async createScheduleElement(data: ScheduleCreationInfo): Promise<Schedule> {
        const [headers] = await this.pool.execute<ResultSetHeader>(`
            INSERT INTO schedule (inverterId, action, value, from, to)
            VALUES (?, ?, ?, ?, ?)
        `, [data.inverterId, data.action, data.value, data.from, data.to]);
        return Object.assign(new Schedule(), {
            ...data,
            id: headers.insertId,
        });
    }
    
    /** @inheritdoc */
    public async deleteScheduleElement(id: number): Promise<boolean> {
        try {
            await this.pool.execute(`
                DELETE FROM schedule WHERE id = ?
            `, [id]);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
