import { type Component } from "solid-js";
import { Dialog, type DialogProps } from ".";
import { Stack } from "../stack/index.jsx";
import { Direction } from "../../types/Direction.js";
import { Input } from "../../elements/input/index.jsx";

export const ManageTimeslotDialog: Component<DialogProps & {
    onSuccess?: () => void,
    scheduleId: string,
    timeslot: number,
}> = (props) => {
    const url = () => `/api/schedule/${props.scheduleId}/${props.timeslot}`;

    const updateAction = async (action: string) => {
        const input = document.getElementById(action);
        if (!input || !(input instanceof HTMLInputElement)) {
            console.error(`Could not find input element #${action}`);
            return;
        }
        const response = await fetch(url(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action,
                value: input.value,
            }),
        });
        if (response.ok && props.onSuccess) {
            props.onSuccess();
        }
    }
    
    const deleteAction = async (action: string) => {
        const response = await fetch(url(), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action,
            }),
        });
        if (response.ok && props.onSuccess) {
            props.onSuccess();
        }
    }

    return <Dialog controller={props.controller} onClose={props.onClose} open={props.open}>
        <fieldset>
            <legend>Manage timeslot</legend>

            <div style={{ display: "grid", "grid-template-columns": "auto auto auto auto", gap: "0.5em" }}>
                <label class="ui-input-label" for="charge" title="charge">charge</label>
                <Input
                    type="text"
                    id="charge"
                    pattern="-?\d+"
                    required
                />
                <button onClick={() => void updateAction("charge")}>Update</button>
                <button onClick={() => void deleteAction("charge")}>Remove</button>

                <label class="ui-input-label" for="min-soc" title="Minimum state of charge">Minimum state of charge</label>
                <Input
                    type="number"
                    id="min-soc"
                    required
                    minLength={0}
                    maxLength={100}
                    step={1}
                />
                <button onClick={() => void updateAction("min-soc")}>Update</button>
                <button onClick={() => void deleteAction("min-soc")}>Remove</button>
            </div>
        </fieldset>
    </Dialog>
}
