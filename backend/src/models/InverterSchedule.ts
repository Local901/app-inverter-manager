import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique, type Relation } from "typeorm";
import { Inverter } from "./Inverter.js";
import { Schedule } from "./Schedule.js";

@Unique(["inverterId", "scheduleId", "order"])
@Entity()
export class InverterSchedule {
    @PrimaryColumn("int")
    public readonly inverterId!: number;

    @PrimaryColumn("int")
    public readonly scheduleId!: number;

    @PrimaryColumn("int")
    public order!: number;

    @ManyToOne(() => Inverter, (inverter) => inverter.scheduleRelations, {
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    })
    @JoinColumn()
    public inverter?: Relation<Inverter>;

    @ManyToOne(() => Schedule, (schedule) => schedule.inverterRelations, {
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    })
    @JoinColumn()
    public schedule?: Relation<Schedule>;
}
