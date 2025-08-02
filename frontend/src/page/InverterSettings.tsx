import { useParams } from "@solidjs/router";
import { Show, type Component } from "solid-js";
import { validateFetchOne } from "src/actions/validateFetch";
import { GeneratedForm } from "src/components/generatedForm";
import { InverterNavBar } from "src/components/navbar";
import PostButton from "src/components/postButton";
import { Stack } from "src/components/stack";
import { FormConfigValidator } from "src/models/FormConfig";
import { Direction } from "src/types/Direction";

export const InverterSettingsPage: Component = () => {
    const { id } = useParams<{ id: string }>();

    const [settings] = validateFetchOne(`/api/inverter/${id}/settings`, FormConfigValidator);
    
    return <Show when={!!settings.latest} fallback={<>404</>}>
        <Stack direction={Direction.Vertical} gap="1em">
            <InverterNavBar id={id}/>
            <GeneratedForm uri={settings.latest?.href ?? ""} config={settings.latest?.data!}/>
            <hr/>
            <Stack direction={Direction.Horizontal} align="center" padding="0 1em">
                <div><mark class="warning-text">Delete inverter {id}</mark></div>
                <div style={{ "flex-grow": 1 }}/>
                <PostButton href={`/api/inverter/${id}/delete`} value="Delete"/>
            </Stack>
        </Stack>
    </Show>
}
