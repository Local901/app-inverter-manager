import { type ParentComponent } from "solid-js";

export const Table: ParentComponent<{ class?: string }> = ({ children, ...props }) => {
    return <div class={["ui-table", props.class ?? ""].join(" ").trim()}>
        <table>
            {children}
        </table>
    </div>
}
