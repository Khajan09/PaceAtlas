import {readRaces} from '../../../db/races';

export const dynamic='force-dynamic';

export async function GET(){
 try{const data=await readRaces();return Response.json(data,{headers:{'Cache-Control':'public, max-age=300, stale-while-revalidate=3600'}})}
 catch(error){console.error('Unable to read race database',error);return Response.json({races:[],updatedAt:null},{status:503})}
}
