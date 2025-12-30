import { For, Show, type Component } from "solid-js";
import { Stack } from "../components/stack";
import { Direction } from "../types/Direction";
import { NavButton } from "../components/navButton";
import { Panel } from "../components/panel";
import { validateFetchOne } from "../actions/validateFetch";
import { InverterInfoShortValidator } from "../models/InverterInfoShort";
import { Status } from "../types/Status";
import { CreateInverterDialog } from "../components/dialog/CreateInverterDialog";
import { useModalController } from "../hooks/UseModalControls.js";

export const InvertersPage: Component = () => {
    const [inverters, { refetch }] = validateFetchOne("/api/inverter", InverterInfoShortValidator);
    const modalController = useModalController();

    return <>
        <Stack direction={Direction.Vertical} gap="1em" padding="1em">
            <Stack direction={Direction.Horizontal}>
                <button onClick={modalController.showModal}>Add Inverter</button>
            </Stack>
            <Stack direction={Direction.Vertical} gap="0.25em">
                <Show when={inverters.state === "ready"}>
                    <For each={inverters.latest?.inverters ?? []}>
                        {(item, index) => <NavButton href={`/inverter/${item.id}`}>
                            <Panel color={item.status}>
                                <Stack direction={Direction.Horizontal} gap="0.5em">
                                    <img src={`/img/inverter/${item.type}.ico`} style={{ margin: "-0.25em 0", height: "1.5em" }}/>
                                    <span>{item.name}</span>
                                    <div style={{ "flex-grow": 1 }}></div>
                                    <span>{Status[item.status]}</span>
                                </Stack>
                            </Panel>
                        </NavButton>}
                    </For>
                </Show>
            </Stack>
        </Stack>
        <CreateInverterDialog controller={modalController} onSuccess={() => refetch()}/>
    </>
}
