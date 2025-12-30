import { createSignal, Show, type Component, type JSX } from "solid-js";

export const Input: Component<{
    id?: string,
    label?: string,
    type: JSX.InputHTMLAttributes<HTMLInputElement>["type"],
    name?: string,
    value?: string | number | string[],
    placeholder?: string,
    required?: boolean,
    minLength?: string | number,
    maxLength?: string | number,
    step?: string | number,
    pattern?: string,
}> = (props) => {
    const [value, setValue] = createSignal(props.value ?? "");

    return <div class="ui-input">
        <Show when={props.label}>
            <label class="ui-input-label" for={props.id} title={props.label}>{props.label}</label>
        </Show>
        <input
            class="ui-input-control"
            id={props.id}
            type={props.type}
            name={props.name}
            value={value()}
            placeholder={props.placeholder}
            required={props.required}
            minLength={props.minLength}
            maxLength={props.maxLength}
            step={props.step}
            pattern={props.pattern}
            onChange={(event) => setValue(event.target.value)}
        />
    </div>
}
