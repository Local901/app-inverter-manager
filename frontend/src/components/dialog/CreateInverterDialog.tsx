import { createEffect, createSignal, For, Show, type Component } from "solid-js";
import { Dialog, type DialogProps } from ".";
import { FormConfigValidator, getInputTypeOfType } from "../../models/FormConfig";
import { v } from "@local901/validator";
import { validateFetchMany, validateFetchOne } from "../../actions/validateFetch.js";
import { Form } from "../form/index.jsx";
import { Stack } from "../stack/index.jsx";
import { Direction } from "../../types/Direction.js";
import { Input } from "../../elements/input/index.jsx";
import { sendJson } from "../../utilities/send.js";

export const CreateInverterDialog: Component<DialogProps & {
    onSuccess?: () => void,
}> = (props) => {
    const [selectedType, setType] = createSignal("");

    const [formConfig, { refetch: formRefresh }] = validateFetchOne(() => `/api/inverter/type/${selectedType()}`, FormConfigValidator);
    const [types] = validateFetchMany("/api/inverter/type", v.string());
    
    createEffect(() => {
        if (types.latest && selectedType() === "") {
            setType(types.latest[0]);
            formRefresh();
        }
    });
    
    return <Dialog controller={props.controller} onClose={props.onClose} open={props.open}>
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
                <Form
                    action="/api/inverter"
                    method="post"
                    onSubmit={sendJson("/api/inverter", "post", async (response) => {
                        if (response.ok) {
                            props.onSuccess?.();
                        } else {
                            console.error(await response.text());
                        }
                    })}
                >
                    <Stack direction={Direction.Vertical}>
                        <Input
                            type="text"
                            id="name"
                            label="name"
                            name="name"
                            required
                        />
                        <input type="hidden" name="type" value={selectedType()}/>
                        <For each={formConfig.latest}>
                            {(item) => <Input
                                type={getInputTypeOfType(item.type)}
                                id={`settings.${item.key}`}
                                label={item.key}
                                name={`settings.${item.key}`}
                                value={item.default ?? undefined}
                                minLength={item.min ?? undefined}
                                maxLength={item.max ?? undefined}
                                required={item.optional ? false : true}
                                pattern={item.regex ?? undefined}
                            />}
                        </For>
                        <Input type="submit" value="Submit"/>
                    </Stack>
                </Form>
            </Show>
        </fieldset>
    </Dialog>

}
