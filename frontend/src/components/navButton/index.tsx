import { createEffect, createSignal, ParentComponent, Show } from "solid-js";
import styles from "./index.module.css";
import { useUrl } from "src/hooks/UseUrl";

export const NavButton: ParentComponent<{
    href: string,
    disabled?: boolean,
}> = (props) => {
    const location = useUrl();
    const [isCurrent, setIsCurrent] = createSignal(location().pathname === props.href);
    createEffect(() => {
        setIsCurrent(location().pathname === props.href);
    });

    return <Show when={props.disabled !== true} fallback={
        <span class={`button nav-button ${!props.disabled ? "disabled" : ""} ${isCurrent() ? "current" : ""}`}>
            {props.children}
        </span>
    }>
        <a class={`button nav-button ${styles["nav-button"]} ${isCurrent() ? "current" : ""}`} href={props.href}>
            {props.children}
        </a>
    </Show> 
}
