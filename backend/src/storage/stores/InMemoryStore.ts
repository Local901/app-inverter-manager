import type { GeneralSettings } from "../../types/Inverter.js";
import { DataStore } from "../DataStore.js";
import type { InverterData } from "../types/InverterData.js";
import { Action } from "../../models/Action.js";
import type { ActionCreationInfo } from "../../types/Action.js";

export class InMemoryStore implements DataStore {
    private readonly inverters: Record<number, InverterData> = {};
    private actionId = 1;
    private readonly actions: Record<number, Action[]> = {};

    /** @inheritdoc */
    public async start(): Promise<void> {
        return;
    }
    /** @inheritdoc */
    public async stop(): Promise<void> {
        return;
    }

    // ##### INVERTERS #####

    /** @inheritdoc */
    public async saveNewInverter(data: InverterData): Promise<number> {
        if (!data.id) {
            data.id = Math.max(...Object.keys(this.inverters).map((k) => Number(k)), 0) + 1;
        }
        this.inverters[data.id] = { ...data };
        return data.id;
    }

    /** @inheritdoc */
    public async saveOptions(id: number, name: string, options: GeneralSettings): Promise<boolean> {
        const data = this.inverters[id];
        if (!data) {
            return false;
        }
        data.name = name;
        data.options = options;
        return true;
    }

    /** @inheritdoc */
    public async getInverterById(id: number): Promise<InverterData | null> {
        const result = this.inverters[id];
        if (!result) {
            return null;
        }
        return {
            ...result,
        };
    }

    /** @inheritdoc */
    public async getAllInverters(): Promise<InverterData[]> {
        return Object.values(this.inverters);
    }

    /** @inheritdoc */
    public async deleteInverterById(id: number): Promise<boolean> {
        delete this.inverters[id];
        return true;
    }

    // ##### ACTIONS #####

    /** @inheritdoc */
    public async getActionsForInverter(inverterId: number, rangeStart?: Date, rangeEnd?: Date): Promise<Action[]> {
        const start = rangeStart?.getTime() ?? Date.now();
        const end = rangeEnd?.getTime() ?? Date.now();
        return (this.actions[inverterId] ?? [])
            .filter((action) => action.createdAt.getTime() <= end && (!action.deletedAt || start < action.deletedAt.getTime()));
    }

    /** @inheritdoc */
    public async createAction(info: ActionCreationInfo): Promise<Action> {
        this.actions[info.inverterId] ??= [];

        const action = new Action();
        Object.assign(action, {
            id: this.actionId++,
            inverterId: info.inverterId,
            action: info.action,
            activeFrom: info.activeFrom,
            activeUntil: info.activeUntil,
            repeatWeekly: info.repeatWeekly,
            value: info.value,
            createAt: new Date(),
        } as Partial<Action>);

        this.actions[info.inverterId].push(action);
        return action;
    }

    /** @inheritdoc */
    public async deleteAction(actionId: number): Promise<boolean> {
        for (const actions of Object.values(this.actions)) {
            for (let i = 0; i < actions.length; i++) {
                const action = actions[i];
                if (action.id === actionId) {
                    actions.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    public async getAction(actionId: number): Promise<Action | null> {
        for (const actions of Object.values(this.actions)) {
            for (let i = 0; i < actions.length; i++) {
                const action = actions[i];
                if (action.id === actionId) {
                    actions.splice(i, 1);
                    return action;
                }
            }
        }
        return null;
    }

    /** @inheritdoc */
    public async endActionAt(actionId: number, when: Date): Promise<boolean> {
        const action = await this.getAction(actionId);
        if (!action) {
            return false;
        }
        action.deletedAt = when;
        return true;
    }

    /** @inheritdoc */
    public async splitAction(actionId: number, endDate: Date, startDate: Date): Promise<boolean> {
        const action = await this.getAction(actionId);
        if (!action) {
            return false;
        }

        if (action.deletedAt && action.deletedAt.getTime() <= startDate.getTime()) {
            action.deletedAt = endDate;
            return true;
        }

        const action2 = new Action();
        Object.assign(action, {
            id: this.actionId++,
            inverterId: action.inverterId,
            action: action.action,
            activeFrom: action.activeFrom,
            activeUntil: action.activeUntil,
            repeatWeekly: action.repeatWeekly,
            value: action.value,
            createAt: startDate,
        } as Partial<Action>);

        this.actions[action.inverterId].push(action2);

        action.deletedAt = endDate;

        return true;
    }
}
