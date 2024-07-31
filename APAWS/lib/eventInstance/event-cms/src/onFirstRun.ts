import { SeedData } from "./seedData";
/**
 * CURRENT EXPECTED .ENV VARIABLES
 * - 
 */

import { Payload } from "payload";

export async function onFirstRun(payload:Payload) {
    if(!await isFirstRun(payload)) return;
    console.log('Seeding DB.')
    
    console.log('Seeding Users.')
    const { usersToSeed } = SeedData;
    for(const userToSeed of usersToSeed) {
        await payload.create({
            collection: 'users',
            data: userToSeed,
        })
    }
    console.log('Seeded Users.')
    
    console.log('Seeded DB.')
}


async function isFirstRun(payload:Payload) {
  const users = await payload.find({
    collection: 'users',
    limit: 1,
  });

  return users.totalDocs === 0;
}