import { createEffect, createSignal, type ParentComponent } from "solid-js";
import styles from "./index.module.css";
import type { ModalController } from "../../hooks/UseModalControls.js";

export interface DialogProps {
    open?: boolean;
    onClose?: () => void;
    controller?: ModalController;
    closedBy?: "any" | "closerequest" | "none"
}

export const Dialog: ParentComponent<DialogProps> = (props) => {
    const [dialog, setDialog] = createSignal<HTMLDialogElement | undefined>();

    createEffect(() => {
        const element = dialog();
        if (!props.controller || !element) {
            return;
        }
        return props.controller.mountControls({
            showModal: element.showModal.bind(element),
            show: element.show.bind(element),
            close: element.close.bind(element),
        });
    }, [dialog]);

    return <dialog
        ref={setDialog}
        class={`dialog ${styles.dialog}`}
        open={props.open}
        onClose={(props.onClose)}
        closedby={props.closedBy ?? "any"}
        style={{
            top: "50%",
            left: "50%",
            translate: "-50% -50%",
        }}
    >
        {props.children}
    </dialog>
}
