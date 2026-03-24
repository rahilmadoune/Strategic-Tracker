/* ══════════════════════════════════════════════════
   2026 STRATEGIC TRACKER — script.js
   Nature-inspired. All features working.
   ══════════════════════════════════════════════════ */
'use strict';

/* ── STATE ── */
const AppState = (() => {
  const V='5.0', K='tracker_v5';
  const D={version:V,goals:[],languages:[],certifications:[],habits:[],weeklyRoutine:[]};
  let s=structuredClone(D);
  async function load(){
    try{if(window.storage){const r=await window.storage.get(K);if(r?.value){const p=JSON.parse(r.value);if(p.version===V){s=p;return;}}}}catch(_){}
    try{const r=localStorage.getItem(K);if(r){const p=JSON.parse(r);if(p.version===V)s=p;}}catch(_){}
  }
  async function save(){
    const j=JSON.stringify(s);
    try{if(window.storage)await window.storage.set(K,j);}catch(_){}
    try{localStorage.setItem(K,j);}catch(_){}
  }
  return {load, save, get:()=>s, update(fn){fn(s);save();}};
})();

/* ── THEME (light only — nature design is light-first) ── */
function applyGreeting(){
  const h=new Date().getHours();
  const g=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  const el=document.querySelector('.page-title');
  if(el&&el.closest('#dashboard'))el.textContent=g+'.';
}

/* ── TOAST ── */
const Toast=(()=>{
  const C=document.getElementById('toastContainer');
  function show(m,t='success',d=3000){
    const el=document.createElement('div');
    el.className=`toast toast--${t}`;el.setAttribute('role','alert');
    el.textContent=m; C.appendChild(el);
    setTimeout(()=>{el.classList.add('removing');el.addEventListener('animationend',()=>el.remove(),{once:true});},d);
  }
  return {show,success:m=>show(m,'success'),error:m=>show(m,'error'),warning:m=>show(m,'warning'),info:m=>show(m,'info')};
})();

/* ── ROUTER — single delegated listener — fixes language nav bug ── */
const Router=(()=>{
  let cur='dashboard';
  function go(id){
    const pg=document.getElementById(id);if(!pg)return;
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    pg.classList.add('active');cur=id;
    document.querySelectorAll('[data-page]').forEach(b=>{
      b.classList.toggle('active',b.dataset.page===id);
    });
    if(id==='analytics')setTimeout(Charts.init,80);
    document.getElementById('mainContent')?.scrollTo({top:0,behavior:'smooth'});
    revealStagger(pg);
  }
  function init(){
    document.body.addEventListener('click',e=>{
      const b=e.target.closest('[data-page]');
      if(b)go(b.dataset.page);
    });
  }
  return {init,go,cur:()=>cur};
})();

/* ── MODAL ── */
const Modal=(()=>{
  function open(id){
    const m=document.getElementById(id);if(!m)return;
    m.classList.add('open');
    const f=m.querySelector('input:not([type=hidden]),select,textarea');
    if(f)setTimeout(()=>f.focus(),80);
    document.body.style.overflow='hidden';
  }
  function close(id){
    const m=document.getElementById(id);if(!m)return;
    m.classList.remove('open');
    m.querySelectorAll('.err').forEach(e=>e.textContent='');
    m.querySelectorAll('.inp.error').forEach(e=>e.classList.remove('error'));
    document.body.style.overflow='';
  }
  function init(){
    document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>close(b.dataset.close)));
    document.querySelectorAll('.modal-veil').forEach(v=>v.addEventListener('click',()=>close(v.closest('.modal').id)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal.open').forEach(m=>close(m.id));});
  }
  return {open,close,init};
})();

/* ── VALIDATE ── */
const Vld={
  err(id,msg){const i=document.getElementById(id),e=document.getElementById(`${id}-err`);if(i)i.classList.add('error');if(e)e.textContent=msg;return false;},
  ok(id){const i=document.getElementById(id),e=document.getElementById(`${id}-err`);if(i)i.classList.remove('error');if(e)e.textContent='';},
  req(id,lbl){const v=(document.getElementById(id)?.value||'').trim();if(!v)return this.err(id,`${lbl} is required`);this.ok(id);return v;}
};

/* ── STREAKS ── */
const Streaks={
  today:()=>new Date().toDateString(),
  complete(h){
    const t=this.today();if(h.lastCompleted===t)return h;
    const y=new Date();y.setDate(y.getDate()-1);
    h.streak=(h.lastCompleted===y.toDateString())?(h.streak||0)+1:1;
    h.lastCompleted=t;h.completed=true;return h;
  },
  resetIfNew(h){if(h.lastCompleted!==this.today())h.completed=false;return h;}
};

/* ── CONFETTI — gentle version ── */
const Confetti=(()=>{
  const cv=document.getElementById('confettiCanvas'),ctx=cv.getContext('2d');
  const C=['#5c7a62','#8aa490','#a8c4ab','#b8a090','#9090a8'];
  let pts=[],id=null;
  function launch(){
    cv.width=innerWidth;cv.height=innerHeight;
    pts=Array.from({length:55},()=>({
      x:Math.random()*cv.width,y:-8,r:Math.random()*3.5+1.5,
      c:C[Math.floor(Math.random()*C.length)],
      vx:(Math.random()-.5)*2,vy:Math.random()*1.8+1.2,
      a:0,ai:Math.random()*.04+.02
    }));
    if(id)cancelAnimationFrame(id);draw();setTimeout(stop,3000);
  }
  function draw(){
    ctx.clearRect(0,0,cv.width,cv.height);
    pts.forEach(p=>{p.a+=p.ai;p.x+=p.vx+Math.sin(p.a)*.35;p.y+=p.vy;
      ctx.beginPath();ctx.fillStyle=p.c+'cc';
      ctx.ellipse(p.x,p.y,p.r,p.r*.4,p.a,0,Math.PI*2);ctx.fill();
    });
    pts=pts.filter(p=>p.y<cv.height+16);
    if(pts.length)id=requestAnimationFrame(draw);
  }
  function stop(){if(id)cancelAnimationFrame(id);ctx.clearRect(0,0,cv.width,cv.height);}
  return{launch};
})();

/* ── CHARTS ── */
const Charts=(()=>{
  let c1=null,c2=null;
  const kill=c=>{if(c){c.destroy();return null;}return null;};
  function init(){
    const {goals,languages}=AppState.get();
    const tc='#a8a49e',gc='rgba(42,40,37,.04)';
    c1=kill(c1);
    const e1=document.getElementById('completionChart');
    if(e1){
      const cats=['Academic','Technical','Business','Personal'],keys=['academic','technical','business','personal'];
      c1=new Chart(e1,{type:'bar',data:{labels:cats,datasets:[{label:'%',
        data:keys.map(k=>{const g=goals.filter(g=>g.category===k);return g.length?Math.round(g.reduce((s,g)=>s+g.progress,0)/g.length):0;}),
        backgroundColor:['rgba(90,112,135,.7)','rgba(92,122,98,.7)','rgba(138,112,96,.7)','rgba(128,96,128,.7)'],
        borderRadius:4,borderSkipped:false}]},
        options:{responsive:true,maintainAspectRatio:false,
          plugins:{legend:{display:false}},
          scales:{y:{beginAtZero:true,max:100,grid:{color:gc},ticks:{color:tc,font:{family:'Plus Jakarta Sans',size:11}}},
                  x:{grid:{display:false},ticks:{color:tc,font:{family:'Plus Jakarta Sans',size:11}}}}}
      });
    }
    c2=kill(c2);
    const e2=document.getElementById('languageChart');
    if(e2&&languages.length){
      c2=new Chart(e2,{type:'doughnut',data:{labels:languages.map(l=>l.name),
        datasets:[{data:languages.map(l=>l.hours||0),
          backgroundColor:['#5c7a62','#8aa490','#5a7087','#8a7060','#806080'],borderWidth:0}]},
        options:{responsive:true,maintainAspectRatio:false,cutout:'68%',
          plugins:{legend:{position:'right',labels:{color:tc,font:{family:'Plus Jakarta Sans',size:11},padding:12}}}}
      });
    }
  }
  return{init};
})();

/* ── DRAG & DROP (certifications) ── */
const Drag=(()=>{
  let src=null;
  function bind(list){
    list.addEventListener('dragstart',e=>{
      const row=e.target.closest('.cert-item');if(!row)return;
      src=+row.dataset.id;row.classList.add('dragging');e.dataTransfer.effectAllowed='move';
    });
    list.addEventListener('dragend',e=>{
      const row=e.target.closest('.cert-item');if(row)row.classList.remove('dragging');
      list.querySelectorAll('.cert-item').forEach(r=>r.classList.remove('drag-over'));
    });
    list.addEventListener('dragover',e=>{
      e.preventDefault();const row=e.target.closest('.cert-item');
      if(!row||+row.dataset.id===src)return;
      list.querySelectorAll('.cert-item').forEach(r=>r.classList.remove('drag-over'));
      row.classList.add('drag-over');
    });
    list.addEventListener('drop',e=>{
      e.preventDefault();const row=e.target.closest('.cert-item');if(!row)return;
      const dst=+row.dataset.id;if(dst===src)return;
      AppState.update(s=>{
        const c=s.certifications,fi=c.findIndex(x=>x.id===src),ti=c.findIndex(x=>x.id===dst);
        if(fi<0||ti<0)return;const[m]=c.splice(fi,1);c.splice(ti,0,m);
      });
      Render.certs();
    });
  }
  return{bind};
})();

/* ── REVEAL STAGGER ── */
function revealStagger(container){
  container.querySelectorAll('[data-reveal]').forEach((el,i)=>{
    el.classList.remove('shown');void el.offsetWidth;
    setTimeout(()=>el.classList.add('shown'),50+i*80);
  });
}

/* ── HELPERS ── */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const lvlColor=l=>({A0:'#b87070',A1:'#b88a70',A2:'#a89060',B1:'#7a9060',B2:'#5c7a62',C1:'#5a7087',C2:'#7a6090'}[l]||'#a8a49e');
function pill(p){
  if(p===100)return'<span class="pill pill--done">Done</span>';
  if(p>=60)return'<span class="pill pill--active">In progress</span>';
  if(p>0)return'<span class="pill pill--started">Started</span>';
  return'<span class="pill pill--pending">Pending</span>';
}
function animBars(root){
  requestAnimationFrame(()=>{
    (root||document).querySelectorAll('[data-bar]').forEach(el=>{el.style.width=el.dataset.bar+'%';});
  });
}

/* ── RENDER ── */
const Render={
  dashboard(){
    const {goals,habits,languages,certifications}=AppState.get();
    const done=goals.filter(g=>g.progress===100).length;
    const ms=goals.filter(g=>g.milestone).length,msDone=goals.filter(g=>g.milestone&&g.progress===100).length;
    const avg=goals.length?Math.round(goals.reduce((s,g)=>s+g.progress,0)/goals.length):0;
    const todayDone=habits.filter(h=>h.completed).length;
    const best=habits.reduce((m,h)=>Math.max(m,h.streak||0),0);
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('goalsCompleted',done);set('goalTotal',goals.length);
    set('milestonesAchieved',msDone);set('milestoneTotal',ms);
    set('habitsTracked',habits.length);set('overallProgress',avg+'%');
    set('avgCompletion',avg+'%');set('langCount',languages.length);set('certCount',certifications.length);
    set('consistency',habits.length?`${todayDone}/${habits.length}`:'—');
    set('sidebarToday',`${todayDone} / ${habits.length} habits`);
    set('sidebarStreak',best>0?`${best} days`:'—');
    const d=new Date();
    set('todayDate',d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}));
    const fw=(fn)=>{const g=goals.filter(fn);return g.length?Math.round(g.reduce((s,x)=>s+x.progress,0)/g.length):0;};
    [['fw-academic','fw-academic-pct',g=>g.category==='academic'],
     ['fw-health','fw-health-pct',g=>g.category==='personal'],
     ['fw-career','fw-career-pct',g=>g.category==='technical'||g.category==='business'],
     ['fw-personal','fw-personal-pct',_=>true]
    ].forEach(([fid,pid,fn])=>{
      const pct=fw(fn);
      const fe=document.getElementById(fid),pe=document.getElementById(pid);
      if(pe)pe.textContent=pct+'%';
      if(fe)setTimeout(()=>fe.style.width=pct+'%',400);
    });
  },

  goals(){
    const {goals}=AppState.get();
    const map={academic:'academicGoalsTable',technical:'technicalGoalsTable',business:'businessGoalsTable'};
    Object.entries(map).forEach(([cat,id])=>{
      const rows=goals.filter(g=>g.category===cat);
      document.getElementById(id).innerHTML=rows.length
        ?rows.map(g=>`<tr>
          <td style="font-weight:500">${esc(g.name)}${g.milestone?`<br><span style="font-size:.68rem;color:var(--text-4);font-weight:300">↳ ${esc(g.milestone)}</span>`:''}</td>
          <td><div class="rbar"><div class="rbar__f${g.progress===100?' rbar__f--done':''}" data-bar="${g.progress}"></div></div></td>
          <td>${pill(g.progress)}</td>
          <td><div style="display:flex;gap:.2rem">
            <button class="rbtn" onclick="Goals.openEdit(${g.id})">Edit</button>
            <button class="rbtn rbtn--del" onclick="Goals.delete(${g.id})">✕</button>
          </div></td></tr>`).join('')
        :'<tr><td colspan="4" class="t-empty">No goals yet</td></tr>';
    });
    animBars();
  },

  languages(){
    const {languages}=AppState.get();
    const active=languages.filter(l=>l.status==='active');
    const maint=languages.filter(l=>l.status==='maintenance');
    const card=l=>{
      const pct=Math.min(100,Math.round((l.hours/600)*100)),c=lvlColor(l.level);
      return `<div class="lang-card">
        <div class="lang-card__name">${esc(l.name)}</div>
        <div class="lang-card__lvl">${l.level} &nbsp;·&nbsp; ${l.hours}h invested</div>
        <div class="lang-card__bar"><div class="lang-card__fill" data-bar="${pct}" style="background:${c}"></div></div>
        <div class="lang-card__meta">${pct}% toward fluency (600h)</div>
        <button class="lang-card__del" onclick="Languages.delete(${l.id})">Remove</button>
      </div>`;
    };
    const ag=document.getElementById('activeLanguagesGrid'),mg=document.getElementById('maintenanceLanguagesGrid');
    ag.innerHTML=active.length?active.map(card).join(''):'<p class="empty-note">Add your first active language</p>';
    mg.innerHTML=maint.length?maint.map(card).join(''):'<p class="empty-note">No maintenance languages yet</p>';
    animBars();
  },

  certs(){
    const {certifications}=AppState.get();
    const list=document.getElementById('certList');
    if(!certifications.length){
      list.innerHTML='<p class="empty-note" style="padding:3rem;text-align:center">No certifications yet</p>';return;
    }
    list.innerHTML=certifications.map(c=>{
      const has=c.estHours>0;
      const pct=has?Math.min(100,Math.round((c.hours/c.estHours)*100)):null;
      const dLeft=has?Math.max(0,Math.ceil((c.estHours-c.hours)/2)):null;
      const comp=dLeft!==null?new Date(Date.now()+dLeft*864e5).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):null;
      return `<div class="cert-item" data-id="${c.id}" draggable="true">
        <div class="cert-row" onclick="Certs.toggle(${c.id})">
          <span class="cert-drag" draggable="false" title="Drag to reorder">⠿</span>
          <div>
            <div class="cert-name">${esc(c.name)}</div>
            <div class="cert-sub">${has?`${c.hours}/${c.estHours}h · est. ${comp}`:'Hours not tracked'}</div>
          </div>
          ${has?`<div class="cert-bar-wrap">
            <div class="cert-pct">${pct}%</div>
            <div class="cert-pbar"><div class="cert-pbar__f" data-bar="${pct}"></div></div>
          </div>`:'<div></div>'}
          <div onclick="event.stopPropagation()">${pill(pct??0)}</div>
          <div style="display:flex;align-items:center;gap:.4rem" onclick="event.stopPropagation()">
            <button class="rbtn rbtn--del" onclick="Certs.delete(${c.id})">✕</button>
            <span class="cert-chev" id="chev-${c.id}">▾</span>
          </div>
        </div>
        <div class="cert-body" id="cbody-${c.id}">
          <div class="cert-body-inner">
            <div class="cert-desc">${c.description?esc(c.description):'<em style="color:var(--text-4)">No notes added.</em>'}</div>
            ${has?`<div class="cert-stats">
              <div><div class="cert-stat-lbl">Hours done</div><div class="cert-stat-val">${c.hours}h</div></div>
              <div><div class="cert-stat-lbl">Total est.</div><div class="cert-stat-val">${c.estHours}h</div></div>
              <div><div class="cert-stat-lbl">Est. finish</div><div class="cert-stat-val" style="font-size:.95rem">${comp}</div></div>
            </div>`:''}
          </div>
        </div>
      </div>`;
    }).join('');
    animBars(list);
    Drag.bind(list);
  },

  habits(){
    const {habits}=AppState.get();
    const grid=document.getElementById('habitsGrid');
    if(!habits.length){grid.innerHTML='<p class="empty-note" style="padding:2rem 1.5rem">No habits yet — start small</p>';return;}
    const icons={spiritual:'✦',sports:'◈',reading:'◎',focus:'◉',scrolling:'◫'};
    grid.innerHTML=habits.map(h=>{
      Streaks.resetIfNew(h);const st=h.streak||0;
      return `<div class="habit-row${h.completed?' done':''}" data-id="${h.id}">
        <div>
          <div class="habit-name">${icons[h.category]||'·'} ${esc(h.name)}</div>
          <div class="habit-meta">${h.target} min &nbsp;·&nbsp; ${h.category}</div>
        </div>
        <div class="habit-streak">${st>0?st+' day'+(st>1?'s':''):'—'}</div>
        <div style="display:flex;align-items:center;gap:.4rem">
          ${!h.completed
            ?`<button class="habit-done-btn" onclick="Habits.complete(${h.id})">Done</button>`
            :`<button class="habit-done-btn is-done" disabled>✓</button>`}
          <button class="rbtn rbtn--del" onclick="Habits.delete(${h.id})">✕</button>
        </div>
      </div>`;
    }).join('');
    const best=habits.reduce((m,h)=>Math.max(m,h.streak||0),0);
    const b=document.getElementById('streakBanner');
    if(best>=3){b.className='streak-note on';b.textContent=`Your best streak is ${best} days — keep the momentum.`;}
    else b.className='streak-note';
  },

  weekly(){
    const {weeklyRoutine}=AppState.get();
    const ORD=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const sorted=[...weeklyRoutine].sort((a,b)=>ORD.indexOf(a.day)-ORD.indexOf(b.day));
    const tb=document.getElementById('weeklyTable');
    tb.innerHTML=sorted.length
      ?sorted.map(w=>`<tr>
        <td style="font-weight:500;white-space:nowrap">${esc(w.day)}</td>
        <td style="color:var(--text-3)">${esc(w.time||'—')}</td>
        <td>${esc(w.activity)}</td>
        <td style="color:var(--text-3)">${w.duration?w.duration+'m':'—'}</td>
        <td><button class="rbtn${w.done?' pill pill--done':''}" onclick="Weekly.toggle(${w.id})" style="border:none">${w.done?'✓':'○'}</button></td>
        <td><button class="rbtn rbtn--del" onclick="Weekly.delete(${w.id})">✕</button></td>
      </tr>`).join('')
      :'<tr><td colspan="6" class="t-empty">No activities yet</td></tr>';
  },

  all(){this.dashboard();this.goals();this.languages();this.certs();this.habits();this.weekly();}
};

/* ── CONTROLLERS ── */
const Goals={
  init(){
    document.getElementById('openGoalModalBtn')?.addEventListener('click',()=>Modal.open('goalModal'));
    document.getElementById('saveGoalBtn')?.addEventListener('click',()=>this.save());
    document.getElementById('updateGoalBtn')?.addEventListener('click',()=>this.update());
  },
  save(){
    const name=Vld.req('goalName','Name'),cat=Vld.req('goalCategory','Category');if(!name||!cat)return;
    const progress=Math.min(100,Math.max(0,+document.getElementById('goalProgress').value||0));
    const milestone=document.getElementById('goalMilestone').value.trim();
    AppState.update(s=>s.goals.push({id:Date.now(),name,category:cat,progress,milestone,createdAt:new Date().toISOString()}));
    Modal.close('goalModal');
    ['goalName','goalProgress','goalMilestone'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('goalCategory').value='';
    if(progress===100){Confetti.launch();Toast.success('Goal completed.');}else Toast.success('Goal added.');
    Render.goals();Render.dashboard();
  },
  openEdit(id){
    const g=AppState.get().goals.find(g=>g.id===id);if(!g)return;
    document.getElementById('editGoalId').value=id;
    document.getElementById('editGoalName').value=g.name;
    document.getElementById('editGoalProgress').value=g.progress;
    Modal.open('editGoalModal');
  },
  update(){
    const id=+document.getElementById('editGoalId').value;
    const name=document.getElementById('editGoalName').value.trim();
    const progress=Math.min(100,Math.max(0,+document.getElementById('editGoalProgress').value||0));
    if(!name)return Toast.error('Name is required.');
    AppState.update(s=>{const g=s.goals.find(g=>g.id===id);if(g){g.name=name;g.progress=progress;}});
    Modal.close('editGoalModal');
    if(progress===100){Confetti.launch();Toast.success('Goal completed.');}else Toast.success('Saved.');
    Render.goals();Render.dashboard();
  },
  delete(id){
    if(!confirm('Delete this goal?'))return;
    AppState.update(s=>s.goals=s.goals.filter(g=>g.id!==id));
    Toast.info('Deleted.');Render.goals();Render.dashboard();
  }
};

const Languages={
  init(){
    document.getElementById('openLangModalBtn')?.addEventListener('click',()=>Modal.open('languageModal'));
    document.getElementById('saveLangBtn')?.addEventListener('click',()=>this.save());
  },
  save(){
    const name=Vld.req('langName','Language'),level=Vld.req('langLevel','Level');if(!name||!level)return;
    const status=document.getElementById('langStatus').value;
    const hours=Math.max(0,+document.getElementById('langHours').value||0);
    if(status==='active'&&AppState.get().languages.filter(l=>l.status==='active').length>=2)
      return Toast.warning('Max 2 active languages — set one to maintenance first.');
    AppState.update(s=>s.languages.push({id:Date.now(),name,status,level,hours,createdAt:new Date().toISOString()}));
    Modal.close('languageModal');
    ['langName','langHours'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('langStatus').value='active';document.getElementById('langLevel').value='';
    Toast.success(`${name} added.`);Render.languages();Render.dashboard();
  },
  delete(id){
    AppState.update(s=>s.languages=s.languages.filter(l=>l.id!==id));
    Toast.info('Removed.');Render.languages();Render.dashboard();
  }
};

const Certs={
  init(){
    document.getElementById('openCertModalBtn')?.addEventListener('click',()=>Modal.open('certModal'));
    document.getElementById('saveCertBtn')?.addEventListener('click',()=>this.save());
    document.querySelectorAll('.src-tab').forEach(b=>b.addEventListener('click',()=>{
      document.querySelectorAll('.src-tab').forEach(x=>x.classList.remove('src-tab--on'));
      b.classList.add('src-tab--on');
      const preset=b.dataset.source==='preset';
      document.getElementById('certPresetWrap').classList.toggle('gone',!preset);
      document.getElementById('certCustomWrap').classList.toggle('gone',preset);
    }));
    document.getElementById('certHasHours')?.addEventListener('change',function(){
      document.getElementById('certHoursWrap').classList.toggle('gone',!this.checked);
    });
  },
  save(){
    const isP=document.querySelector('.src-tab[data-source="preset"]').classList.contains('src-tab--on');
    let name;
    if(isP){name=(document.getElementById('certNameSelect').value||'').trim();if(!name)return Vld.err('certName','Select a certification');}
    else{name=(document.getElementById('certNameCustom').value||'').trim();if(!name)return Vld.err('certName','Name required');}
    Vld.ok('certName');
    const desc=document.getElementById('certDescription').value.trim();
    const hasH=document.getElementById('certHasHours').checked;
    const hours=hasH?Math.max(0,+document.getElementById('certHours').value||0):0;
    const estHours=hasH?Math.max(1,+document.getElementById('certEstHours').value||0):0;
    AppState.update(s=>s.certifications.push({id:Date.now(),name,description:desc,hours,estHours,createdAt:new Date().toISOString()}));
    Modal.close('certModal');
    ['certNameSelect','certNameCustom','certDescription','certHours','certEstHours'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    document.getElementById('certHasHours').checked=false;
    document.getElementById('certHoursWrap').classList.add('gone');
    document.getElementById('certCustomWrap').classList.add('gone');
    document.getElementById('certPresetWrap').classList.remove('gone');
    document.querySelectorAll('.src-tab').forEach((b,i)=>b.classList.toggle('src-tab--on',i===0));
    Toast.success('Certification added.');Render.certs();Render.dashboard();
  },
  delete(id){
    AppState.update(s=>s.certifications=s.certifications.filter(c=>c.id!==id));
    Toast.info('Removed.');Render.certs();Render.dashboard();
  },
  toggle(id){
    const body=document.getElementById(`cbody-${id}`),chev=document.getElementById(`chev-${id}`);
    if(!body)return;
    const open=body.classList.contains('open');
    document.querySelectorAll('.cert-body.open').forEach(b=>b.classList.remove('open'));
    document.querySelectorAll('.cert-chev.open').forEach(c=>c.classList.remove('open'));
    if(!open){body.classList.add('open');if(chev)chev.classList.add('open');}
  }
};

const Habits={
  init(){
    document.getElementById('openHabitModalBtn')?.addEventListener('click',()=>Modal.open('habitModal'));
    document.getElementById('saveHabitBtn')?.addEventListener('click',()=>this.save());
  },
  save(){
    const name=Vld.req('habitName','Habit'),cat=Vld.req('habitCategory','Category');if(!name||!cat)return;
    const target=Math.max(1,+document.getElementById('habitTarget').value||30);
    AppState.update(s=>s.habits.push({id:Date.now(),name,category:cat,target,completed:false,streak:0,lastCompleted:null,createdAt:new Date().toISOString()}));
    Modal.close('habitModal');
    ['habitName','habitTarget'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('habitCategory').value='';
    Toast.success('Habit added.');Render.habits();Render.dashboard();
  },
  complete(id){
    AppState.update(s=>{const h=s.habits.find(h=>h.id===id);if(h)Streaks.complete(h);});
    const h=AppState.get().habits.find(h=>h.id===id);
    if(h?.streak>=7){Confetti.launch();Toast.success(`${h.streak}-day streak.`);}else Toast.success('Done.');
    Render.habits();Render.dashboard();
  },
  delete(id){
    AppState.update(s=>s.habits=s.habits.filter(h=>h.id!==id));
    Toast.info('Removed.');Render.habits();Render.dashboard();
  }
};

const Weekly={
  init(){
    document.getElementById('openWeeklyModalBtn')?.addEventListener('click',()=>Modal.open('weeklyModal'));
    document.getElementById('saveWeeklyBtn')?.addEventListener('click',()=>this.save());
  },
  save(){
    const day=Vld.req('weeklyDay','Day'),activity=Vld.req('weeklyActivity','Activity');if(!day||!activity)return;
    const time=document.getElementById('weeklyTime').value.trim();
    const duration=Math.max(0,+document.getElementById('weeklyDuration').value||0);
    AppState.update(s=>s.weeklyRoutine.push({id:Date.now(),day,time,activity,duration,done:false}));
    Modal.close('weeklyModal');
    ['weeklyDay','weeklyTime','weeklyActivity','weeklyDuration'].forEach(id=>document.getElementById(id).value='');
    Toast.success('Activity added.');Render.weekly();
  },
  toggle(id){AppState.update(s=>{const w=s.weeklyRoutine.find(w=>w.id===id);if(w)w.done=!w.done;});Render.weekly();},
  delete(id){AppState.update(s=>s.weeklyRoutine=s.weeklyRoutine.filter(w=>w.id!==id));Toast.info('Removed.');Render.weekly();}
};

const Exporter={init(){
  document.getElementById('exportBtn')?.addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify(AppState.get(),null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='tracker-backup.json';a.click();URL.revokeObjectURL(url);
    Toast.success('Exported.');
  });
}};

/* ── INIT ── */
async function init(){
  await AppState.load();
  Router.init(); Modal.init(); Exporter.init();
  Goals.init(); Languages.init(); Certs.init(); Habits.init(); Weekly.init();
  applyGreeting();
  Render.all();
  revealStagger(document.getElementById('dashboard'));
  setTimeout(()=>document.getElementById('loader')?.classList.add('gone'),750);
}
document.addEventListener('DOMContentLoaded',init);
