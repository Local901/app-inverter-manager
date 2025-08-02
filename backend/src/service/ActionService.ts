import { ActionTypes } from "../config/Action.js";
import type { Action } from "../models/Action.js";
import type { Inverter } from "../models/Inverter.js";
import type { ActionRepository } from "../repository/ActionRepository.js";
import type { InverterRepository } from "../repository/InverterRepository.js";
import { Status } from "../types/Status.js";

export class ActionService {
    private timeoutRef: NodeJS.Timeout | undefined;

    public constructor(
        public readonly inverterRepository: InverterRepository,
        public readonly actionRepository: ActionRepository,
    ) {
        this.startLoop();
    }

    private startLoop() {
        if (this.timeoutRef) {
            console.warn("Loop already active.");
            return;
        }
        let processing = false;
        this.timeoutRef = setInterval(async () => {
            if (processing) {
                console.warn("Previous process still in progress. (skip)");
                return
            }
            processing = true;
            try {
                await this.loop();
            } catch (err) {
                console.error(`Loop exited with an error:\n${err}\n${err instanceof Error ? err.stack : ""}`);
            } finally {
                processing = false;
            }
        }, 5 * 60000); // Every 5 minutes.
    }

    public stop(): void {
        clearTimeout(this.timeoutRef);
        this.timeoutRef = undefined;
    }

    private async loop(): Promise<void> {
        const inverters = await this.inverterRepository.getAllInverters();

        for (const inverter of inverters) {
            try {
                await inverter.start();

                if ((await inverter.getStatus()) !== Status.OK) {
                    // TODO: Add error message to the inverter to allow the user to know why no action was done.
                    continue;
                }
                const actions: Action[] = (await this.actionRepository.getActionsForInverter(inverter.id)).filter((action) => action.isActive());

                await this.performActions(inverter, actions);
            } finally {
                await inverter.stop();
            }
        }
    }

    private async performActions(inverter: Inverter, actions: Action[]): Promise<void> {
        if (actions.length === 0) {
            return;
        }
        for (const actionType of ActionTypes) {
            const action = actions.reduce<Action | null>((prev, next) => {
                if (next.action !== actionType) {
                    return prev;
                }
                if (!prev || (prev.repeatWeekly && !next.repeatWeekly )) {
                    return next;
                }
                if (!prev.repeatWeekly && next.repeatWeekly) {
                    return prev;
                }
                throw new Error("Action overlap. Can't resolve.");
            }, null);
            if (!action) {
                continue; // No action of type found.
            }

            switch (actionType) {
                case "charge": {
                    const value = Math.max(-(await inverter.getMaxDischargeRate()), Math.min(action.value, await inverter.getMaxChargeRate()));
                    console.log(`Charge ${inverter.id} => ${value}`);
                    await inverter.chargeBattery(value);
                    break;
                }
                default:
                    throw new Error(`Type '${actionType}' is not implemented.`);
            }
        }
    }
}
