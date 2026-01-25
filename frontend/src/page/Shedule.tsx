import { useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show, type Component } from "solid-js";
import { validateFetchOne } from "../actions/validateFetch.js";
import { Schedule } from "../models/Schedule.js";
import { Stack } from "../components/stack/index.jsx";
import { Direction } from "../types/Direction.js";
import { TimeZone } from "../elements/timeZone/index.jsx";
import { Table } from "../components/table/index.jsx";

const actions = ["charge"];

export const SchedulePage: Component = () => {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [schedule, { refetch }] = validateFetchOne(`/api/schedule/${id}`, Schedule);

    return <>
        <Stack direction={Direction.Vertical} gap="1em" padding="1em">
            <Show when={["ready", "refreshing"].includes(schedule.state)}>
                <h2>{schedule.latest?.name} <TimeZone timeZone={schedule.latest?.time_zone ?? 0}/></h2>
            </Show>
            <Table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <For each={actions}>
                            {(action) => <th>{action}</th>}
                        </For>
                    </tr>
                </thead>
                <tbody>
                    <For each={Array.apply(null, Array(24 * 4)).map((_v, i) => i * 15)}>
                        {(timeslot) => {
                            const timeActions = schedule.latest?.time_slots.find((ts) => ts.slot === timeslot);
                            return <tr>
                                <th>{`${Math.floor(timeslot / 60)}`.padStart(2, "0")}:{`${timeslot % 60}`.padStart(2, "0")}</th>
                                <For each={actions}>
                                    {(action) => <td>
                                        {timeActions?.actions[action] ?? ""}
                                    </td>}
                                </For>
                            </tr>
                        }}
                    </For>
                </tbody>
            </Table>
        </Stack>
    </>
}
