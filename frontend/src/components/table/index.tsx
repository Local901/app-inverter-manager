import { type ParentComponent } from "solid-js";

export const Table: ParentComponent = ({ children }) => {
    return <div class="ui-table">
        <table>
            {children}
        </table>
    </div>
}
