export function sceneBudget(width:number,cores:number,memory:number,ratio:number){
 const lite=width<700 || (cores>0 && cores<=4) || (memory>0 && memory<=4);
 return {lite,dpr:Math.min(Math.max(1,ratio),lite?1.5:1.75),fps:lite?24:40};
}
export const cubeCells=Array.from({length:27},(_,i)=>[i%3-1,Math.floor(i/3)%3-1,Math.floor(i/9)-1] as const);
