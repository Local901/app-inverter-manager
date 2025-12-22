import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { InverterSchedule } from "./InverterSchedule.js";
import { ScheduleItem } from "./ScheduleItem.js";

export enum ScheduleType {
    DAY = "DAY",
}

export const ItemRangeData: Record<ScheduleType, { before: number, range: number, isDiscreet: boolean }> = {
    [ScheduleType.DAY]: {
        range: 24 * 60 * 60,
        before: 3600,
        isDiscreet: true,
    }
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

    public getNow(): number {
        const rangeData = ItemRangeData[this.type];
        return Math.round(Date.now() / 1000) % rangeData.range;
    }

    public getItemRange(): [number, number] {
        const rangeData = ItemRangeData[this.type];
        const now = this.getNow();

        return [
            rangeData.isDiscreet
                ? Math.floor((now) / rangeData.before) * rangeData.before // item only effect their discreet section.
                : (now - rangeData.before) % rangeData.range, // item have an effective length.
            now,
        ];
    }
}
