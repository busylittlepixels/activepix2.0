


import { get } from "svelte/store";
import ExampleModal from "./modals/ExampleModal.svelte";

import { ActiveModalStore } from "./Stores";


//Add modal types here
export enum ModalTypes {
    ExampleModal,

}

//Add mapping to svelte components here
export const ModalTypeMapping = {
    [ModalTypes.ExampleModal]: ExampleModal,

}





let nextModalID = 0;
export function openModal(type:ModalTypes, data = {}) {
    const id = nextModalID++;
    ActiveModalStore.update((modals) => {
        modals[id] = { id, type, data };
        return modals;
    });
    return id;
}

export function closeModal(id:number) {
    ActiveModalStore.update((modals) => {
        delete modals[id];
        return modals;
    });
}

export function getModal(id:number) {
    let modal;
    let modals = get(ActiveModalStore);
    if(modals[id]) {
        modal = modals[id];
    }
    return modal;
}


export type ModalDataProp<T> = {
    id: Number,
    type: ModalTypes,
    data: T
}