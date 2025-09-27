
export class Schedule {
    public readonly id!: number;
    public inverterId!: number;
    public action!: string;
    public value!: number;
    public from!: number;
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
