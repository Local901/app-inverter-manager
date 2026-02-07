import type { Component } from "solid-js";

export const TimeZone: Component<{ timeZone: number }> = ({ timeZone }) => {
    const absTime = Math.abs(timeZone) / 60;
    const hours = `${Math.round(absTime / 60)}`.padStart(2, "0");
    const minutes = `${absTime % 60}`.padStart(2, "0");

    return <span class="el-time-zone">
        {(timeZone < 0) ? "-" : "+"}{hours}:{minutes}
    </span>
}
