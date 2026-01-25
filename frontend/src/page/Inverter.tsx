import { useParams } from "@solidjs/router";
import { For, Show, type Component } from "solid-js";
import { validateFetchOne } from "../actions/validateFetch";
import { InverterNavBar } from "../components/navbar";
import { Stack } from "../components/stack";
import { InverterInfoValidator } from "../models/InverterInfo";
import { Direction } from "../types/Direction";
import { useModalController } from "../hooks/UseModalControls.js";
import { FieldSet } from "../components/fieldSet/index.jsx";
import { ManageInverterSchedulesDialog } from "../components/dialog/ManageInverterSchedulesDialog.jsx";

export const InverterPage: Component = () => {
    const params = useParams<{ id: string }>();
    const id = params.id;
    
    const modalController = useModalController();

    const [inverter, { refetch }] = validateFetchOne(`/api/inverter/${id}`, InverterInfoValidator);

    return <Show when={!!inverter.latest}>
        <InverterNavBar id={id}/>
        <Stack direction={Direction.Vertical} gap="1em" padding="1em">
            <h3>
                <img src={`/img/inverter/${inverter.latest?.type}.ico`} style={{ margin: "-0.25em 0", height: "1.5em", "padding-right": "0.5em" }}/>
                {inverter.latest!.name}
            </h3>
            <FieldSet>
                <table style={{ width: "100%" }}>
                    <thead>
                        <tr><th>
                            <Stack direction={Direction.Horizontal}>
                                Schedules
                                <div style={{ "flex-grow": 1 }}></div>
                                <button onClick={() => modalController.showModal()}>Manage</button>
                            </Stack>
                        </th></tr>
                    </thead>
                    <tbody>
                        <For each={inverter.latest?.schedules ?? []}>
                            {(schedule) => <tr>
                                <td><a href={`/schedule/${schedule.id}`}>{schedule.name}</a></td>
                            </tr>}
                        </For>
                    </tbody>
                </table>
            </FieldSet>
        </Stack>
        {inverter.error}
        <ManageInverterSchedulesDialog controller={modalController} onClose={() => { refetch(); }}/>
    </Show>
};
