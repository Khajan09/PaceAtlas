import {env} from 'cloudflare:workers';

export type DatabaseRace={
 slug:string;city:string;country:string;code:string;region:string;name:string;date:string;event?:string;
 registration:string;status:'Open'|'Opening soon'|'Closed'|'Verify';terrain:string;tier:'Major'|'Global label'|'Iconic';
 link:string;featured?:boolean;lat:number;lon:number;distances:string[];route?:string;elevation?:string;routeNote?:string;
 ticketCost?:string;transferPolicy?:string;sourceUrl?:string;imageFile?:string;
};

const columns=['slug','city','country','code','region','name','date','event','registration','status','terrain','tier','link','featured','lat','lon','distances','route','elevation','route_note','ticket_cost','transfer_policy','source_url','image_file'] as const;

function binding(){return env.DB}

export async function readRaces(){
 const db=binding();if(!db)return{races:[] as DatabaseRace[],updatedAt:null as string|null};
 const result=await db.prepare(`SELECT ${columns.join(',')} FROM races ORDER BY CASE WHEN date='' THEN 1 ELSE 0 END,date,city`).all<Record<string,unknown>>();
 const races=(result.results||[]).map(row=>({
  slug:String(row.slug),city:String(row.city),country:String(row.country),code:String(row.code),region:String(row.region),name:String(row.name),date:String(row.date||''),event:row.event?String(row.event):undefined,
  registration:String(row.registration),status:String(row.status) as DatabaseRace['status'],terrain:String(row.terrain),tier:String(row.tier) as DatabaseRace['tier'],link:String(row.link),featured:Boolean(row.featured),
  lat:Number(row.lat),lon:Number(row.lon),distances:JSON.parse(String(row.distances||'[]')),route:row.route?String(row.route):undefined,elevation:row.elevation?String(row.elevation):undefined,
  routeNote:row.route_note?String(row.route_note):undefined,ticketCost:row.ticket_cost?String(row.ticket_cost):undefined,transferPolicy:row.transfer_policy?String(row.transfer_policy):undefined,
  sourceUrl:row.source_url?String(row.source_url):undefined,imageFile:row.image_file?String(row.image_file):undefined,
 })) as DatabaseRace[];
 const meta=await db.prepare("SELECT value FROM site_meta WHERE key='races_updated_at'").first<{value:string}>();
 return{races,updatedAt:meta?.value||null};
}

export async function replaceRaces(races:DatabaseRace[]){
 const db=binding();if(!db)throw new Error('Database binding unavailable');
 const statements=[db.prepare('DELETE FROM races')];
 for(const race of races){statements.push(db.prepare(`INSERT INTO races (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')})`).bind(
  race.slug,race.city,race.country,race.code,race.region,race.name,race.date||'',race.event||null,race.registration,race.status,race.terrain,race.tier,race.link,race.featured?1:0,
  race.lat,race.lon,JSON.stringify(race.distances),race.route||null,race.elevation||null,race.routeNote||null,race.ticketCost||null,race.transferPolicy||null,race.sourceUrl||race.link,race.imageFile||null,
 ))}
 const updatedAt=new Date().toISOString();
 statements.push(db.prepare("INSERT INTO site_meta (key,value) VALUES ('races_updated_at',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(updatedAt));
 await db.batch(statements);return{count:races.length,updatedAt};
}
