import { useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show, type Component } from "solid-js";
import { validateFetchOne } from "../actions/validateFetch";
import { InverterNavBar } from "../components/navbar";
import PostButton from "../components/postButton";
import { Stack } from "../components/stack";
import { Direction } from "../types/Direction";
import { v } from "@local901/validator";
import { InverterInfoValidator } from "../models/InverterInfo.js";
import { Form } from "../components/form/index.jsx";
import { Input } from "../elements/input/index.jsx";
import { FormConfigValidator, getInputTypeOfType } from "../models/FormConfig.js";
import { sendJson } from "../utilities/send.js";

export const InverterSettingsPage: Component = () => {
    const { id } = useParams<{ id: string }>();

    const [inverter] = validateFetchOne(`/api/inverter/${id}`, InverterInfoValidator);
    const [settings] = validateFetchOne(`/api/inverter/${id}/settings`, v.record(v.string()));
    const [formConfig, { refetch: formRefresh }] = validateFetchOne(() => `/api/inverter/type/${inverter.latest?.type ?? ""}`, FormConfigValidator);

    createEffect(() => {
        if (inverter.state === "ready") {
            formRefresh();
        }
    }, [inverter]);
    
    return <Show when={settings.state === "ready" && inverter.state === "ready"}>
        <Stack direction={Direction.Vertical} gap="1em">
            <InverterNavBar id={id}/>
            <Stack direction={Direction.Vertical} padding="1em" gap="0.5em">
                <h2>Settings</h2>
                <Form
                    action={`/api/inverter/${id}/settings`}
                    method="post"
                    onSubmit={sendJson(`/api/inverter/${id}/settings`, "post")}
                >
                    <Input
                        type="text"
                        id="$/name"
                        label="name"
                        name="$/name"
                        value={inverter.latest?.name}
                        required
                    />
                    <For each={formConfig.latest}>
                        {(item) => <Input
                            type={getInputTypeOfType(item.type)}
                            id={item.key}
                            label={item.key}
                            name={item.key}
                            value={settings.latest?.[item.key] ?? item.default ?? undefined}
                            minLength={item.min ?? undefined}
                            maxLength={item.max ?? undefined}
                            required={item.optional ? false : true}
                            pattern={item.regex ?? undefined}
                        />}
                    </For>
                    <Input type="submit" value="Update"/>
                </Form>
            </Stack>
            <hr/>
            <Stack direction={Direction.Horizontal} align="center" padding="0 1em">
                <div><mark class="warning-text">Delete inverter {id}</mark></div>
                <div style={{ "flex-grow": 1 }}/>
                <PostButton href={`/api/inverter/${id}/delete`} value="Delete"/>
            </Stack>
        </Stack>
    </Show>
}
