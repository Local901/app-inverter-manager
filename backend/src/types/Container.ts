import type { ActionRepository } from "../repository/ActionRepository.js";
import type { InverterRepository } from "../repository/InverterRepository.js";
import type { ScheduleRepository } from "../repository/ScheduleRepository.js";
import type { DataStore } from "../storage/DataStore.js";

export type Container = {
    dataStore: DataStore,
    inverterRepository: InverterRepository;
    actionRepository: ActionRepository;
    scheduleRepository: ScheduleRepository
}
