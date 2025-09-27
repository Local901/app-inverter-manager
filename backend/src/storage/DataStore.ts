import type { GeneralSettings } from "../types/Inverter.js";
import type { InverterData } from "./types/InverterData.js";
import type { Action } from "../models/Action.js";
import type { ActionCreationInfo } from "../types/Action.js";
import type { Schedule } from "../models/Schedule.js";
import type { ScheduleCreationInfo } from "../types/Schedule.js";

export interface DataStore {

    start(): Promise<void>;
    stop(): Promise<void>;


    saveNewInverter(data: Omit<InverterData, "id">): Promise<number>;
    saveOptions(id: number, name: string, options: GeneralSettings): Promise<boolean>;
    getInverterById(id: number): Promise<InverterData | null>;
    getAllInverters(): Promise<InverterData[]>;
    deleteInverterById(id: number): Promise<boolean>;


    getAction(id: number): Promise<Action | null>;
    getActionsForInverter(inverterId: number, rangeStart?: Date, rangeEnd?: Date): Promise<Action[]>;
    createAction(info: ActionCreationInfo): Promise<Action>;

    /**
     * Remove a action that only happens once.
     *
     * @param actionId Id of the action.
     * @returns True if action was removed, False if the action was not found/removed.
     */
    deleteAction(actionId: number): Promise<boolean>;
    
    /**
     * Queue the action to end at some time in the future.
     * If when if equal to or less than now the action will just be removed.
     * 
     * @param actionId Id of the action.
     * @param when The time the action should stop.
     * @returns True if the action was updated to stop at the suggested time.
     */
    endActionAt(actionId: number, when: Date): Promise<boolean>;
    
    /**
     * Split repeated action to skip a number of weeks.
     *
     * @param actionId Id of the action.
     * @param fromDate The time the action should be cut at.
     * @param toDate The time the copy of the action should start at.
     * @returns True when action was spit successfully.
     */
    splitAction(actionId: number, fromDate: Date, toDate: Date): Promise<Action | null>;


    getSchedule(inverterId: number): Promise<Schedule[]>;
    createScheduleElement(data: ScheduleCreationInfo): Promise<Schedule>;
    deleteScheduleElement(id: number): Promise<boolean>;
}
