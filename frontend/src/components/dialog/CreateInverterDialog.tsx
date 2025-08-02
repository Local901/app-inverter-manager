import { createEffect, createSignal, For, Show, type Component } from "solid-js";
import { Dialog, type DialogProps } from ".";
import { FormConfigValidator } from "src/models/FormConfig";
import { validateFetchMany, validateFetchOne } from "src/actions/validateFetch";
import { v } from "@local901/validator";
import { GeneratedForm } from "../generatedForm";

export const CreateInverterDialog: Component<DialogProps> = (props) => {
    const [selectedType, setType] = createSignal("");

    const [formConfig, { refetch: formRefresh }] = validateFetchOne(() => `/api/inverter/create/${selectedType()}`, FormConfigValidator);
    const [types] = validateFetchMany("/api/inverter/types", v.string());
    
    createEffect(() => {
        if (types.latest && selectedType() === "") {
            setType(types.latest[0]);
            formRefresh();
        }
    });
    
    return <Dialog controls={props.controls} onClose={props.onClose} open={props.open}>
        <fieldset>
            <legend>Create a new <select name="type" id="type" autofocus onChange={(event) => {
                setType(event.target.value);
                formRefresh();
            }}>
                <For each={types.latest ?? []}>
                    {(item) => <option value={item}>{item}</option>}
                </For>
            </select> inverter</legend>
            
            <Show when={formConfig.state === "ready"}>
                <GeneratedForm uri={formConfig.latest?.href ?? ""} config={formConfig.latest?.data ?? {}} />
            </Show>
        </fieldset>
    </Dialog>

}
