import { JSX, ParentComponent } from "solid-js";

export const Center: ParentComponent<{
    height?: JSX.CSSProperties["height"],
}> = (props) => {
    return <div
        class="center"
        style={{
            width: "min(1200px, 100%)",
            margin: "auto",
            height: props.height,
        }}
    >
        {props.children}
    </div>
}
