import { createSignal } from "solid-js";

export interface ModalControls {
    showModal: () => void,
    show: () => void,
    close: () => void,
}

export interface ModalController extends ModalControls {
    mountControls: (controls: ModalControls) => () => void;
}

function tryEach<T>(list: T[], callback: (value: T) => unknown): void {
    for (const v of list) {
        try {
            callback(v);
        } catch (e) {
            console.error(e);
        }
    }
}

export function useModalController(): ModalController {
    const [ref] = createSignal<ModalControls[]>([]);

    return {
        showModal() {
            tryEach(ref(), (c) => {
                c.showModal();
            });
        },
        show() {
            tryEach(ref(), (c) => {
                c.show();
            });
        },
        close() {
            tryEach(ref(), (c) => {
                c.close();
            });
        },
        mountControls(controls: ModalControls): () => void {
            ref().push(controls);
            return () => {
                ref().splice(ref().indexOf(controls), 1);
            }
        }
    }
}
