import { createSignal, type ParentComponent } from "solid-js";
import styles from "./index.module.css";

export type DialogControls = {
    showDialog: () => void;
    close: () => void;
};

export interface DialogProps {
    open?: boolean;
    onClose?: () => void;
    controls?: (controls: DialogControls) => void;
}

export const Dialog: ParentComponent<DialogProps> = (props) => {
    const [dialog, setDialog] = createSignal<HTMLDialogElement | undefined>();

    if (props.controls) {
        props.controls({
            showDialog: () => dialog()?.showModal(),
            close: () => dialog()?.close(),
        });
    }

    return <dialog
        ref={setDialog}
        class={`dialog ${styles.dialog}`}
        open={props.open}
        onClose={(props.onClose)}
        style={{
            top: "50%",
            left: "50%",
            translate: "-50% -50%",
        }}
    >
        {props.children}
    </dialog>
}
