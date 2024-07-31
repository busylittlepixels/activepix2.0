import { Galleryconfig, User } from "./payload-types";
type UnneededData = {
    id: string;
    updatedAt: string;
    createdAt: string;
}

type PostableCMSType<T> = Omit<T, keyof UnneededData>;





export namespace SeedData {


    /*
        Default user structure:

        admin@activepix.com:LoudZone42!
        - Role: Admin

        manager@activepix.com:LoudZone42!
        - Role: Manager

        user@activepix.com:LoudZone42!
        - Role: User
    */
    export const usersToSeed:PostableCMSType<User>[] = [
        {
            email: 'admin@activepix.com',
            role: 'admin',
            password: 'LoudZone42!'
        },
        {
            email: 'manager@activepix.com',
            role: 'manager',
            password: 'LoudZone42!'
        },
        {
            email: 'user@activepix.com',
            role: 'user',
            password: 'LoudZone42!'
        }
    ]

    export const galleryConfigDefaults:Partial<Galleryconfig> = {
        
    }
}