import type { DataSource } from "typeorm";
import type { ActionRepository } from "../repository/ActionRepository.js";
import type { InverterRepository } from "../repository/InverterRepository.js";
import type { ScheduleRepository } from "../repository/ScheduleRepository.js";

export type Container = {
    dataStore: DataSource,
    inverterRepository: InverterRepository;
    actionRepository: ActionRepository;
    scheduleRepository: ScheduleRepository
}
