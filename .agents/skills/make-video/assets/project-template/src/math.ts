export type Point = [number, number];
export type Quad = [Point, Point, Point, Point];
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const ease = (p: number) => 1 - Math.pow(1 - clamp(p), 3);
export const smooth = (p: number) => {const q = clamp(p); return q * q * (3 - 2 * q);};
export const progress = (t: number, a: number, b: number) => clamp((t-a)/(b-a));
export const reveal = (t: number, a: number, b: number) => ease(progress(t, a, b));
export const fade = (t: number, a: number, b: number, c: number, d: number) => reveal(t,a,b) * (1-reveal(t,c,d));
export const hash = (n: number) => {const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x);};
export const track = (t: number, times: number[], values: number[], easing=ease) => {
  if(t<=times[0])return values[0];
  for(let i=1;i<times.length;i++)if(t<times[i])return lerp(values[i-1],values[i],easing((t-times[i-1])/(times[i]-times[i-1])));
  return values[values.length-1];
};
export const mixQuad=(a:Quad,b:Quad,p:number):Quad=>a.map((v,i)=>[lerp(v[0],b[i][0],p),lerp(v[1],b[i][1],p)]) as Quad;
export const quadTrack=(t:number,times:number[],values:Quad[]):Quad=>{
  if(t<=times[0])return values[0];
  for(let i=1;i<times.length;i++)if(t<times[i])return mixQuad(values[i-1],values[i],ease((t-times[i-1])/(times[i]-times[i-1])));
  return values[values.length-1];
};
export const scaleQuad=(q:Quad,scale:number,c:Point=[960,540],offset:Point=[0,0]):Quad=>q.map(([x,y])=>[c[0]+(x-c[0])*scale+offset[0],c[1]+(y-c[1])*scale+offset[1]]) as Quad;

// Homography: exact plane-to-quadrilateral projection. CSS performs the perspective divide.
export const homography=(q:Quad,w:number,h:number)=>{
  const src:Point[]=[[0,0],[w,0],[w,h],[0,h]];
  const matrix:number[][]=[];
  src.forEach(([x,y],i)=>{const [u,v]=q[i];matrix.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);});
  for(let col=0;col<8;col++){
    let pivot=col;for(let row=col+1;row<8;row++)if(Math.abs(matrix[row][col])>Math.abs(matrix[pivot][col]))pivot=row;
    [matrix[col],matrix[pivot]]=[matrix[pivot],matrix[col]];
    const d=matrix[col][col];for(let j=col;j<9;j++)matrix[col][j]/=d;
    for(let row=0;row<8;row++)if(row!==col){const f=matrix[row][col];for(let j=col;j<9;j++)matrix[row][j]-=f*matrix[col][j];}
  }
  return matrix.map(row=>row[8]);
};
export const matrix3d=(q:Quad,w:number,h:number)=>{
  const [a,b,c,d,e,f,g,hg]=homography(q,w,h);
  return `matrix3d(${[a,d,0,g,b,e,0,hg,0,0,1,0,c,f,0,1].join(',')})`;
};
export const project=(q:Quad,w:number,h:number,x:number,y:number):Point=>{
  const [a,b,c,d,e,f,g,hg]=homography(q,w,h);const den=g*x+hg*y+1;
  return [(a*x+b*y+c)/den,(d*x+e*y+f)/den];
};
export const path=(points:Point[],close=false)=>points.map(([x,y],i)=>`${i?'L':'M'} ${x} ${y}`).join(' ')+(close?' Z':'');
