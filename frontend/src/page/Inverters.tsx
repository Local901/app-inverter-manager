import { createSignal, For, Show, type Component } from "solid-js";
import { Stack } from "src/components/stack";
import { Direction } from "src/types/Direction";
import { type DialogControls } from "src/components/dialog";
import { NavButton } from "src/components/navButton";
import { Panel } from "src/components/panel";
import { validateFetchMany } from "src/actions/validateFetch";
import { InverterInfoShortValidator } from "src/models/InverterInfoShort";
import { Status } from "src/types/Status";
import { CreateInverterDialog } from "src/components/dialog/CreateInverterDialog";

export const InvertersPage: Component = () => {
    const [inverters] = validateFetchMany("/api/inverter", InverterInfoShortValidator);
    const [dialogControls, setDialogControls] = createSignal<DialogControls | undefined>();

    return <>
        <Stack direction={Direction.Vertical} gap="1em" padding="1em">
            <Stack direction={Direction.Horizontal}>
                <button onClick={dialogControls()?.showDialog}>Add Inverter</button>
            </Stack>
            <Stack direction={Direction.Vertical} gap="0.25em">
                <Show when={inverters.state === "ready"}>
                    <For each={inverters.latest ?? []}>
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
        <CreateInverterDialog controls={setDialogControls}/>
    </>
}
