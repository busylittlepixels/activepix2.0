import { get, writable, type Writable } from "svelte/store";
import type { SvelteComponent } from "svelte";
export type Modal = {
    id: number;
    contentComponent: typeof SvelteComponent;
    data: Writable<any>;
}
class ModalManager {
    modalStack: Writable<Modal[]> = writable([]);
    private nextModalID = 0;

    constructor() {
    }

    openModal(contentComponent: any, data?: Writable<any>) {
        let id = this.nextModalID++;
        this.modalStack.update((stack) => {
            return [
                ...stack,
                {
                    id,
                    contentComponent,
                    data: data || writable(null)
                }
            ]
        })
        return id;
    }

    closeModal(id: number) {
        this.modalStack.update((stack) => {
            return stack.filter((modal) => modal.id !== id);
        })
    }

    closeAllModals() {
        this.modalStack.set([]);
    }
    
}
export const ModalManagerInstance = new ModalManager();