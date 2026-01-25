import { createEffect, createSignal, For, Show, type Component } from "solid-js";
import { Dialog, type DialogProps } from "./index.jsx";
import { validateFetchMany, validateFetchOne } from "../../actions/validateFetch.js";
import { useParams } from "@solidjs/router";
import { ScheduleInfo, SchedulesList, type ScheduleInfoType } from "../../models/Schedule.js";

export const ManageInverterSchedulesDialog: Component<DialogProps> = (props) => {
    const params = useParams();
    const { id } = params;
    
    const [allSchedules, { refetch: r1 }] = validateFetchOne("/api/schedule", SchedulesList)
    const [schedules, { refetch: r2 }] = validateFetchMany(`/api/inverter/${id}/schedules`, ScheduleInfo);
    const [list, setList] = createSignal<ScheduleInfoType[]>([]);

    const refetch = () => {
        r1();
        r2();
    };

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

    const update = (list: ScheduleInfoType[]) => {
        fetch(`/api/inverter/${id}/schedules`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(list.map((i) => i.id)),
        });
    }

    const moveUp = (index: number) => {
        if (index === 0) {
            return;
        }
        const newList = [...list()];
        const tmp = newList[index];
        newList[index] = newList[index - 1];
        newList[index - 1] = tmp;
        setList(newList);
        update(newList);
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
        update(newList);
    };
    const removeSchedule = (index: number) => {
        const newList = list().filter((v, i) => i !== index);
        setList(newList);
        update(newList);
    }
    const addSchedule = (schedule: ScheduleInfoType) => {
        const newList = [schedule, ...list()];
        setList(newList);
        update(newList);
    }

    return <Dialog {...props}>
        <fieldset>
            <legend>Manage schedules</legend>
            <Show when={allSchedules.state === "ready"}>
                <select onChange={(e) => {
                    e.preventDefault();
                    const value = e.target.value;
                    const schedule = allSchedules.latest?.schedules.find((s) => s.id === value);
                    if (schedule) {
                        addSchedule(schedule);
                    }
                }}>
                    <option>Add schedule</option>
                    <For each={allSchedules.latest?.schedules.filter((s) => !list().some((ls) => ls.id === s.id))}>
                        {(schedule) => <option value={schedule.id}>{schedule.name} -- {schedule.type}</option>}
                    </For>
                </select>
            </Show>
            <Show when={schedules.state === "ready" && list().length}>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Move up</th>
                            <th>Move down</th>
                            <th>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        <For each={list()}>
                            {(schedule, i) => <tr>
                                <td>{schedule.name}</td>
                                <td>{schedule.type}</td>
                                <td><Show when={i() > 0}><button onClick={() => moveUp(i())}>⬆️</button></Show></td>
                                <td><Show when={i() < list().length - 1}><button onClick={() => moveDown(i())}>⬇️</button></Show></td>
                                <td><button onClick={() => removeSchedule(i())}>🗑️</button></td>
                            </tr>}
                        </For>
                    </tbody>
                </table>
            </Show>
        </fieldset>
    </Dialog>
}
