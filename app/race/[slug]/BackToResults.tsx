'use client';

export default function BackToResults(){
 return <button className="back-link back-results" onClick={()=>{if(history.length>1)history.back();else location.href='/#directory'}}>← Back to your results</button>;
}
