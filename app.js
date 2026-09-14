const topics=[['General health & safety','⚖️'],['Manual handling','📦'],['Reporting accidents','📝'],['PPE at work','🦺'],['Health & hygiene','🫁'],['Fire & emergency','🧯'],['Work at height','🪜'],['Work equipment','🛠️'],['Special site hazards','⚠️'],['Electrotechnical','⚡'],['Environmental','🌿']];
const summaries=[
'Know your duties, risk assessment and site rules.','Plan the lift, use aids and protect your back.','Accident books, RIDDOR and learning from events.','Choose, wear and check protective equipment.','Asbestos, noise, welfare and occupational health.','Evacuate, respond and prevent fire spread.','Ladders, platforms and fall prevention.','Guards, defects and safe working loads.','Confined spaces, excavations and young workers.','Electrical safety and safe isolation.','Waste, dust, spills and sustainability.'
];
const defaultState={done:[],answers:0,correct:0,seen:[],missed:[],streak:0};
let state={...defaultState,...JSON.parse(localStorage.getItem('ecsReadyV3')||'{}')};
let view='home',qset=[],qi=0,chosen=null,quizCorrect=0,quizMode='fresh',quizTopic=0,cardIndex=0,cardFlip=false;
const $=s=>document.querySelector(s);
const pct=(n,d)=>d?Math.round(n/d*100):0;
function save(){localStorage.setItem('ecsReadyV3',JSON.stringify(state));$('#streak').textContent=state.streak||0}
function out(s){$('#app').innerHTML=s;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===view));save()}
function nav(v){view=v;chosen=null;if(v==='quiz')startQuiz('fresh',10);else render();window.scrollTo({top:0,behavior:'smooth'})}
function render(){if(view==='home')home();else if(view==='learn')learn();else if(view==='cards')cards();else if(view==='progress')progressView();else home()}
function accuracy(){return pct(state.correct,state.answers)}
function freshLeft(topic=0){return questionBank.filter(q=>(!topic||q.topic===topic)&&!state.seen.includes(q.id)).length}
function home(){
let left=freshLeft();
out('<span class="chip">COMPLETE ECS QUESTION BANK</span><h1>Revise smarter. Recall more.</h1><p class="sub">'+questionBank.length+' questions from your guide, with no-repeat practice until you complete the cycle.</p>'+
'<section class="hero"><span class="chip">FRESH-QUESTION SPRINT</span><h2>'+ (left?'Your next unseen questions':'You have seen every question!')+'</h2><p>'+ (left?left+' guide questions remain unseen. Fresh mode never repeats a completed question.':'Use review mode to master missed answers, or reset the cycle when ready.')+'</p><button class="button" onclick="startQuiz(\'fresh\',10)">Start 10 fresh questions</button></section>'+
'<div class="section-head"><h2>Study modes</h2></div><div class="grid topics">'+
'<button class="topic" onclick="startQuiz(\'fresh\',10)"><span class="icon">✨</span><h3>Fresh questions</h3><small>Never-seen questions only</small></button>'+
'<button class="topic" onclick="startQuiz(\'review\',10)"><span class="icon">🎯</span><h3>Review misses</h3><small>'+state.missed.length+' waiting to practise</small></button>'+
'<button class="topic" onclick="startQuiz(\'all\',25)"><span class="icon">⏱️</span><h3>Practice test</h3><small>25 mixed guide questions</small></button></div>'+
'<div class="section-head"><h2>Your progress</h2><button class="linkbtn" onclick="nav(\'progress\')">Details</button></div>'+
'<div class="card"><div class="statgrid"><div class="stat"><strong>'+state.seen.length+'/'+questionBank.length+'</strong><small>Seen</small></div><div class="stat"><strong>'+accuracy()+'%</strong><small>Accuracy</small></div><div class="stat"><strong>'+state.missed.length+'</strong><small>To review</small></div></div><div class="bar"><i style="width:'+pct(state.seen.length,questionBank.length)+'%"></i></div></div>');
}
function learn(){
let cards=topics.map((t,i)=>{let all=questionBank.filter(q=>q.topic===i+1),seen=all.filter(q=>state.seen.includes(q.id)).length;return '<button class="topic" onclick="topic('+i+')"><span class="icon">'+t[1]+'</span><h3>'+t[0]+'</h3><small>'+seen+'/'+all.length+' questions seen</small><div class="bar"><i style="width:'+pct(seen,all.length)+'%"></i></div></button>'}).join('');
out('<button class="back" onclick="nav(\'home\')">← Home</button><h1>Learn by topic</h1><p class="sub">Choose an area, get the key idea, then practise its exact guide questions.</p><div class="grid topics">'+cards+'</div>');
}
function topic(i){
let all=questionBank.filter(q=>q.topic===i+1),seen=all.filter(q=>state.seen.includes(q.id)).length;
out('<button class="back" onclick="nav(\'learn\')">← All topics</button><span class="chip">TOPIC '+(i+1)+' OF 11 · '+all.length+' QUESTIONS</span><h1>'+topics[i][0]+'</h1><p class="sub">'+summaries[i]+' '+seen+'/'+all.length+' questions studied.</p>'+
'<article class="lesson"><h3>Learn actively</h3><p>Use fresh mode first. Every question includes the guide explanation after you answer, so wrong answers become a lesson rather than a dead end.</p></article>'+
'<article class="lesson"><h3>Close the loop</h3><p>Missed answers are automatically collected in Review misses until you answer them correctly.</p></article>'+
'<div class="actions"><button class="button" onclick="startQuiz(\'fresh\',10,'+(i+1)+')">10 fresh topic questions</button><button class="button secondary" onclick="startQuiz(\'all\','+all.length+','+(i+1)+')">Practise all '+all.length+'</button><button class="button ghost" onclick="complete('+i+')">'+(state.done.includes(i)?'Marked complete ✓':'Mark lesson complete')+'</button></div>');
}
function flashCards(){return[
['Before you lift','What is the first thing to consider if a load could cause injury?','Whether the load needs to be lifted at all. Remove the manual-handling task where possible.'],
['On hearing a fire alarm','What should you do?','Go promptly to the designated place of safety.'],
['A tool is smoking','An electric drill gives off blue smoke. What is the safe action?','Stop using it and report the defect. Defective electrical tools must not be used.'],
['Electric shock','What is the first priority when a workmate receives an electric shock?','Remove the electrical danger safely, for example by switching off the supply, before helping.'],
['Near a highway','Which PPE feature is especially important?','High visibility. You need to be seen by traffic and plant operators.'],
['Suspected asbestos','What is the key danger?','Breathing fibres. Do not disturb suspect material; follow site controls.'],
['Using a ladder','What must happen before it is used?','The user must inspect it and be satisfied that it is safe.'],
['Oil spill risk','Which controls help stop pollution?','Use containment such as a bund or drip tray to stop oil reaching ground or drains.'],
['After an accident','What record is needed?','Make sure the injury is recorded in the company accident book.'],
['Risk assessment','What is it for?','It identifies what can cause harm and the practical controls needed.']
]}
function cards(){
let data=flashCards(),c=data[cardIndex%data.length];
out('<button class="back" onclick="nav(\'home\')">← Home</button><h1>Scenario flashcards</h1><p class="sub">Think through a realistic situation, say your response out loud, then reveal the answer.</p><article class="card flash" onclick="cardFlip=!cardFlip;cards()">'+
(cardFlip?'<div><span class="chip">BEST RESPONSE</span><div class="answer">'+c[2]+'</div></div>':'<div><span class="chip">'+c[0].toUpperCase()+'</span><div class="term">'+c[1]+'</div></div>')+
'<small class="hint">Tap to '+(cardFlip?'see the situation again':'reveal the response')+'</small></article><div class="controls"><button class="button ghost" onclick="cardIndex=(cardIndex+flashCards().length-1)%flashCards().length;cardFlip=false;cards()">← Previous</button><strong>'+(cardIndex%data.length+1)+' / '+data.length+'</strong><button class="button" onclick="cardIndex=(cardIndex+1)%flashCards().length;cardFlip=false;cards()">Next →</button></div><button class="button secondary" onclick="nav(\'quiz\')">Test your recall</button>');
}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function startQuiz(mode='fresh',count=10,topicNo=0){
quizMode=mode;quizTopic=topicNo;let pool=questionBank.filter(q=>!topicNo||q.topic===topicNo);
if(mode==='fresh')pool=pool.filter(q=>!state.seen.includes(q.id));
if(mode==='review')pool=pool.filter(q=>state.missed.includes(q.id));
if(!pool.length){emptyQuiz(mode,topicNo);return}
qset=shuffle(pool).slice(0,Math.min(count,pool.length));qi=0;chosen=null;quizCorrect=0;view='quiz';quiz();
}
function emptyQuiz(mode,topicNo){
let name=topicNo?topics[topicNo-1][0]:'the full guide',message=mode==='review'?'No incorrect answers are waiting for review.':'You have completed every fresh question in '+name+'.';
out('<button class="back" onclick="nav(\'home\')">← Home</button><section class="card result"><div class="score">✓</div><h1>'+message+'</h1><p class="sub">Choose mixed practice to keep testing your knowledge, or reset the question cycle in Progress when you want to begin again.</p><div class="actions" style="justify-content:center"><button class="button" onclick="startQuiz(\'all\',25,'+topicNo+')">Mixed practice</button><button class="button secondary" onclick="nav(\'progress\')">View progress</button></div></section>');
}
function quiz(){
if(qi>=qset.length){result();return}
let q=qset[qi],opts=q.o.map((o,i)=>'<button class="option '+(chosen!==null?(i===q.a?'good':i===chosen?'bad':''):'')+'" onclick="answer('+i+')"><span class="letter">'+'ABCD'[i]+'</span><span>'+o+'</span></button>').join('');
out('<button class="back" onclick="nav(\'home\')">← Exit quiz</button><div class="chip">'+topics[q.topic-1][0].toUpperCase()+' · '+(qi+1)+' OF '+qset.length+'</div><div class="bar"><i style="width:'+pct(qi,qset.length)+'%"></i></div><article class="question"><h2>'+q.q+'</h2>'+opts+(chosen!==null?'<div class="explain"><b>'+(chosen===q.a?'Correct. ':'Review this one. ')+'</b>'+(q.e||'Check the guide explanation for this answer.')+'</div><div class="actions"><button class="button" onclick="nextQ()">'+(qi===qset.length-1?'See results':'Next question')+'</button></div>':'')+'</article>');
}
function answer(i){
if(chosen!==null)return;chosen=i;let q=qset[qi],right=i===q.a;state.answers++;if(!state.seen.includes(q.id))state.seen.push(q.id);
if(right){state.correct++;quizCorrect++;state.missed=state.missed.filter(id=>id!==q.id)}else if(!state.missed.includes(q.id))state.missed.push(q.id);
state.streak=Math.max(1,state.streak);save();quiz();
}
function nextQ(){qi++;chosen=null;quiz()}
function result(){
let score=pct(quizCorrect,qset.length);
out('<section class="card result"><div class="score">'+quizCorrect+'/'+qset.length+'</div><h1>'+(score>=85?'Excellent recall!':score>=65?'Solid progress.':'Keep building it.')+'</h1><p class="sub">'+score+'% this session. Every missed answer is now available in Review misses.</p><div class="actions" style="justify-content:center"><button class="button" onclick="startQuiz(\'fresh\',10,'+quizTopic+')">Next fresh set</button><button class="button secondary" onclick="startQuiz(\'review\',10,'+quizTopic+')">Review misses</button><button class="button ghost" onclick="nav(\'progress\')">See progress</button></div></section>');
}
function progressView(){
let rows=topics.map((t,i)=>{let all=questionBank.filter(q=>q.topic===i+1),seen=all.filter(q=>state.seen.includes(q.id)).length,miss=all.filter(q=>state.missed.includes(q.id)).length;return '<div class="card today"><div class="round">'+t[1]+'</div><div><h3>'+t[0]+'</h3><small>'+seen+'/'+all.length+' seen · '+miss+' to review</small><div class="bar"><i style="width:'+pct(seen,all.length)+'%"></i></div></div></div>'}).join('');
out('<button class="back" onclick="nav(\'home\')">← Home</button><h1>Your revision progress</h1><p class="sub">Saved privately in this browser only.</p><div class="card"><div class="statgrid"><div class="stat"><strong>'+state.seen.length+'/'+questionBank.length+'</strong><small>Questions seen</small></div><div class="stat"><strong>'+accuracy()+'%</strong><small>Accuracy</small></div><div class="stat"><strong>'+state.missed.length+'</strong><small>Review misses</small></div></div><div class="bar"><i style="width:'+pct(state.seen.length,questionBank.length)+'%"></i></div></div><div class="section-head"><h2>By topic</h2></div><div class="grid">'+rows+'</div><div class="actions"><button class="button" onclick="startQuiz(\'review\',20)">Review all misses</button><button class="button secondary" onclick="resetCycle()">Reset question cycle</button><button class="button ghost" onclick="resetAll()">Erase all progress</button></div>');
}
function complete(i){if(!state.done.includes(i))state.done.push(i);save();topic(i)}
function resetCycle(){if(!confirm('Start a new fresh-question cycle? Your accuracy and review list will stay.'))return;state.seen=[];save();nav('home')}
function resetAll(){if(!confirm('Erase all saved revision progress from this device?'))return;state={...defaultState};save();nav('home')}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>nav(b.dataset.view));
Object.assign(window,{nav,topic,cards,startQuiz,answer,nextQ,complete,resetCycle,resetAll});
window.addEventListener('error',()=>{$('#app').innerHTML='<section class="card result"><h1>Something went wrong.</h1><p class="sub">Refresh the page once. If it continues, clear this site’s data and try again.</p></section>'});
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();
