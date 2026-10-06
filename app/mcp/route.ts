import {replaceRaces,type DatabaseRace} from '../../db/races';

export const dynamic='force-dynamic';

const tool={name:'replace_race_catalog',description:'Replace the Pace Atlas race catalog after verifying current facts against official race organizer sources.',inputSchema:{type:'object',properties:{races:{type:'array',items:{type:'object',required:['slug','city','country','code','region','name','registration','status','terrain','tier','link','lat','lon','distances'],properties:{slug:{type:'string'},city:{type:'string'},country:{type:'string'},code:{type:'string'},region:{type:'string'},name:{type:'string'},date:{type:'string'},event:{type:'string'},registration:{type:'string'},status:{type:'string',enum:['Open','Opening soon','Closed','Verify']},terrain:{type:'string'},tier:{type:'string',enum:['Major','Global label','Iconic']},link:{type:'string'},featured:{type:'boolean'},lat:{type:'number'},lon:{type:'number'},distances:{type:'array',items:{type:'string'}},route:{type:'string'},elevation:{type:'string'},routeNote:{type:'string'},ticketCost:{type:'string'},transferPolicy:{type:'string'},sourceUrl:{type:'string'},imageFile:{type:'string'}}}}},required:['races']}};

function reply(id:unknown,result:unknown){return Response.json({jsonrpc:'2.0',id,result})}

export async function POST(request:Request){
 const body=await request.json() as {jsonrpc?:string;id?:unknown;method?:string;params?:{name?:string;arguments?:{races?:DatabaseRace[]}}};
 if(body.method==='initialize')return reply(body.id,{protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'pace-atlas-data',version:'1.0.0'}});
 if(body.method==='notifications/initialized')return new Response(null,{status:204});
 if(body.method==='tools/list')return reply(body.id,{tools:[tool]});
 if(body.method==='tools/call'){
  if(!request.headers.get('oai-authenticated-user-id'))return Response.json({jsonrpc:'2.0',id:body.id,error:{code:-32001,message:'Authentication required'}},{status:401});
  if(body.params?.name!==tool.name)return reply(body.id,{content:[{type:'text',text:'Unknown tool'}],isError:true});
  const races=body.params.arguments?.races;if(!Array.isArray(races)||!races.length)return reply(body.id,{content:[{type:'text',text:'A non-empty races array is required'}],isError:true});
  try{const result=await replaceRaces(races);return reply(body.id,{content:[{type:'text',text:`Updated ${result.count} races at ${result.updatedAt}`}],structuredContent:result})}
  catch(error){console.error('Race catalog update failed',error);return reply(body.id,{content:[{type:'text',text:'Database update failed'}],isError:true})}
 }
 return Response.json({jsonrpc:'2.0',id:body.id,error:{code:-32601,message:'Method not found'}},{status:404});
}
