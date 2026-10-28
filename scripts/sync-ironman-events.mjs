import {writeFile} from 'node:fs/promises';

const base='https://www.ironman.com';
const decode=value=>value.replace(/&quot;/g,'"').replace(/&#039;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&ndash;/g,'–').replace(/&mdash;/g,'—').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const slug=value=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const isoDate=value=>{const parsed=new Date(`${value} 12:00:00 UTC`);return Number.isNaN(parsed.valueOf())?'':parsed.toISOString().slice(0,10)};
const regionFor=country=>{
 const europe=['Albania','Austria','Belgium','Croatia','Czech Republic','Denmark','Estonia','Finland','France','Germany','Greece','Ireland','Italy','Kazakhstan','Latvia','Netherlands','Norway','Poland','Portugal','Romania','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Türkiye','United Kingdom'];
 const asia=['China','Chinese Taipei','India','Indonesia','Japan','Malaysia','Philippines','South Korea','Thailand','Vietnam'];
 const africa=['Egypt','Morocco','Rwanda','South Africa'];
 const oceania=['Australia','New Zealand'];
 return europe.includes(country)?'Europe':asia.includes(country)?'Asia':africa.includes(country)?'Africa':oceania.includes(country)?'Oceania':country==='United Arab Emirates'||country==='Oman'||country==='Bahrain'?'Asia':'Americas';
};
const statusFor=value=>/open|available/i.test(value)&&!/soon/i.test(value)?'Open':/coming soon|opens/i.test(value)?'Opening soon':/closed|sold out|waitlist/i.test(value)?'Closed':'Verify';
const absolute=value=>value.startsWith('http')?value:`${base}${value}`;

const loadPage=async page=>{
 const url=page?`${base}/races?page=${page}`:`${base}/races`;
 let response;
 for(let attempt=1;attempt<=3;attempt++){
  try{response=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 PaceAtlas/1.0'},signal:AbortSignal.timeout(45000)});break}
  catch(error){if(attempt===3)throw new Error(`Unable to load IRONMAN calendar page ${page}: ${error.message}`)}
 }
 if(!response.ok)throw new Error(`IRONMAN calendar returned ${response.status} for page ${page}`);
 const html=await response.text();
 const matches=[...html.matchAll(/card card__event[\s\S]*?(?=<div class="coh-container races-search-view__cards-row"|<nav class="pager"|$)/g)].map(match=>match[0]);
 const cards=matches.filter(card=>/<h2 class="coh-heading coh-style-heading-4-size" >\s*IRONMAN(?:\s|&)/i.test(card));
 return{page,html,cards};
};
const pages=[];
for(let start=0;start<24;start+=2){
 const batch=await Promise.all([0,1].map(offset=>loadPage(start+offset)));
 pages.push(...batch.filter(result=>result.cards.length));
 if(batch.some(result=>result.page>0&&result.cards.length===0))break;
}
pages.sort((a,b)=>a.page-b.page);

const coordinateMap=new Map();
for(const {html} of pages){
 for(const match of html.matchAll(/"lat":(-?[\d.]+),"lon":(-?[\d.]+),"entity_id":"(\d+)"/g))coordinateMap.set(match[3],[Number(match[1]),Number(match[2])]);
}

const events=[];
for(const {cards} of pages){
 for(const card of cards){
  const name=decode(card.match(/<h2 class="coh-heading coh-style-heading-4-size" >([\s\S]*?)<\/h2>/i)?.[1]||'');
  const is703=/IRONMAN\s+70\.3/i.test(name);
  const isFull=/^IRONMAN\b/i.test(name)&&!is703;
  if(!is703&&!isFull)continue;
  const location=decode(card.match(/<span class="label">([\s\S]*?)<\/span>/i)?.[1]||'');
  const parts=location.split(',').map(value=>value.trim()).filter(Boolean);
  const city=parts[0]||name.replace(/^IRONMAN(?: 70\.3)?\s*/i,'');
  const country=parts.at(-1)||'See official site';
  const dateLabel=decode(card.match(/<span class="coh-inline-element date">([\s\S]*?)<\/span>/i)?.[1]||'Date TBA');
  const registration=decode(card.match(/tag tag--white">([\s\S]*?)<\/span>/i)?.[1]||'Verify registration');
  const href=card.match(/<a href="([^"]+)"[^>]*>\s*See Race Details/i)?.[1];
  if(!href)continue;
  const id=card.match(/data-race-id="(\d+)"/)?.[1];
  const image=card.match(/<img loading="lazy"[^>]*src="([^"]+)"/i)?.[1]||'';
  const flag=card.match(/flagsvg\/4x3\/([a-z]{2})\.svg/i)?.[1]?.toUpperCase()||'';
  const point=id?coordinateMap.get(id):undefined;
  events.push({
   slug:slug(name),city,country,code:flag,region:regionFor(country),name,
   date:isoDate(dateLabel),event:isoDate(dateLabel)?undefined:dateLabel,
   registration,status:statusFor(registration),terrain:'Swim · bike · run',tier:'Iconic',link:absolute(href),
   lat:point?.[0],lon:point?.[1],
   distances:is703?['1.9 km swim','90 km bike','21.1 km run']:['3.8 km swim','180 km bike','42.2 km run'],
   types:[is703?'IRONMAN 70.3':'IRONMAN'],
   route:`Official ${is703?'70.3':'full-distance'} triathlon course. Swim, bike and run course maps and elevation details are published by the organizer for each edition.`,
   ticketCost:'See official IRONMAN registration pricing',
   transferPolicy:'Verify',
   transferProcess:'IRONMAN entry transfer, deferral and withdrawal rules vary by event and region. Use the event’s official registration and athlete-information pages before purchasing or attempting to reassign an entry.',
   sourceUrl:absolute(href),imageUrl:image?absolute(decode(image)):''
  });
 }
}

const unique=[...new Map(events.map(event=>[event.link,event])).values()].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.name.localeCompare(b.name));
await writeFile(new URL('../public/ironman-events.json',import.meta.url),`${JSON.stringify({source:`${base}/races`,checkedAt:new Date().toISOString(),events:unique},null,2)}\n`);
console.log(`Saved ${unique.length} official IRONMAN events (${unique.filter(event=>event.types[0]==='IRONMAN 70.3').length} IRONMAN 70.3, ${unique.filter(event=>event.types[0]==='IRONMAN').length} IRONMAN).`);
