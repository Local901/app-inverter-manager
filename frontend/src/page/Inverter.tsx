import { useParams } from "@solidjs/router";
import { Show, type Component } from "solid-js";
import { validateFetchOne } from "../actions/validateFetch";
import { InverterNavBar } from "../components/navbar";
import { Stack } from "../components/stack";
import { InverterInfoValidator } from "../models/InverterInfo";
import { Direction } from "../types/Direction";
import { useModalController } from "../hooks/UseModalControls.js";

export const InverterPage: Component = () => {
    const params = useParams<{ id: string }>();
    const id = params.id;
    
    const modalController = useModalController();

    const [inverter] = validateFetchOne(`/api/inverter/${id}`, InverterInfoValidator);

    return <Show when={!!inverter.latest} fallback={<>404</>}>
        <InverterNavBar id={id}/>
        <Stack direction={Direction.Vertical} gap="1em" padding="1em">
            <h3>
                <img src={`/img/inverter/${inverter.latest?.type}.ico`} style={{ margin: "-0.25em 0", height: "1.5em", "padding-right": "0.5em" }}/>
                {inverter.latest!.name}
            </h3>
            <button onClick={() => modalController.showModal()}>Create action</button>
        </Stack>
    </Show>
};
