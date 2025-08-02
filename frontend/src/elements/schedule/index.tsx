import { createEffect, createMemo, createSignal, For, type Component } from "solid-js"
import { validateFetchMany } from "src/actions/validateFetch";
import { FieldSet } from "src/components/fieldSet"
import { ActionInfoValidator, type ActionInfo } from "src/models/ActionInfo";

const Hours = [...Array(24).keys()];

export const Schedule: Component<{
    inverterId: string
    day?: number,
}> = (props) => {
    const headers = [
        ["time", Hours.map((time) => `${`${time}`.padStart(2, "0")}:00`)],
    ] as Array<[string, Array<string | number>]>;

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (props.day ?? 0));
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const [actions] = validateFetchMany(`/api/inverter/${props.inverterId}/actions?start=${start.toISOString()}&end=${end.toISOString()}`, ActionInfoValidator);
    const diff = end.getTime() - start.getTime();

    const [values, setValues] = createSignal<Record<string, ActionInfo[]>>({});
    const [innerDiv, setInnerDiv] = createSignal<HTMLDivElement | undefined>(); 

    const currentPercentage = (today.getTime() - start.getTime()) / diff;
    const nowLine = createMemo(() => <div
        class="nowLine"
        style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${currentPercentage * 100}%`,
        }}
    />)

    createEffect(() => {
        if (!actions.latest) {
            return;
        }
        const newValues: Record<string, ActionInfo[]> = {};
        for (const action of actions.latest) {
            newValues[action.action] ??= [];
            newValues[action.action].push(action);
        }
        setValues(newValues);
    });

    createEffect(() => {
        const div = innerDiv();
        const th = div?.querySelector("th");
        if (!div || !th) {
            return;
        }
        div.scrollLeft = ((div.scrollWidth ?? 0) * currentPercentage) - div.clientWidth / 2 + th?.clientWidth;
    })

    return <FieldSet class="schedule">
        <legend>Schedule</legend>
        <div ref={setInnerDiv} style={{ overflow: "auto" }}>
            <table>
                <thead>
                    <For each={headers}>
                        {(header) => <tr>
                            <th class="header-type">{header[0]}</th>
                            <For each={header[1]}>
                                {(item) => <th class={`header ${header}-header`}>
                                    {item}
                                </th>}
                            </For>
                        </tr>}
                    </For>
                    <tr>
                        <td colSpan={Number.MAX_SAFE_INTEGER}>
                            <hr/>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <For each={Object.entries(values() ?? {test: [{}]})}>
                        {([key, actionList]) => <tr>
                            <th class="value-type">{key}</th>
                            <td class="value-aria clearfix" colSpan={Number.MAX_SAFE_INTEGER} style={{ position: "relative" }}>
                                {nowLine()}
                                <For each={actionList as ActionInfo[]}>
                                    {(action) => {
                                        const startTime = new Date(start.getTime() + action.start * diff);
                                        const endTime = new Date(start.getTime() + (1 - action.end) * diff);
                                        return <div
                                            class="value"
                                            title={`${action.action}: ${action.value}\n${startTime.getHours().toString().padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")} - ${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`}
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                bottom: 0,
                                                left: `${action.start * 100}%`,
                                                right: `${action.end * 100}%`,
                                            }}
                                        >
                                            {action.value}
                                        </div>
                                    }}
                                </For>
                            </td>    
                        </tr>}
                    </For>
                </tbody>
            </table>
        </div>
    </FieldSet>
}
