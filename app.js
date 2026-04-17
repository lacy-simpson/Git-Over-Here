const SECTIONS=[
  {title:"Intro",min:5},
  {title:"Core Concepts: How Git Works",min:12},
  {title:"Git - Local Repo",min:15},
  {title:"Git - Remote Repo",min:20},
  {title:"Git Collaboration",min:12},
  {title:"⚔ Boss Battle",min:30},
  {title:"Useful Tips & Best Practices",min:10},
  {title:"Recap",min:12},
];
const LESSON_ORDER=['s1','s2','s3','s4','s5','s7','s6','s8'];
const LESSON_FILES=[
  'lessons/01-intro.html',
  'lessons/02-core-concepts.html',
  'lessons/03-local-repo.html',
  'lessons/04-remote-repo.html',
  'lessons/05-git-collaboration.html',
  'lessons/06-boss-battle.html',
  'lessons/07-useful-tips-best-practices.html',
  'lessons/08-recap.html',
];
const WORKSHOP_TOTAL_LABEL='~90 min';
let cur=0,secs=SECTIONS[0].min*60,running=false,tInterval=null,sessionElapsed=0;

async function loadLessonsIfNeeded(){
  if(document.querySelector('.lesson'))return;

  const modalDefs=document.getElementById('modal-defs');
  const viewport=document.getElementById('viewport');
  if(!viewport)return;

  try{
    const lessons=await Promise.all(
      LESSON_FILES.map(path=>
        fetch(path).then(res=>{
          if(!res.ok)throw new Error(`Failed to load ${path}`);
          return res.text();
        })
      )
    );
    const markup=lessons.join('\n\n');
    if(modalDefs){
      modalDefs.insertAdjacentHTML('beforebegin',markup+'\n');
    }else{
      viewport.insertAdjacentHTML('beforeend',markup+'\n');
    }
  }catch(error){
    viewport.insertAdjacentHTML(
      'afterbegin',
      '<div class="callout warn" style="margin:24px"><span class="callout-icon">!</span><div class="callout-body"><strong>Lesson content failed to load.</strong> Start the local server from the project root with <code>python3 -m http.server 8000</code>, then open <code>http://localhost:8000/main_shell.html</code> in your browser.</div></div>'
    );
    throw error;
  }
}

function goTo(idx){
  if(idx<0||idx>=SECTIONS.length)return;
  stopTimer();
  document.getElementById(LESSON_ORDER[cur]).classList.remove('active');
  cur=idx;
  document.getElementById(LESSON_ORDER[cur]).classList.add('active');
  document.getElementById('viewport').scrollTo({top:0,behavior:'smooth'});
  resetTimer(true);syncUI();
  if(window.innerWidth<900)closeSidebar();
}
function go(dir){goTo(cur+dir)}
window.goTo=goTo;
window.go=go;
function syncUI(){
  const n=SECTIONS.length;
  document.getElementById('pBar').style.width=((cur+1)/n*100)+'%';
  document.getElementById('pCount').textContent=(cur+1)+' / '+n;
  document.getElementById('secName').textContent=SECTIONS[cur].title;
  document.getElementById('prevBtn').disabled=cur===0;
  const nb=document.getElementById('nextBtn');
  nb.disabled=cur===n-1;
  nb.textContent=cur===n-1?'Done ✓':'Next →';
  document.querySelectorAll('.sb-item').forEach((item,i)=>{
    item.classList.toggle('active',i===cur);
    if(i<=cur)item.classList.add('visited');
  });
}
function updatePlayIcon(){
  const icon=document.getElementById('playIcon');
  icon.innerHTML=running
    ? '<rect x="3" y="2" width="4" height="12"/><rect x="9" y="2" width="4" height="12"/>'
    : '<path d="M5 3.5l8 4.5-8 4.5V3.5z"/>';
}
function stopTimer(){
  running=false;
  clearInterval(tInterval);
  tInterval=null;
  updatePlayIcon();
}
function startTimer(){
  if(running)return;
  running=true;
  updatePlayIcon();
  clearInterval(tInterval);
  tInterval=setInterval(()=>{
    if(secs>0){
      secs--;
      sessionElapsed++;
      renderTimer();
      renderSession();
    }
    if(secs<=0)stopTimer();
  },1000);
}
function resetTimer(autoStart=running){
  stopTimer();
  secs=SECTIONS[cur].min*60;
  renderTimer();
  if(autoStart)startTimer();
}
function toggleTimer(){
  if(running){
    stopTimer();
  }else{
    startTimer();
  }
}
window.toggleTimer=toggleTimer;
window.resetTimer=resetTimer;
function renderTimer(){
  const m=Math.floor(secs/60),s=secs%60;
  const el=document.getElementById('timerEl');
  el.textContent=m+':'+String(s).padStart(2,'0');
  el.className='timer-time'+(secs<=60?' danger':secs<=180?' warn':'');
}
function renderSession(){
  const m=Math.floor(sessionElapsed/60),s=sessionElapsed%60;
  document.getElementById('sessionEl').textContent=m+':'+String(s).padStart(2,'0')+' / '+WORKSHOP_TOTAL_LABEL;
}
function toggleSidebar(){
  const next=document.documentElement.getAttribute('data-sidebar')==='open'?'closed':'open';
  document.documentElement.setAttribute('data-sidebar',next);
  localStorage.setItem('git-guide-sidebar',next);
}
function closeSidebar(){
  document.documentElement.setAttribute('data-sidebar','closed');
  localStorage.setItem('git-guide-sidebar','closed');
}
function toggleTheme(){
  const t=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  document.documentElement.setAttribute('data-theme',t);
  localStorage.setItem('git-guide-theme',t);
}
window.toggleSidebar=toggleSidebar;
window.closeSidebar=closeSidebar;
window.toggleTheme=toggleTheme;

/* ── COPY BUTTONS ────────────────────────────────────────── */
document.addEventListener('click',e=>{
  const btn=e.target.closest('.copy-btn');
  if(btn){
    const text=btn.dataset.copy||'';
    (navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject())
    .then(()=>{
      btn.classList.add('ok');btn.innerHTML='<svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/></svg>Copied!';
      setTimeout(()=>{btn.classList.remove('ok');btn.innerHTML='<svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><path d="M4 4v8h8V4H4zm-1-1h10v10H3V3zM1 1h10v1H2v9H1V1z"/></svg>Copy'},2000);
    }).catch(()=>{const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;opacity:0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta)});
  }
});

/* ── LEARN MORE MODALS ───────────────────────────────────── */
const modalOverlay=document.getElementById('modalOverlay');
const modalBox=document.getElementById('modalBox');
function openModal(id){
  const def=document.getElementById('modal-'+id);
  if(!def)return;
  modalBox.innerHTML='<button class="modal-close" onclick="closeModal()">✕</button>'+def.innerHTML;
  modalOverlay.classList.add('open');
}
function closeModal(){modalOverlay.classList.remove('open')}
function handleModalClick(e){if(e.target===modalOverlay)closeModal()}
window.openModal=openModal;
window.closeModal=closeModal;
window.handleModalClick=handleModalClick;
document.addEventListener('click',e=>{
  const modalClose=e.target.closest('.modal-close');
  if(modalClose){closeModal();return;}
  const btn=e.target.closest('.learn-more-btn');
  if(btn){openModal(btn.dataset.modal);return;}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

/* ── STORY QUIZZES ───────────────────────────────────────── */
document.addEventListener('click',e=>{
  const storyOpt=e.target.closest('.story-opt');
  if(storyOpt){selectStoryOption(storyOpt);return;}
  const resetBtn=e.target.closest('.story-reset');
  if(resetBtn){resetStoryQuiz(resetBtn.closest('[data-story-quiz]'));return;}
  const backBtn=e.target.closest('.story-back');
  if(backBtn){retreatStoryQuiz(backBtn);return;}
  const nextBtn=e.target.closest('.story-next');
  if(nextBtn){advanceStoryQuiz(nextBtn);return;}
  const opt=e.target.closest('.kc-opt');
  if(!opt||opt.closest('.story-quiz'))return;
  selectKnowledgeCheck(opt);
});
document.addEventListener('keydown',e=>{
  const storyOpt=e.target.closest('.story-opt');
  if(storyOpt&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectStoryOption(storyOpt);return;}
  const storyBtn=e.target.closest('.story-reset,.story-back,.story-next');
  if(storyBtn&&(e.key==='Enter'||e.key===' ')){e.preventDefault();storyBtn.click();return;}
  const opt=e.target.closest('.kc-opt');
  if(!opt||opt.closest('.story-quiz'))return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();selectKnowledgeCheck(opt);}
});
function initStoryQuizzes(){
  document.querySelectorAll('[data-story-quiz]').forEach(quiz=>{
    const totalEl=quiz.querySelector('[data-story-total]');
    const steps=[...quiz.querySelectorAll('.story-step')];
    if(totalEl)totalEl.textContent=String(steps.length);
    resetStoryQuiz(quiz);
  });
}
function setActiveStoryStep(quiz,idx){
  const steps=[...quiz.querySelectorAll('.story-step')];
  steps.forEach((step,i)=>{
    step.classList.toggle('active',i===idx);
    const backBtn=step.querySelector('.story-back');
    if(backBtn)backBtn.disabled=i===0;
    const nextBtn=step.querySelector('.story-next');
    if(nextBtn)nextBtn.disabled=step.dataset.answered!=='true';
  });
  const cur=quiz.querySelector('[data-story-current]');
  if(cur)cur.textContent=String(idx+1);
  const comp=quiz.querySelector('.story-complete');
  if(comp)comp.classList.remove('show');
  quiz.dataset.storyComplete='false';
}
function resetStoryQuiz(quiz){
  if(!quiz)return;
  const steps=[...quiz.querySelectorAll('.story-step')];
  steps.forEach((s,i)=>{
    s.classList.toggle('active',i===0);
    s.dataset.answered='false';
    s.querySelectorAll('.kc-opt').forEach(o=>{o.className='kc-opt story-opt';o.removeAttribute('disabled')});
    const fb=s.querySelector('.kc-feedback');if(fb){fb.className='kc-feedback';fb.innerHTML=''}
    const nb=s.querySelector('.story-next');if(nb)nb.disabled=true;
    const bb=s.querySelector('.story-back');if(bb)bb.disabled=i===0;
  });
  quiz.dataset.storyComplete='false';
  const cur=quiz.querySelector('[data-story-current]');if(cur)cur.textContent='1';
  const comp=quiz.querySelector('.story-complete');if(comp)comp.classList.remove('show');
}
function selectStoryOption(opt){
  const step=opt.closest('.story-step');
  const opts=step.querySelectorAll('.kc-opt');
  const correct=parseInt(step.querySelector('.kc-opts').dataset.correct);
  const idx=parseInt(opt.dataset.idx);
  const fb=step.querySelector('.kc-feedback');
  opts.forEach((o,i)=>{
    if(i===correct)o.classList.add('correct');
    else if(i===idx&&i!==correct)o.classList.add('wrong');
    else o.classList.add('dim-out');
    o.disabled=true;
  });
  if(fb){
    fb.innerHTML='<strong>'+(idx===correct?'Correct!':'Not quite.')+'</strong> '+opt.dataset.feedback;
    fb.className='kc-feedback show '+(idx===correct?'good':'bad');
  }
  step.dataset.answered='true';
  const nb=step.querySelector('.story-next');if(nb)nb.disabled=false;
}
function advanceStoryQuiz(btn){
  const quiz=btn.closest('[data-story-quiz]');
  const steps=[...quiz.querySelectorAll('.story-step')];
  const currentStep=btn.closest('.story-step');
  const idx=steps.indexOf(currentStep);
  if(idx<steps.length-1){
    setActiveStoryStep(quiz,idx+1);
  }else{
    const comp=quiz.querySelector('.story-complete');if(comp)comp.classList.add('show');
    quiz.dataset.storyComplete='true';
  }
}
function retreatStoryQuiz(btn){
  const quiz=btn.closest('[data-story-quiz]');
  const steps=[...quiz.querySelectorAll('.story-step')];
  const currentStep=btn.closest('.story-step');
  const idx=steps.indexOf(currentStep);
  if(idx>0)setActiveStoryStep(quiz,idx-1);
}
function selectKnowledgeCheck(opt){
  const block=opt.closest('.kc-q-block');
  const opts=block.querySelectorAll('.kc-opt');
  const correct=parseInt(block.querySelector('.kc-opts').dataset.correct);
  const idx=parseInt(opt.dataset.idx);
  const fb=block.querySelector('.kc-feedback');
  opts.forEach((o,i)=>{
    if(i===correct)o.classList.add('correct');
    else if(i===idx&&i!==correct)o.classList.add('wrong');
    else o.classList.add('dim-out');
    o.disabled=true;
  });
  if(fb){
    fb.innerHTML='<strong>'+(idx===correct?'Correct!':'Not quite.')+'</strong> '+opt.dataset.feedback;
    fb.className='kc-feedback show '+(idx===correct?'good':'bad');
  }
}
function applyLessonHeaderNumbers(){
  document.querySelectorAll('.lh-num').forEach(el=>{
    const band=el.closest('.lesson-header-band');
    if(band)band.setAttribute('data-lesson-num',el.textContent.trim());
  });
}

function bindControls(){
  document.querySelectorAll('.sb-item').forEach(item=>{
    item.addEventListener('click',()=>{
      const idx=Number(item.dataset.idx);
      if(Number.isFinite(idx))goTo(idx);
    });
  });

  document.getElementById('sbCloseBtn')?.addEventListener('click',toggleSidebar);
  document.getElementById('sbBackdrop')?.addEventListener('click',closeSidebar);
  document.getElementById('tbToggleBtn')?.addEventListener('click',toggleSidebar);
  document.getElementById('playBtn')?.addEventListener('click',toggleTimer);
  document.getElementById('resetTimerBtn')?.addEventListener('click',()=>resetTimer());
  document.getElementById('themeToggleBtn')?.addEventListener('click',toggleTheme);
  document.getElementById('prevBtn')?.addEventListener('click',()=>go(-1));
  document.getElementById('nextBtn')?.addEventListener('click',()=>go(1));
  modalOverlay?.addEventListener('click',handleModalClick);
}

async function initApp(){
  await loadLessonsIfNeeded();
  bindControls();
  syncUI();
  renderTimer();
  renderSession();
  startTimer();
  initStoryQuizzes();
  applyLessonHeaderNumbers();
}

initApp().catch(error=>console.error(error));
