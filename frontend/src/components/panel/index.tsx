import type { ParentComponent } from "solid-js";
import type { Status } from "src/types/Status";
import { colorToClass, type ColorStringType } from "src/utilities/color";

export const Panel: ParentComponent<{
    color?: ColorStringType | Status,
}> = (props) => {

    return <div class={`panel ${colorToClass(props.color) ?? ""}`}>
        {props.children}
    </div>
}
