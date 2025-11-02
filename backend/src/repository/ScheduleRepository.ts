import type { Repository } from "typeorm";
import type { Schedule } from "../models/Schedule.js";
import type { ScheduleCreationInfo } from "../types/Schedule.js";

export class ScheduleRepository {
    public constructor(private readonly repo: Repository<Schedule>) {

    }

    public async getScheduleForInverter(inverterId: number): Promise<Schedule[]> {
        return this.repo.findBy({ inverterId });
    }

    public async createScheduleElement(data: ScheduleCreationInfo): Promise<Schedule> {
        const schedule = this.repo.create(data);
        await this.repo.save(schedule);
        return schedule;
    }

    public async deleteScheduleElement(id: number): Promise<boolean> {
        return (await this.repo.delete({ id })).affected !== 0;
    }
}
