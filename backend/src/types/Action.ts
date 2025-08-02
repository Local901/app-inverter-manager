
export interface ActionInfo {
    /** Identifier of the action. */
    id: string;
    /** The action. */
    action: string;
    /** The value this action is set to. */
    value: number;
    /** Does the action repeat every week. */
    repeatsWeekly?: boolean;
    /** Percentage of the range from which it should start. */
    start: number;
    /** Percentage of the range after which it should end. */
    end: number;
}

export interface ActionCreationInfo {
    inverterId: number,
    action: string,
    value: number,
    activeFrom: Date,
    activeUntil: Date,
    repeatWeekly?: boolean,
}
