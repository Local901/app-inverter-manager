import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { InverterSchedule } from "./InverterSchedule.js";
import { ScheduleItem } from "./ScheduleItem.js";

export enum ScheduleType {
    DAY = "DAY",
}

export interface ScheduleJson {
    id: string,
    name: string,
    type: ScheduleType,
    time_slots: Array<{
        slot: number,
        actions: Record<string, string>,
    }>,
}

@Entity()
export class Schedule {
    @PrimaryGeneratedColumn("increment", { type: "int" })
    public readonly id!: number;

    @Column("varchar")
    public name!: string;

    @Column("enum", { enum: ScheduleType })
    public type!: ScheduleType;

    @OneToMany(() => InverterSchedule, (inverterSchedule) => inverterSchedule.schedule)
    public inverterRelations?: Relation<InverterSchedule>[];

    @OneToMany(() => ScheduleItem, (item) => item.schedule)
    public items?: Relation<ScheduleItem>[];

    public toJson(): ScheduleJson {
        const actionRecord = (this.items ?? []).reduce((record: Record<number, [string, string][]>, item) => {
            record[item.startAt] ??= [];
            record[item.startAt].push([item.action, `${item.value}`]);
            return record;
        }, {})

        return {
            id: `${this.id}`,
            name: this.name,
            type: this.type,
            time_slots: Object.entries(actionRecord).map(([slot, values]) => ({
                slot: Number.parseInt(slot),
                actions: Object.fromEntries(values),
            })),
        }
    }
}
