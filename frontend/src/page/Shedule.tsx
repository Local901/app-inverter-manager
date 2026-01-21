import { useParams } from "@solidjs/router";
import { Show, type Component } from "solid-js";
import { validateFetchOne } from "../actions/validateFetch.js";
import { Schedule } from "../models/Schedule.js";
import { Stack } from "../components/stack/index.jsx";
import { Direction } from "../types/Direction.js";

export const SchedulePage: Component = () => {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [schedule] = validateFetchOne(`/api/schedule/${id}`, Schedule);

    return <>
        <Stack direction={Direction.Vertical} gap="1em" padding="1em">
            <Show when={["ready", "refreshing"].includes(schedule.state)}>
                <h2>{schedule.latest?.name}</h2>
            </Show>
        </Stack>
    </>
}
