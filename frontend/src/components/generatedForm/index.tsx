import { For, Show, type Component } from "solid-js";
import { GeneratedInput } from "./input";
import { Stack } from "../stack";
import { Direction } from "src/types/Direction";
import type { FormConfig } from "src/models/FormConfig";
import { Form } from "../form/index.jsx";

export const GeneratedForm: Component<{
    method?: "get" | "post" | "dialog",
    uri: string,
    config: FormConfig["data"],
}> = ({ config, uri, method }) => {
    return <Show when={Object.keys(config).length > 0}>
        <Form action={uri} method={method ?? "post"}>
            <For each={Object.entries(config)}>
                {([key, item]) => <GeneratedInput key={key} config={item} />}
            </For>
            <Stack direction={Direction.Horizontal} justify="end" padding="0.5em 1em 0">
                <input class="button submit-button" type="submit" value="Submit"/>
            </Stack>
        </Form>
    </Show>
}
