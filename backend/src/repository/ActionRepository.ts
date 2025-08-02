import type { Action } from "../models/Action.js";
import type { DataStore } from "../storage/DataStore.js";
import type { ActionCreationInfo } from "../types/Action.js";

export class ActionRepository {
    public constructor(private readonly store: DataStore) {

    }

    public async getAction(id: number): Promise<Action | null> {
        return this.store.getAction(id);
    }

    public async getActionsForInverter(inverterId: number, rangeStart?: Date, rangeEnd?: Date): Promise<Action[]> {
        return this.store.getActionsForInverter(inverterId, rangeStart, rangeEnd);
    }

    public async createAction(info: ActionCreationInfo): Promise<Action> {
        return this.store.createAction(info);
    }

    /**
     * Remove a action that only happens once.
     *
     * @param actionId Id of the action.
     * @returns True if action was removed, False if the action was not found/removed.
     */
    public async deleteAction(actionId: number): Promise<boolean> {
        return this.store.deleteAction(actionId);
    }

    /**
     * Queue the action to end at some time in the future.
     * If when if equal to or less than now the action will just be removed.
     * 
     * @param actionId Id of the action.
     * @param when The time the action should stop.
     * @returns True if the action was updated to stop at the suggested time.
     */
    public async endActionAt(actionId: number, when: Date): Promise<boolean> {
        return this.store.endActionAt(actionId, when);
    }

    /**
     * Split repeated action to skip a number of weeks.
     *
     * @param actionId Id of the action.
     * @param splitDate The date to start the split.
     * @param numberOfWeeks The number of weeks that should be removed (minimum 1).
     * @returns True when action was spit successfully.
     */
    public async stopActionForWeek(actionId: number, splitDate: Date, numberOfWeeks = 1): Promise<boolean>{
        const startDate = new Date(splitDate);
        startDate.setHours(startDate.getHours() + (24 * Math.max(1, numberOfWeeks)));
        return this.store.splitAction(actionId, splitDate, startDate);
    }
}
