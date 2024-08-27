import { get, writable, type Writable } from "svelte/store";
import { Endpoints } from "./Endpoints";

export type TAuthStore = {
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
} | null;
export const AuthStore: Writable<TAuthStore> = writable(null);

export async function initAuthStore(): Promise<void> {
    if(!get(AuthStore)) {
        const token = localStorage.getItem('token');
        if(token === null) {
            AuthStore.set(null);
            return;
        }
        AuthStore.set({ token, user: { id: '', email: '', role: '' } });
        await getMe();
    }
}


export async function getAuthHeader(): Promise<string> {
    await initAuthStore();
    const auth = get(AuthStore)
    if(auth === null) {
        return '';
    }
    return `JWT ${auth.token}`;
}

export async function getMe(): Promise<void> {
    const response = await fetch(Endpoints.cms.users.me, {
        headers: {
            'Authorization': await getAuthHeader(),
        }
    });
    if(response.status !== 200) {
        logout();
        return;
    }
    const data = await response.json();
    AuthStore.update((store) => {
        if(store === null) {
            return store;
        }
        store.user = data;
        return store;
    });
}

export async function isAuthed(): Promise<boolean> {
    await initAuthStore();
    return get(AuthStore) !== null;
}

export async function login(email: string, password: string): Promise<boolean> {
    const response = await fetch(Endpoints.cms.users.login, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    if(response.status !== 200) {
        return false;
    }
    const data = await response.json();
    AuthStore.set(data);
    localStorage.setItem('token', data.token);
    return true;
}

export async function logout(): Promise<void> {
    initAuthStore();
    const response = await fetch(Endpoints.cms.users.logout, {
        method: 'POST',
        headers: {
            'Authorization': await getAuthHeader(),
        }
    });
    localStorage.removeItem('token');
    AuthStore.set(null);
}