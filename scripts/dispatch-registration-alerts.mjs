import {readFile} from 'node:fs/promises';

const endpoint=(process.env.ALERT_DISPATCH_URL||'https://paceatlas.khajansyadav.workers.dev/api/alerts/dispatch').trim();
const secret=(process.env.ALERT_DISPATCH_SECRET||'').trim();
if(!secret){console.log('Registration-alert dispatch skipped: ALERT_DISPATCH_SECRET is not configured.');process.exit(0)}
const slug=value=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const source=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
const road=[];
for(const line of source.split('\n')){if(!line.startsWith("r('"))continue;const match=line.match(/^r\('([^']*)','([^']*)','[^']*','[^']*','([^']*)','[^']*','([^']*)','([^']*)','[^']*','[^']*','([^']*)'/);if(!match)continue;const[,city,,name,registration,status,link]=match;const nonRoad=/\['(?:Trail|Mountain|Ultra)/.test(line);road.push({slug:slug(nonRoad?name:city),name,registration,status,link})}
const ironman=JSON.parse(await readFile(new URL('../public/ironman-events.json',import.meta.url),'utf8')).events.map(event=>({slug:event.slug,name:event.name,registration:event.registration,status:event.status,link:event.link}));
const races=[...road,...ironman].filter(race=>race.status==='Open');
const response=await fetch(endpoint,{method:'POST',headers:{authorization:`Bearer ${secret}`,'content-type':'application/json'},body:JSON.stringify({races}),signal:AbortSignal.timeout(120000)});
const result=await response.text();
if(!response.ok)throw new Error(`Registration-alert dispatch returned ${response.status}: ${result.slice(0,500)}`);
console.log(`Registration-alert dispatch complete for ${races.length} open events: ${result}`);
