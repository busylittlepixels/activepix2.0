


import { get, writable, type Writable } from "svelte/store";
import ExampleModal from "./modals/ExampleModal.svelte";
import RouteView from "./Modals/RouteView.svelte";
import PictureView from "./Modals/PictureView.svelte";

export type ActiveModal = {
    id: number;
    type: ModalTypes;
    data: {
        [key: string]: any;
    };
}


export const ActiveModalStore:Writable<{
    [key: string]: ActiveModal;
}> = writable({});

//Add modal types here
export enum ModalTypes {
    ExampleModal,
    RouteView,
    PictureView,

}

//Add mapping to svelte components here
export const ModalTypeMapping = {
    [ModalTypes.ExampleModal]: ExampleModal,
    [ModalTypes.RouteView]: RouteView,
    [ModalTypes.PictureView]: PictureView,

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