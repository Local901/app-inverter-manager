import type { Schedule } from "../models/Schedule.js";
import type { DataStore } from "../storage/DataStore.js";
import type { ScheduleCreationInfo } from "../types/Schedule.js";

export class ScheduleRepository {
    public constructor(private readonly store: DataStore) {

    }

    public async getScheduleForInverter(inverterId: number): Promise<Schedule[]> {
        return this.store.getSchedule(inverterId);
    }

    public async createScheduleElement(data: ScheduleCreationInfo): Promise<Schedule> {
        return this.store.createScheduleElement(data)
    }

    public async deleteScheduleElement(id: number): Promise<boolean> {
        return this.store.deleteScheduleElement(id)
    }
}
