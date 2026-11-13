import {env} from 'cloudflare:workers';
import {npcSeed, type Npc} from './npc-seed';

const workspaceId = 'npcs';
export async function readNpcs(): Promise<{npcs:Npc[];version:number}> {
  const row = await env.DB!.prepare('SELECT data, version FROM workspace WHERE id=?').bind(workspaceId).first<{data:string;version:number}>();
  return row ? {npcs:JSON.parse(row.data) as Npc[],version:row.version} : {npcs:npcSeed,version:0};
}
export async function saveNpcs(npcs:unknown,version:number):Promise<{version:number}> {
  if (!Array.isArray(npcs) || npcs.length!==5 || !Number.isInteger(version) || version<0)
    throw Error('NPC 목록은 5명이어야 합니다.');
  const ids = new Set<string>();
  for(const n of npcs){
    if(!n||typeof n!=='object'||typeof n.id!=='string'||!['1','2','3','4','5'].includes(n.id)||ids.has(n.id))
      throw Error('NPC ID가 올바르지 않습니다.');
    ids.add(n.id);
    for(const key of ['name','status','personality','home','relationships','notes','sprite']){
      if(typeof n[key]!=='string')throw Error(key+' 값이 올바르지 않습니다.');
    }
    if(!['미정','확정','보류','제외'].includes(n.status))throw Error('결정 상태가 올바르지 않습니다.');
    if(!Array.isArray(n.abilities)||n.abilities.length>30||n.abilities.some((a:unknown)=>!a||typeof a!=='object'||typeof (a as {name?:unknown}).name!=='string'||typeof (a as {value?:unknown}).value!=='string'))
      throw Error('능력치 데이터가 올바르지 않습니다.');
  }
  const data = JSON.stringify(npcs);
  if(data.length>1500000)throw Error('스프라이트 이미지 용량을 줄여 주세요.');
  const result = version===0
    ? await env.DB!.prepare('INSERT OR IGNORE INTO workspace (id,data,version) VALUES (?,?,1)').bind(workspaceId,data).run()
    : await env.DB!.prepare('UPDATE workspace SET data=?,version=version+1 WHERE id=? AND version=?').bind(data,workspaceId,version).run();
  if(!result.meta.changes)throw Error('다른 창에서 수정되었습니다. 새로고침 후 다시 시도해 주세요.');
  return {version:version+1};
}
