import { For, Show, type Component } from "solid-js";
import { validateFetchOne } from "../actions/validateFetch.js";
import { SchedulesList } from "../models/Schedule.js";
import { useModalController } from "../hooks/UseModalControls.js";
import { CreateScheduleDialog } from "../components/dialog/CreateScheduleDialog.jsx";
import { Stack } from "../components/stack/index.jsx";
import { Direction } from "../types/Direction.js";
import { NavButton } from "../components/navButton/index.jsx";
import { Panel } from "../components/panel/index.jsx";
import { Status } from "../types/Status.js";

export const SchedulePage: Component = () => {
    const [schedules, { refetch }] = validateFetchOne("/api/schedule", SchedulesList);
    const modalController = useModalController();

    return <>
        <Stack direction={Direction.Vertical} gap="1em" padding="1em">
            <Stack direction={Direction.Horizontal}>
                <button onClick={modalController.showModal}>Add Schedule</button>
            </Stack>
            <Stack direction={Direction.Vertical} gap="0.25em">
                <Show when={schedules.state === "ready"}>
                    <For each={schedules.latest?.schedules ?? []}>
                        {(schedule) => <NavButton href={`/schedule/${schedule.id}`}>
                            <Panel color={Status.OK}>
                                <Stack direction={Direction.Horizontal} gap="0.5em">
                                    <span>{schedule.name}</span>
                                    <div style={{ "flex-grow": 1 }}/>
                                    <span>{schedule.type}</span>
                                </Stack>
                            </Panel>
                        </NavButton>}
                    </For>
                </Show>
            </Stack>
        </Stack>
        <CreateScheduleDialog controller={modalController} onSuccess={() => refetch() }/>
    </>;
}
