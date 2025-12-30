import { For, type Component } from "solid-js";
import { Dialog, type DialogProps } from ".";
import { Form } from "../form/index.jsx";
import { Stack } from "../stack/index.jsx";
import { Direction } from "../../types/Direction.js";
import { Input } from "../../elements/input/index.jsx";
import { sendJson } from "../../utilities/send.js";
import { ScheduleTypes } from "../../models/Schedule.js";

export const CreateScheduleDialog: Component<DialogProps & {
    onSuccess?: () => void,
}> = (props) => {
    return <Dialog controller={props.controller} onClose={props.onClose} open={props.open}>
        <fieldset>
            <legend>Create a new schedule</legend>
            
            <Form
                action="/api/schedule"
                method="post"
                onSubmit={sendJson("/api/schedule", "post", async (response) => {
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
                    <select id="type" name="type">
                        <For each={ScheduleTypes}>
                            {(item) => <option value={item}>{item}</option>}
                        </For>
                    </select>
                    <Input type="submit" value="Submit"/>
                </Stack>
            </Form>
        </fieldset>
    </Dialog>

}
