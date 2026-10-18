import {readFile,writeFile} from 'node:fs/promises';

const source=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
const urls=[...new Set([...source.matchAll(/r\([^\n]+?'(https?:\/\/[^']+)'/g)].map(match=>match[1]))];
const timeoutMs=20000;

async function check(url){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(url,{redirect:'follow',signal:controller.signal,headers:{'user-agent':'PaceAtlas catalog verifier/1.0 (+https://paceatlas.khajansyadav.workers.dev/)'}});
    return {url,status:response.status,reachable:response.status<500};
  }catch(error){
    return {url,status:0,reachable:false,error:error instanceof Error?error.message:'Request failed'};
  }finally{clearTimeout(timer)}
}

const results=[];
for(let index=0;index<urls.length;index+=6) results.push(...await Promise.all(urls.slice(index,index+6).map(check)));
const reachable=results.filter(result=>result.reachable);
const status={checkedAt:new Date().toISOString(),sourceCount:results.length,reachableCount:reachable.length,unavailable:results.filter(result=>!result.reachable)};
await writeFile(new URL('../public/catalog-status.json',import.meta.url),`${JSON.stringify(status,null,2)}\n`);
console.log(`Checked ${results.length} official sources; ${reachable.length} responded.`);
if(reachable.length<Math.ceil(results.length*.65)) throw new Error('Too many official sources were unreachable; catalog timestamp was not accepted.');
