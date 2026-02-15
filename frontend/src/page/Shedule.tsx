import { useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show, type Component } from "solid-js";
import { validateFetchOne } from "../actions/validateFetch.js";
import { Schedule } from "../models/Schedule.js";
import { Stack } from "../components/stack/index.jsx";
import { Direction } from "../types/Direction.js";
import { TimeZone } from "../elements/timeZone/index.jsx";
import { Table } from "../components/table/index.jsx";
import { UpdateScheduleDialog } from "../components/dialog/UpdateScheduleDialog.jsx";
import { useModalController } from "../hooks/UseModalControls.js";
import { ManageTimeslotDialog } from "../components/dialog/ManageTimeslotDialog.jsx";
import type { TimeslotType } from "../models/TimeSlot.js";

const actions = ["charge", "min-soc"];

export const SchedulePage: Component = () => {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const controller = useModalController();
    const timeSlotController = useModalController();
    const [timeslot, setTimeslot] = createSignal<null | number>(null);
    const [timeslots, setTimeslots] = createSignal<Array<{ timeslot: number, type: TimeslotType | undefined }>>([]);
    const [showQuarters, setShowQuarters] = createSignal(true);

    const [schedule, { refetch }] = validateFetchOne(`/api/schedule/${id}`, Schedule);

    createEffect(() => {
        if (!schedule.latest) {
            return;
        }
        const list: Array<{ timeslot: number, type: TimeslotType | undefined }> = [];
        for (const time of Array.apply(null, Array(24 * (showQuarters() ? 4 : 1))).map((_v, i) => i * 900 * (showQuarters() ? 1 : 4))) {
            list.push({
                timeslot: time,
                type: schedule.latest?.time_slots.find((ts) => ts.slot === time)
            });
        }
        setTimeslots(list);
    });

    return <>
        <Stack direction={Direction.Vertical} gap="1em" padding="1em">
            <Stack direction={Direction.Horizontal}>
                <Show when={["ready", "refreshing"].includes(schedule.state)}>
                    <h2>{schedule.latest?.name} <TimeZone timeZone={schedule.latest?.time_zone ?? 0}/></h2>
                </Show>
                <div style={{ "flex-grow": 1 }}></div>
                <button title="settings" onClick={() => controller.showModal()}>⚙️</button>
            </Stack>
            <div class="ui-input">
                <label class="ui-input-label" for="showQuarters" title="Show only hours">Show only hours </label>
                <input
                    class="ui-input-control"
                    id="showQuarters"
                    type="checkbox"
                    value={`${showQuarters()}`}
                    onChange={(event) => { console.log(event.target.value, typeof event.target.value); setShowQuarters(!showQuarters())}}
                />
            </div>
            <Table class="schedule">
                <thead>
                    <tr>
                        <th>Time</th>
                        <For each={actions}>
                            {(action) => <th>{action}</th>}
                        </For>
                    </tr>
                </thead>
                <tbody>
                    <For each={timeslots()}>
                        {(data) => {
                            return <tr class={`m_${data.timeslot % 3600}`} onClick={() => {
                                    setTimeslot(data.timeslot);
                                    timeSlotController.showModal();
                                }}>
                                <th>{`${Math.floor(data.timeslot / 3600)}`.padStart(2, "0")}:{`${(data.timeslot / 60) % 60}`.padStart(2, "0")}</th>
                                <For each={actions}>
                                    {(action) => <td>
                                        {data.type?.actions[action] ?? ""}
                                    </td>}
                                </For>
                            </tr>
                        }}
                    </For>
                </tbody>
            </Table>
        </Stack>
        <Show when={schedule.latest}>
            <UpdateScheduleDialog schedule={schedule.latest!} controller={controller} onSuccess={() => refetch()}/>
        </Show>
        <Show when={schedule.latest}>
            <ManageTimeslotDialog
                controller={timeSlotController} 
                scheduleId={schedule.latest!.id} 
                timeslot={timeslot()!} 
                onClose={() => setTimeslot(null)}
                onSuccess={() => refetch()}
            />
        </Show>
    </>
}
