import type { ParentComponent } from "solid-js";
import styles from "./index.module.css";

export const FieldSet: ParentComponent<{
    class?: string,
}> = (props) => {
    return <div class={`fieldset ${styles.fieldset} ${props.class ?? ""}`}>
        {props.children}
    </div>
}
