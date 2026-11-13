export type NpcAbility = { name: string; value: string };
export type Npc = {
  id: string;
  name: string;
  status: string;
  personality: string;
  home: string;
  relationships: string;
  abilities: NpcAbility[];
  notes: string;
  sprite: string;
};
export const npcSeed: Npc[] = Array.from({length:5},(_,i)=>({
  id:String(i+1), name:`NPC ${i+1}`, status:'미정',
  personality:'', home:'', relationships:'', abilities:[], notes:'', sprite:''
}));
