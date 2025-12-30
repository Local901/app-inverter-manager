import { createSignal } from "solid-js";

export interface ModalControls {
    showModal: () => void,
    show: () => void,
    close: () => void,
}

export interface ModalController extends ModalControls {
    mountControls: (controls: ModalControls) => () => void;
}

export function useModalController(): ModalController {
    const [ref] = createSignal<ModalControls[]>([]);

    return {
        showModal() {
            for (const c of ref()) {
                c.showModal();
            }
        },
        show() {
            for (const c of ref()) {
                c.show();
            }
        },
        close() {
            for (const c of ref()) {
                c.close();
            }
        },
        mountControls(controls: ModalControls): () => void {
            ref().push(controls);
            return () => {
                ref().splice(ref().indexOf(controls), 1);
            }
        }
    }
}
