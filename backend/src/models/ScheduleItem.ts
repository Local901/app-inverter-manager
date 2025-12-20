import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from "typeorm";
import { Schedule } from "./Schedule.js";

@Entity()
export class ScheduleItem {
    @PrimaryGeneratedColumn({ type: "int" })
    public readonly id!: number;

    @Column("int")
    public readonly scheduleId!: number;

    @Column("int")
    public startAt!: number;

    @Column("int", { nullable: true })
    public endAt?: number;

    @Column("varchar")
    public action!: string;

    @Column("int")
    public value!: number;

    @ManyToOne(() => Schedule, (schedule) => schedule.items, { onUpdate: "CASCADE", onDelete: "CASCADE" })
    @JoinColumn()
    public schedule?: Relation<Schedule>;
}
