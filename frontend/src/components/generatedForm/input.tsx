import { createSignal, For, Match, Switch, type Component } from "solid-js";
import type { FormConfig } from "../../models/FormConfig.js";

export const GeneratedInput: Component<{
    key: string,
    config: FormConfig,
}> = ({key, config}) => {
    const [value, setValue] = createSignal<string>(config.value?.toString() ?? "");

    return <div class="input-group" style={{ display: config.hidden ? "none" : undefined }}>
        <label>
            {key}
        </label>
        <Switch>
            <Match when={config.type === "text"}>
                <input
                    type="text"
                    id={`input_${key}`}
                    name={key}
                    value={value()}
                    placeholder={`${config.default ?? ""}`}
                    required={config.default === undefined}
                    minLength={config.min}
                    maxLength={config.max}
                    pattern={config.regex}
                />
            </Match>
            <Match when={config.type === "number"}>
                <input 
                    type="number" 
                    id={`input_${key}`}
                    name={key}
                    value={value()}
                    placeholder={`${config.default ?? ""}`}
                    required={config.default === undefined}
                    min={config.min}
                    max={config.max}
                />
            </Match>
            <Match when={config.type === "slider"}>
                <input
                    style={{ "flex-grow": 1 }}
                    type="number" 
                    id={`input_${key}`}
                    value={value() ?? "0"}
                    placeholder={`${config.default ?? ""}`}
                    required={config.default === undefined}
                    name={key}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    onChange={(event) => setValue(event.target.value)}
                />
                <input
                    style={{ "flex-grow": 4 }}
                    type="range"
                    id={`input_${key}_slider`}
                    value={value() ?? "0"}
                    required={config.default === undefined}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    list={`markers_${key}`}
                    onChange={(event) => setValue(event.target.value)}
                />
                <datalist id={`markers_${key}`}>
                    <option value="0"></option>
                </datalist>
            </Match>
            <Match when={config.type === "enum" && config.enum}>
                <select
                    id={`input_${key}`}
                    value={value()}
                    name={key}
                    required={config.default === undefined}
                >
                    <For each={config.enum}>
                        {(item) => <option
                            value={item} 
                            selected={config.value
                                ? item === `${config.value ?? ""}` 
                                : item === `${config.default ?? ""}`
                            }
                        >
                            {item}
                        </option>}
                    </For>
                </select>
            </Match>
            <Match when={config.type === "boolean"}>
                <input
                    type="checkbox"
                    id={`input_${key}`}
                    name={key}
                    value={config.value}
                    required={config.default === undefined}
                />
            </Match>
            <Match when={config.type === "datetime"}>
                <input
                    type="datetime-local"
                    id={`input_${key}`}
                    name={key}
                    // INFO: setting value doesn't work
                    value={config.value}
                    required={config.default === undefined}
                />
            </Match>
        </Switch>
    </div>
}
