import { ActionTypes } from "../config/Action.js";
import type { Action } from "../models/Action.js";
import type { Inverter } from "../models/Inverter.js";
import type { ActionRepository } from "../repository/ActionRepository.js";
import type { InverterRepository } from "../repository/InverterRepository.js";
import type { ScheduleRepository } from "../repository/ScheduleRepository.js";
import { Status } from "../types/Status.js";

type actionLike = {
    action: string,
    value: number,
    repeatWeekly?: boolean,
    schedule?: boolean,
}

export class ActionService {
    private timeoutRef: NodeJS.Timeout | undefined;
    private processing = false;

    public constructor(
        public readonly inverterRepository: InverterRepository,
        public readonly actionRepository: ActionRepository,
        public readonly scheduleRepository: ScheduleRepository,
    ) {
        this.startLoop();
    }

    private startLoop() {
        if (this.timeoutRef) {
            console.warn("Loop already active.");
            return;
        }
        let processing = false;

        const action = async () => {
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
        }

        this.timeoutRef = setInterval(action, 5 * 60000); // Every 5 minutes.
        setImmediate(action);
    }

    public stop(): void {
        clearTimeout(this.timeoutRef);
        this.timeoutRef = undefined;
    }

    private async loop(): Promise<void> {
        const inverters = await this.inverterRepository.getAllInverters();
        const now = new Date();

        for (const inverter of inverters) {
            try {
                console.log(`Perform actions on ${inverter.name}`);
                await inverter.start();

                if ((await inverter.getStatus()) !== Status.OK) {
                    // TODO: Add error message to the inverter to allow the user to know why no action was done.
                    console.log(`Abort actions on ${inverter.name}. Status was not OK.`);
                    continue;
                }

                const [actions, schedule] = await Promise.all([
                    this.actionRepository.getActionsForInverter(inverter.id).then((result) => result.filter((action) => action.isActive(now))),
                    this.scheduleRepository.getScheduleForInverter(inverter.id).then((result) => result.filter((schedule) => schedule.isActive(now)).map((s) => ({ 
                        action: s.action,
                        value: s.value,
                        schedule: true,
                    } as actionLike))),
                ]);

                await this.performActions(inverter, [...actions, ...schedule]);
            } catch (error) {
                console.error(error);
            } finally {
                await inverter.stop();
            }
        }
    }

    private async performActions(inverter: Inverter, actions: actionLike[]): Promise<void> {
        if (actions.length === 0) {
            return;
        }
        for (const actionType of ActionTypes) {
            const action = actions.reduce<actionLike | null>((prev, next) => {
                if (next.action !== actionType) {
                    return prev;
                }
                if (!prev || (prev.repeatWeekly && !next.repeatWeekly ) || (prev.schedule && (!next.repeatWeekly || !next.schedule))) {
                    return next;
                }
                if ((!prev.repeatWeekly && !prev.schedule) && (next.repeatWeekly || next.schedule)) {
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
