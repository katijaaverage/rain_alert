import {read,save} from '@/lib/store';
export async function GET(){return Response.json(await read());}
export async function PUT(req:Request){try{const b:any=await req.json();return Response.json(await save(b.items,b.version));}catch(e){return Response.json({error:String(e)},{status:409});}}
