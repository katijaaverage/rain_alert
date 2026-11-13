import {readNpcs,saveNpcs} from '@/lib/npc-store';
export async function GET(){return Response.json(await readNpcs());}
export async function PUT(req:Request){
  try{const body:unknown=await req.json();if(!body||typeof body!=='object')throw Error('잘못된 요청');const data=body as {npcs:unknown;version:number};return Response.json(await saveNpcs(data.npcs,data.version));}
  catch(e){return Response.json({error:String(e)},{status:409});}
}
