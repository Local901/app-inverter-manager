import { createEffect, createSignal, For, Show, type Component } from "solid-js";
import { Dialog, type DialogProps } from "./index.jsx";
import { validateFetchMany } from "../../actions/validateFetch.js";
import { useParams } from "@solidjs/router";
import { ScheduleInfo, type ScheduleInfoType } from "../../models/Schedule.js";

export const ManageInverterSchedulesDialog: Component<DialogProps> = (props) => {
    const params = useParams();
    const { id } = params;
    
    const [schedules, { refetch }] = validateFetchMany(`/inverter/${id}/schedules`, ScheduleInfo);
    const [list, setList] = createSignal<ScheduleInfoType[]>([]);

    createEffect(() => {
        return props.controller?.mountControls({
            close: () => {},
            show: () => refetch(),
            showModal: () => refetch(),
        });
    });
    createEffect(() => {
        if (schedules.latest) {
            setList([...schedules.latest]);
        }

        return () => {
            setList([]);
        }
    }, [schedules]);

    const moveUp = (index: number) => {
        if (index === 0) {
            return;
        }
        const newList = [...list()];
        const tmp = newList[index];
        newList[index] = newList[index - 1];
        newList[index - 1] = tmp;
        setList(newList);
    };
    const moveDown = (index: number) => {
        if (index === list().length - 1) {
            return;
        }
        const newList = [...list()];
        const tmp = newList[index];
        newList[index] = newList[index + 1];
        newList[index + 1] = tmp;
        setList(newList);
    };

    return <Dialog {...props}>
        <fieldset>
            <legend>Manage schedules</legend>
            <Show when={schedules.state === "ready"}>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Move up</th>
                            <th>Move down</th>
                        </tr>
                    </thead>
                    <tbody>
                        <For each={list()}>
                            {(schedule, i) => <tr>
                                <td>{schedule.name}</td>
                                <td>{schedule.type}</td>
                                <td><Show when={i() > 0}><button onClick={() => moveUp(i())}>/\</button></Show></td>
                                <td><Show when={i() < list().length - 1}><button onClick={() => moveDown(i())}>\/</button></Show></td>
                            </tr>}
                        </For>
                    </tbody>
                </table>
            </Show>
        </fieldset>
    </Dialog>
}
