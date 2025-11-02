import { LessThan, MoreThan, type DeepPartial, type Repository } from "typeorm";
import type { Action } from "../models/Action.js";
import type { ActionCreationInfo } from "../types/Action.js";

export class ActionRepository {
    public constructor(private readonly repo: Repository<Action>) {

    }

    public async getAction(id: number): Promise<Action | null> {
        return this.repo.findOneBy({ id });
    }

    public async getActionsForInverter(inverterId: number, rangeStart?: Date, rangeEnd?: Date): Promise<Action[]> {
        return this.repo.findBy({
            inverterId,
            activeFrom: rangeEnd ? LessThan(rangeEnd) : undefined,
            activeUntil: rangeStart ? MoreThan(rangeStart) : undefined,
        });
    }

    public async createAction(info: ActionCreationInfo): Promise<Action> {
        const action = this.repo.create(info);
        await this.repo.save(action);
        return action;
    }

    /**
     * Remove a action that only happens once.
     *
     * @param actionId Id of the action.
     * @returns True if action was removed, False if the action was not found/removed.
     */
    public async deleteAction(actionId: number): Promise<boolean> {
        return (await this.repo.delete({ id: actionId })).affected !== 0;
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
        return (await this.repo.update({ id: actionId }, {
            deletedAt: when,
        })).affected !== 0;
    }

    public async splitAction(actionId: number, from: Date, to: Date): Promise<Action | null> {
        const action = await this.getAction(actionId);
        if (!action) {
            return null;
        }

        if (action.deletedAt && action.deletedAt.getTime() <= to.getTime()) {
            if (action.deletedAt.getTime() > from.getTime()) {
                action.deletedAt = from;
            }
            return null;
        }
        
        this.repo.create()
        const action2 = this.repo.create({
            inverterId: action.inverterId,
            action: action.action,
            value: action.value,
            activeFrom: action.activeFrom,
            activeUntil: action.activeUntil,
            repeatWeekly: action.repeatWeekly,
            createAt: to,
            deletedAt: action.deletedAt,
        } as DeepPartial<Action>);

        await this.repo.save([action, action2]);

        return action2;
    }
}
