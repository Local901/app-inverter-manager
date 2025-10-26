import { For, Show, type JSX } from "solid-js";

export function headerTable<T>({columnHeader, rowHeader, data, mapItem}: {
    columnHeader?: readonly string[],
    rowHeader?: readonly string[],
    data: readonly T[][],
    mapItem: (item: T) => JSX.Element
}): JSX.Element {
    return <table>
        <thead>
            <tr>
                <Show when={!!rowHeader && !!columnHeader}>
                    <th/>
                </Show>
                <For each={columnHeader ?? []}>
                    {(item) => <th>
                        {item}
                    </th>}
                </For>
            </tr>
        </thead>
        <tbody>
            <For each={data}>
                {(row, index) => <tr>
                    <Show when={rowHeader}>
                        <th>
                            {rowHeader![index()]}
                        </th>
                    </Show>
                    <For each={row}>
                        {(item) => <td>
                            {mapItem(item)}
                        </td>}
                    </For>
                </tr>}
            </For>
        </tbody>
    </table>
};
