import { In, Not, type EntityManager } from "typeorm";
import { Inverter, type InverterChild } from "../models/Inverter.js";
import { Status } from "../types/Status.js";
import { ItemRangeData, Schedule } from "../models/Schedule.js";
import type { ScheduleItem } from "../models/ScheduleItem.js";

type Actions = {
    /** Next action in number of seconds */
    nextAction: number;
    actions: Record<string, [number | undefined, number]>;
}

export class ActionService {
    private timeoutRef?: ReturnType<typeof setTimeout>;
    private processing = false;
    private inverterChecks: Record<number, number> = {}

    public constructor(
        private readonly manager: EntityManager,
    ) {
        void this.loop();
    }

    private async loop(): Promise<void> {
        if (this.processing) {
            console.warn("Previous process still in progress. (skip)");
            return
        }

        this.processing = true;
        try {
            await this.process();
        } catch (err) {
            console.error(`Loop exited with an error:\n${err}\n${err instanceof Error ? err.stack : ""}`);
        } finally {
            this.processing = false;
        }

        this.timeoutRef = setTimeout(
            this.loop.bind(this),
            Math.max(
                60000,
                Math.min(
                    Date.now() + (15 * 60 * 1000),
                    ...Object.values(this.inverterChecks),
                ) - Date.now(),
            ),
        );
    }

    public stop(): void {
        clearTimeout(this.timeoutRef);
        this.timeoutRef = undefined;
    }

    private async process(): Promise<void> {
        const inactiveInverters = Object.entries(this.inverterChecks)
            .filter(([,timestamp]) => timestamp > Date.now())
            .map(([key]) => key);
        const inverters = await this.manager.findBy(Inverter, { id: Not(In(inactiveInverters)) });

        for (const inverter of inverters) {
            try {
                console.log(`[${new Date().toISOString()}] Perform actions on '${inverter.name}'`);
                await inverter.connect(async (inv) => {
                    // if ((await inv.getStatus()) !== Status.OK) {
                    //     // TODO: Add error message to the inverter to allow the user to know why no action was done.
                    //     console.log(`Abort actions on ${inverter.name}. Status was not OK.`);
                    //     return;
                    // }

                    const schedules = await this.manager.find(Schedule, {
                        where: {
                            inverterRelations: {
                                inverterId: inv.id,
                            }
                        },
                        order: {
                            inverterRelations: {
                                order: "DESC",
                            },
                        },
                        relations: {
                            items: true,
                        },
                    });

                    const actions = await this.calculateActions(schedules);
                    console.log(actions);
                    this.inverterChecks[inv.id] = Date.now() + (actions.nextAction * 1000);
                    // await this.performActions(inv, actions);
                });
            } catch (error) {
                console.error(error);
            }
        }
    }

    private valueBetween(value: number, start: number, end: number): boolean {
        if (start <= end) {
            return start <= value && value < end;
        }
        return value < end || start <= value;
    }

    private filterItems(schedule: Schedule): (item: ScheduleItem) => boolean {
        const range = schedule.getItemRange();
        return (item) => {
            if (!item.endAt) {
                return this.valueBetween(item.startAt, ...range);
            }
            const now = schedule.getNow();
            return this.valueBetween(now, item.startAt, item.endAt);
        }
    }

    private sortItems(schedule: Schedule): (i1: ScheduleItem, i2: ScheduleItem) => number {
        const now = schedule.getNow();
        const data = ItemRangeData[schedule.type];
        return (i1, i2) => {
            const t1 = (i1.startAt - now) % data.range;
            const t2 = (i2.startAt - now) % data.range;
            return t1 - t2;
        }
    }

    private async calculateActions(schedules: Schedule[]): Promise<Actions> {
        const result: Actions = {
            nextAction: 15 * 60, // Max timeout of 15 minutes
            actions: {
                charge: [undefined, 0],
            },
        };

        for (const schedule of schedules) {
            if (!schedule.items) {
                continue;
            }

            const now = schedule.getNow();
            const actions: Partial<Record<string, [number, number]>> = {};
            const items = schedule.items
                .filter(this.filterItems(schedule))
                .sort(this.sortItems(schedule));
            
            for (const item of items) {
                actions[item.action] = [item.startAt, item.value];
            }

            // Apply action
            for (const [action, actionValue] of Object.entries(actions)) {
                if (!actionValue) continue;

                const currentActionValue = result.actions[action];
                if (currentActionValue[0] === undefined) {
                    result.actions[action] = actionValue;
                    continue;
                }
                if (currentActionValue[0] > now) {
                    if (currentActionValue[0] <= actionValue[0] || actionValue[0] <= now) {
                        result.actions[action] = actionValue;
                    }
                    continue;
                }
                if (currentActionValue[0] <= now && actionValue[0] <= now) {
                    if (currentActionValue[0] <= actionValue[0]) {
                        result.actions[action] = actionValue;
                    }
                }
            }

            // Find Next action time stamp
            const data = ItemRangeData[schedule.type];
            const maxNext = data.isDiscreet
                ? (Math.ceil(now / data.before) * data.before) - now
                : data.before;
            const nextItem = schedule.items
                .sort((i1, i2) => {
                    const t1 = i1.getTimeTillUpdate(now, data.range);
                    const t2 = i2.getTimeTillUpdate(now, data.range);
                    return t1 - t2;
                }) // First item should also be able to be a item that ends first.
                .shift();
            if (!nextItem) {
                continue;
            }
            // Next action in at least one minute or the first action that updates what should happen.
            result.nextAction = Math.max(60, Math.min(result.nextAction, maxNext, nextItem.getTimeTillUpdate(now, data.range)));
        }

        return result;
    }

    private async performActions(inverter: InverterChild, actions: Actions): Promise<void> {
        await inverter.chargeBattery(actions.actions["charge"][1]);
    }
}
