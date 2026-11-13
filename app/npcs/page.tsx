'use client';

import {useEffect,useState} from 'react';
import type {Npc} from '@/lib/npc-seed';

const statuses=['미정','확정','보류','제외'];
export default function NpcPage(){
  const [npcs,setNpcs]=useState<Npc[]>([]);
  const [version,setVersion]=useState(0);
  const [selected,setSelected]=useState('1');
  const [dirty,setDirty]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('설정을 불러오는 중…');

  async function load(){
    try{
      const r=await fetch('/api/npcs',{cache:'no-store'});
      if(!r.ok)throw Error('불러오기 실패');
      const data:{npcs:Npc[];version:number}=await r.json();
      setNpcs(data.npcs);setVersion(data.version);setDirty(false);
      setMessage('저장된 NPC 설정을 불러왔어요.');
    }catch(e){setMessage(String(e));}
  }
  useEffect(()=>{void load()},[]);
  useEffect(()=>{
    const handler=(event:BeforeUnloadEvent)=>{if(dirty)event.preventDefault()};
    window.addEventListener('beforeunload',handler);
    return ()=>window.removeEventListener('beforeunload',handler);
  },[dirty]);
  function edit(id:string,key:keyof Npc,value:string){
    setNpcs(old=>old.map(n=>n.id===id?{...n,[key]:value}:n));
    setDirty(true);setMessage('저장하지 않은 변경사항이 있어요.');
  }
  function abilities(id:string,next:Npc['abilities']){
    setNpcs(old=>old.map(n=>n.id===id?{...n,abilities:next}:n));
    setDirty(true);setMessage('저장하지 않은 변경사항이 있어요.');
  }
  async function save(){
    setBusy(true);
    try{
      const r=await fetch('/api/npcs',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({npcs,version})});
      const data:{version?:number;error?:string}=await r.json();
      if(!r.ok)throw Error(data.error||'저장 실패');
      setVersion(data.version!);setDirty(false);setMessage('NPC 설정을 저장했어요.');
    }catch(e){setMessage(String(e));}finally{setBusy(false);}
  }
  function download(){
    const blob=new Blob([JSON.stringify({npcs},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='survival-npcs.json';a.click();URL.revokeObjectURL(url);
  }
  function upload(file:File,id:string){
    if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>180000){setMessage('180KB 이하 PNG, JPG, WEBP, GIF 파일만 사용할 수 있어요.');return;}
    const reader=new FileReader();reader.onload=()=>edit(id,'sprite',String(reader.result));reader.readAsDataURL(file);
  }
  const current=npcs.find(n=>n.id===selected);
  return <div className="shell">
    <aside>
      <a className="brand" href="/">▧ <span>물자 작업실<small>SURVIVAL DESIGN STUDIO</small></span></a>
      <div className="project"><span className="live"/> 생존 RPG 프로토타입<small>나의 게임 디자인 공간</small></div>
      <div className="nav-label">작업 공간</div>
      <a className="nav page-nav" href="/">▦　물자 라이브러리</a>
      <a className="nav active page-nav" href="/npcs">♙　NPC 관리 <small>5명</small></a>
      <div className="aside-bottom"><div className="connect"><b>공통 NPC AI</b><p>NPC는 동일한 AI를 사용하고<br/>성격과 능력치에 따라 행동이 달라져요.</p></div><small>PROTOTYPE · WORKSPACE 01</small></div>
    </aside>
    <main>
      <header><span>내 작업 공간 <b>/</b> NPC 관리</span><a href="/" className="header-link">물자 라이브러리 ↗</a></header>
      <section className="content">
        <div className="eyebrow">GAME DESIGN / CHARACTERS</div>
        <div className="heading">
          <div><h1>NPC 관리<span>5</span></h1><p>공통 AI를 사용하는 테스트용 NPC 다섯 명의 개별 설정을 편집하세요.</p></div>
          <div className="actions"><button disabled={!npcs.length} onClick={download}>↓ JSON 내보내기</button><button className="primary" disabled={!dirty||busy} onClick={()=>void save()}>{busy?'저장 중…':'✓ 변경사항 저장'}</button></div>
        </div>
        <div className="stats npc-stats">
          <div><span>테스트 NPC</span><b>{npcs.length}<small>명</small></b></div>
          <div><span>확정</span><b>{npcs.filter(n=>n.status==='확정').length}<small>명</small></b></div>
          <div><span>미정</span><b>{npcs.filter(n=>n.status==='미정').length}<small>명</small></b></div>
          <div><span>능력치 설정</span><b>{npcs.filter(n=>n.abilities.some(a=>a.name.trim()&&a.value.trim())).length}<small>/ 5</small></b></div>
        </div>
        <div className="notice">ⓘ <span>성격, 능력치, 관계 및 거처는 직접 입력하기 전까지 <b>미정</b>이에요. 모든 NPC는 같은 기본 AI를 사용해요.</span></div>
        <div className="npc-layout">
          <nav className="npc-list" aria-label="NPC 선택">
            {npcs.map(n=><button key={n.id} className={'npc-option '+(selected===n.id?'chosen':'')} onClick={()=>setSelected(n.id)}>
              <span className="npc-avatar">{n.sprite?<img src={n.sprite} alt=""/>:'♙'}</span>
              <span className="npc-option-copy"><b>{n.name||'NPC '+n.id}</b><small>{n.personality||'성격 미정'}</small></span>
              <span className="npc-state">{n.status}</span>
            </button>)}
          </nav>
          {current&&<div className="npc-editor" key={current.id}>
            <div className="npc-editor-top"><div><span className="eyebrow">CHARACTER / {current.id.padStart(2,'0')}</span><h2>{current.name||'NPC '+current.id}</h2></div><select aria-label="결정 상태" value={current.status} onChange={e=>edit(current.id,'status',e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
            <div className="npc-portrait-row"><span className="npc-portrait">{current.sprite?<img src={current.sprite} alt="NPC 스프라이트"/>:'♙'}</span><div><b>NPC 스프라이트</b><p>선택 사항 · PNG, JPG, WEBP, GIF / 최대 180KB</p><label className="upload">↑ 이미지 업로드<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0],current.id)}/></label>{current.sprite&&<button onClick={()=>edit(current.id,'sprite','')}>이미지 해제</button>}</div></div>
            <div className="form npc-form">
              <label>이름<input value={current.name} onChange={e=>edit(current.id,'name',e.target.value)} placeholder="이름 미정"/></label>
              <label>거처<input value={current.home} onChange={e=>edit(current.id,'home',e.target.value)} placeholder="미정"/></label>
              <label className="wide">성격 · 행동 성향<textarea value={current.personality} onChange={e=>edit(current.id,'personality',e.target.value)} placeholder="미정 · 성격과 행동 우선순위 자유 입력"/></label>
              <label className="wide">관계 · 친밀도 설정<textarea value={current.relationships} onChange={e=>edit(current.id,'relationships',e.target.value)} placeholder="미정 · 플레이어/NPC와의 관계 자유 입력"/></label>
            </div>
            <div className="npc-ability-head"><h3>능력치</h3><button disabled={current.abilities.length>=30} onClick={()=>abilities(current.id,[...current.abilities,{name:'',value:''}])}>+ 능력치 추가</button></div>
            <p className="npc-hint">능력치 종류와 수치는 직접 정해요. 이름이나 값이 비어 있다면 확정된 것으로 취급하지 않아요.</p>
            {current.abilities.map((ability,i)=><div className="npc-ability" key={i}>
              <input aria-label={'능력치 이름 '+(i+1)} placeholder="능력치 이름" value={ability.name} onChange={e=>abilities(current.id,current.abilities.map((a,j)=>i===j?{...a,name:e.target.value}:a))}/>
              <input aria-label={'능력치 수치 '+(i+1)} placeholder="수치 (미정)" value={ability.value} onChange={e=>abilities(current.id,current.abilities.map((a,j)=>i===j?{...a,value:e.target.value}:a))}/>
              <button aria-label={'능력치 삭제 '+(i+1)} onClick={()=>abilities(current.id,current.abilities.filter((_,j)=>j!==i))}>✕</button>
            </div>)}
            <div className="form npc-form"><label className="wide">추가 설정<textarea value={current.notes} onChange={e=>edit(current.id,'notes',e.target.value)} placeholder="아직 결정하지 않은 설정은 비워두세요."/></label></div>
            <div className="drawer-foot"><button disabled={busy||!dirty} className="primary" onClick={()=>void save()}>변경사항 저장</button></div>
          </div>}
        </div>
        <footer><span aria-live="polite">{dirty?'●':'✓'} {message}</span><span>물자와 NPC 설정은 각각 별도로 저장돼요.</span></footer>
      </section>
    </main>
  </div>;
}
