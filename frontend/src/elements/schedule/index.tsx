import { FieldSet } from "src/components/fieldSet"
import { TimeChart, type TimeChartProps } from "./timeChart.jsx";
import type { Component } from "solid-js";

const Hours = [...Array(24).keys()];

export const Schedule: Component<TimeChartProps> = (props) => {

    return <>
        <FieldSet class="schedule">
            <legend>Schedule</legend>
            <TimeChart {...props}/>
            
        </FieldSet>
    </>
}
