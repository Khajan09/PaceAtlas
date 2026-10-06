// Production schema is applied from the generated migration in drizzle/.
// This type documents the D1 rows used by the server-only database helper.
export type RaceRow={slug:string;city:string;country:string;code:string;region:string;name:string;date:string;event:string|null;registration:string;status:string;terrain:string;tier:string;link:string;featured:number;lat:number;lon:number;distances:string;route:string|null;elevation:string|null;route_note:string|null;ticket_cost:string|null;transfer_policy:string|null;source_url:string|null;image_file:string|null};
