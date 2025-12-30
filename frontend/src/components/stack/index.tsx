
import { Direction } from "../../types/Direction";
import { JSX, ParentComponent } from "solid-js";

const directionStyles: Record<Direction, [JSX.CSSProperties["flex-direction"], string]> = {
    [Direction.Horizontal]: ["row", "horizontal"],
    [Direction.Vertical]: ["column", "vertical"],
}

export const Stack: ParentComponent<{
    direction: Direction,
    class?: string,
    width?: JSX.CSSProperties["width"],
    maxWidth?: JSX.CSSProperties["max-width"],
    minWidth?: JSX.CSSProperties["min-width"],
    height?: JSX.CSSProperties["height"],
    padding?: JSX.CSSProperties["padding"],
    gap?: JSX.CSSProperties["gap"],
    justify?: JSX.CSSProperties["justify-content"],
    align?: JSX.CSSProperties["align-items"],
}> = (props) => {

    return <div
        class={["stack", directionStyles[props.direction][1], props.class ?? ""].join(" ")}
        style={{
            display: "flex",
            "flex-wrap": "nowrap",
            "align-items": props.align ?? "stretch",
            "flex-direction": directionStyles[props.direction][0],
            width: props.width,
            "max-width": props.maxWidth,
            "min-width": props.minWidth,
            height: props.height,
            padding: props.padding,
            gap: props.gap,
            "justify-content": props.justify,
        }}
    >
        {props.children}
    </div>
}
