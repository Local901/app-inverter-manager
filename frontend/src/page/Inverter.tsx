import { useParams } from "@solidjs/router";
import { createSignal, Show, type Component } from "solid-js";
import { validateFetchOne } from "src/actions/validateFetch";
import type { DialogControls } from "src/components/dialog";
import { CreateActionDialog } from "src/components/dialog/CreateActionDialog";
import { InverterNavBar } from "src/components/navbar";
import { Stack } from "src/components/stack";
import { Schedule } from "src/elements/schedule";
import { InverterInfoValidator } from "src/models/InverterInfo";
import { Direction } from "src/types/Direction";

export const InverterPage: Component = () => {
    const params = useParams<{ id: string }>();
    const id = params.id;
    
    const [dialogControls, setDialogControls] = createSignal<DialogControls | undefined>();

    const [inverter] = validateFetchOne(`/api/inverter/${id}`, InverterInfoValidator);

    return <Show when={!!inverter.latest} fallback={<>404</>}>
        <InverterNavBar id={id}/>
        <Stack direction={Direction.Vertical} gap="1em" padding="1em">
            <h3>
                <img src={`/img/inverter/${inverter.latest?.type}.ico`} style={{ margin: "-0.25em 0", height: "1.5em", "padding-right": "0.5em" }}/>
                {inverter.latest!.name}
            </h3>
            <button onClick={() => dialogControls()?.showDialog()}>Create action</button>
            <Schedule inverterId={id}/>
        </Stack>
        <CreateActionDialog inverterId={id} controls={setDialogControls}/>
    </Show>
};
