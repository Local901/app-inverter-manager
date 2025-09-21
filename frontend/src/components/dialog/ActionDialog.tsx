import { Show, type Component } from "solid-js";
import { Dialog, type DialogProps } from "./index.jsx";
import type { ActionInfo } from "../../models/ActionInfo.js";
import { Form } from "../form/index.jsx";
import { Stack } from "../stack/index.jsx";
import { Direction } from "../../types/Direction.js";
import { send } from "../../actions/send.js";

function toDateTimeString(date: Date): string {
    const result = `${date.toLocaleDateString()}T${date.toLocaleTimeString()}`;
    console.log(result);
    return result;
}

export const ActionDialog: Component<DialogProps & { action: ActionInfo, start: Date, end: Date }> = (props) => {
    const now = new Date()
    const start = now.getTime() > props.start.getTime() && props.end.getTime() > now.getTime()
        ? now
        : new Date(Math.floor(props.start.getTime() / 60000) * 60000);
    const end = new Date(Math.ceil(props.end.getTime() / 60000) * 60000);

    return <Dialog controls={props.controls} onClose={props.onClose} open={props.open}>
        <fieldset>
            <legend>Action: {props.action.action} {props.action.value}</legend>
            <hr/>
            <Show when={Date.now() < end.getTime()} fallback={<p>This action is already passed. Can't be deleted</p>}>
                <Stack direction={Direction.Horizontal} padding="0.5em">
                    <span style={{"flex-grow": 1 }}>
                        {
                            start.getTime() === now.getTime()
                                ? "Stop action now."
                                : "Remove the action before it is ran."
                        }
                    </span>
                    <Form action="" method="" onSubmit={async () => {
                        await send(`/api/action/${props.action.id}`, "delete", {
                            from: now.getTime() === start.getTime() ? new Date().toISOString() : start.toISOString()
                        });
                    }}>
                        <input type="submit" value="Stop Action"/>
                    </Form>
                </Stack>
                <Show when={props.action.repeatsWeekly === true}>
                    <Stack direction={Direction.Horizontal} padding="0.5em">
                        <span style={{"flex-grow": 1 }}>Remove action for this week.</span>
                        <Form action="" method="" onSubmit={async () => {
                            await send(`/api/action/${props.action.id}`, "delete", {
                                from: now.getTime() === start.getTime() ? new Date().toISOString() : start.toISOString(),
                                to: end.toISOString(),
                            });
                        }}>
                            <input type="submit" value="Interrupt Action"/>
                        </Form>
                    </Stack>
                </Show>
            </Show>
        </fieldset>
    </Dialog>
}
