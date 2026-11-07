export const clampUnit=(v:number)=>Math.max(0,Math.min(1,v));
export function journeyAt(scroll:number,viewport:number,height:number,stations:number[],heroDistance:number,processTop:number,processHeight:number){
 const travel=Math.max(1,height-viewport),page=clampUnit(scroll/travel),position=page*travel;
 const reference=position+viewport*.38;
 let current=0;
 for(let i=1;i<stations.length;i++){if(stations[i]<=reference)current=i;}
 if(page>=.995)current=Math.max(0,stations.length-1);
 return {page,hero:clampUnit(position/Math.max(1,heroDistance)),process:clampUnit((position+viewport*.85-processTop)/Math.max(1,processHeight)),current};
}
