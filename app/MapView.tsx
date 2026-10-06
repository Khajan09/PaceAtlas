'use client';
import {useEffect,useRef} from 'react';

export type MapRace={city:string;country:string;name:string;date:string;registration:string;status:string;lat:number;lon:number;href:string};

export default function MapView({races}:{races:MapRace[]}){
 const elementRef=useRef<HTMLDivElement>(null);
 const mapRef=useRef<import('leaflet').Map|null>(null);
 useEffect(()=>{
  let cancelled=false;
  async function render(){
   const L=await import('leaflet');if(cancelled||!elementRef.current)return;
   if(mapRef.current){mapRef.current.remove();mapRef.current=null}
   const map=L.map(elementRef.current,{zoomControl:true,scrollWheelZoom:true,minZoom:2,worldCopyJump:true}).setView([26,8],2);
   mapRef.current=map;
   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(map);
   const bounds:L.LatLngExpression[]=[];
   races.forEach(race=>{
    const icon=L.divIcon({className:'pace-marker-wrap',html:`<span class="pace-marker"></span>`,iconSize:[22,22],iconAnchor:[11,11]});
    L.marker([race.lat,race.lon],{icon}).addTo(map).bindPopup(`<div class="map-popup"><small>${race.country}</small><strong>${race.city}</strong><span>${race.name}</span><dl><dt>Event</dt><dd>${race.date}</dd><dt>Registration</dt><dd>${race.registration}</dd></dl><a href="${race.href}">View race details →</a></div>`,{minWidth:235});
    bounds.push([race.lat,race.lon]);
   });
   if(bounds.length===1)map.setView(bounds[0],7);else if(bounds.length>1)map.fitBounds(bounds,{padding:[45,45],maxZoom:5});
   setTimeout(()=>map.invalidateSize(),0);
  }
  render();return()=>{cancelled=true;if(mapRef.current){mapRef.current.remove();mapRef.current=null}};
 },[races]);
 return <div className="leaflet-map" ref={elementRef} aria-label={`Interactive map with ${races.length} races`}/>;
}
