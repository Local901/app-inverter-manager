import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Schedule {
    @PrimaryGeneratedColumn("increment", { type: "int" })
    public readonly id!: number;

    @Column("int")
    public inverterId!: number;

    @Column("varchar")
    public action!: string;

    @Column("int")
    public value!: number;

    @Column("int")
    public from!: number;

    @Column("int")
    public to!: number;

    public isActive(nowOverride?: Date): boolean {
        const now = nowOverride ?? new Date();

        const timeIndex = now.getUTCHours() * 60 + now.getUTCMinutes();

        if (this.from < this.to) {
            return this.from <= timeIndex && timeIndex <= this.to;
        }
        return this.from <= timeIndex || timeIndex <= this.to;
    }
}
