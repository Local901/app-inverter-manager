import type { ActionInfo } from "../types/Action.js";

const sevenDaysMilliseconds = (1000 * 60 * 60 * 24 * 7) // seven days in milliseconds.

export class Action {
    id!: number;
    inverterId!: number;
    action!: string;
    activeFrom!: Date;
    activeUntil!: Date;
    repeatWeekly!: boolean;
    value!: number;
    createdAt!: Date;
    deletedAt?: Date;

    public isActive(nowOverride?: Date) {
        const now = nowOverride?.getTime() ?? Date.now();
        
        if (this.deletedAt && this.deletedAt.getTime() < now) {
            return false;
        }
        if (this.repeatWeekly) {
            const weekRangeNow = now % sevenDaysMilliseconds;
            const rangedFrom = this.activeFrom.getTime() % sevenDaysMilliseconds;
            const rangedUntil = this.activeUntil.getTime() % sevenDaysMilliseconds;
            
            // When the time is scoped to 7 days.
            // Now is inside the range 'from' to 'until' when:
            // * the ranged now is greater then 'from' and less than 'until'.
            // * or the ranged now is greater than 'from' or ranged now is less than 'until', but not at the same time.
            return (rangedFrom <= weekRangeNow && weekRangeNow < rangedUntil) ||
            (rangedUntil < rangedFrom && !(rangedUntil <= weekRangeNow && weekRangeNow < rangedFrom))
        } else {
            return this.activeFrom.getTime() <= now && now < this.activeUntil.getTime();
        }
    }

    public getMessage(startRange: Date, endRange: Date): ActionInfo | null {
        const startTime = startRange.getTime();
        const endTime = endRange.getTime();
        let activeFrom = this.activeFrom.getTime();
        let activeUntil = this.activeUntil.getTime();

        if (
            (!this.repeatWeekly && (activeUntil < startTime || endTime < activeFrom)) ||
            endTime < this.createdAt.getTime() ||
            (this.deletedAt && this.deletedAt.getTime() < startTime)
        ) {
            return null;
        }

        if (this.repeatWeekly) {
            const weekDiff = Math.floor(startTime / sevenDaysMilliseconds) - Math.floor(activeFrom / sevenDaysMilliseconds);
            activeFrom = activeFrom + weekDiff * sevenDaysMilliseconds;
            activeUntil = activeUntil + weekDiff * sevenDaysMilliseconds;
            if (activeUntil < startTime || endTime < activeFrom) {
                activeFrom = activeFrom + sevenDaysMilliseconds;
                activeUntil = activeUntil + sevenDaysMilliseconds;
                if (activeUntil < startTime || endTime < activeFrom) {
                    return null;
                }
            }
        }

        activeFrom = Math.max(this.createdAt.getTime(), activeFrom);
        activeUntil = this.deletedAt ? Math.min(this.deletedAt.getTime(), activeUntil) : activeUntil;
        const timeDiff = endTime - startTime;

        return {
            id: this.id.toString(),
            action: this.action,
            value: this.value,
            repeatsWeekly: this.repeatWeekly,
            start: timeDiff === 0 ? 0 : ((activeFrom - startTime) / timeDiff),
            end: timeDiff === 0 ? 0 : ((endTime - activeUntil) / timeDiff),
        }
    }
}
