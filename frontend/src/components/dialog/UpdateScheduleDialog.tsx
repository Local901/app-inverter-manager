import { type Component } from "solid-js";
import { Dialog, type DialogProps } from ".";
import { Form } from "../form/index.jsx";
import { Stack } from "../stack/index.jsx";
import { Direction } from "../../types/Direction.js";
import { Input } from "../../elements/input/index.jsx";
import { sendJson } from "../../utilities/send.js";

export const UpdateScheduleDialog: Component<DialogProps & {
    schedule: {
        id: string,
        name: string,
        time_zone: number,
    },
    onSuccess?: () => void,
}> = (props) => {
    return <Dialog controller={props.controller} onClose={props.onClose} open={props.open}>
        <fieldset>
            <legend>Update schedule '{}'</legend>
            
            <Form
                action="/api/schedule"
                method="PUT"
                onSubmit={sendJson(`/api/schedule/${props.schedule.id}`, "PUT", async (response) => {
                    if (response.ok) {
                        props.onSuccess?.();
                    } else {
                        console.error(await response.text());
                    }
                }, (key, value, formData) => {
                    if (key === "time_zone" && typeof value === "string") {
                        // This is a time.
                        return Number.parseInt((formData.get("time_zone_sign") ?? "") + value.split(":")
                            .map((i, index) => Number.parseInt(i) * Math.max(1, (1 - index) * 60))
                            .reduce((prev, next) => prev + next, 0)
                            .toString());
                    }
                    if (key === "time_zone_sign") {
                        return undefined as unknown as null;
                    }
                    return value;
                })}
            >
                <Stack direction={Direction.Vertical}>
                    <Stack direction={Direction.Horizontal}>
                        <label class="ui-input-label" for="time_zone" title="Time zone">Time zone</label>
                        <select id="time_zone_sign" name="time_zone_sign">
                            <option value="" selected>+</option>
                            <option value="-">-</option>
                        </select>
                        <Input
                            type="time"
                            id="time_zone"
                            name="time_zone"
                            value={props.schedule.time_zone}
                            required
                        />
                    </Stack>
                    <Input type="submit" value="Submit"/>
                </Stack>
            </Form>
            <hr/>
            <button onClick={() => fetch(`/api/schedule/${props.schedule.id}`, { method: "delete" })}>Delete schedule</button>
        </fieldset>
    </Dialog>

}
