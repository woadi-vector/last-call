const overlay = location.pathname === '/overlay';
const demo = location.pathname === '/demo' || (overlay && new URLSearchParams(location.search).get('demo') === '1');
const $ = id => document.getElementById(id);
const text = (id,value) => { if ($(id)) $(id).textContent = value; };
let pending = false;
let state;
let connection;
let reviewRendered = false;
let networkFailed = false;
let rewardSeen;
let rewardTimer;
const phaseNames = {review:'PACK REVIEW',question:'ANSWERS OPEN',paused:'ON A QUICK BREAK',reveal:'THE TAB IS IN',finished:'THAT’S A ROUND',stopped:'TRIVIA STOPPED'};
if ($('demo-banner')) $('demo-banner').hidden = !demo;
if ($('demo-controls')) $('demo-controls').hidden = !demo;
if ($('overlay-link')) $('overlay-link').href = demo ? '/overlay?demo=1' : '/overlay';
if (demo) document.querySelector('.connect')?.setAttribute('hidden','');

function error(message) { $('error').hidden = !message; $('error').textContent = message || ''; }
function render(game) {
  state = game;
  document.body.dataset.phase = game.phase;
  text('pack-title',game.title);
  text('round',game.round ? `ROUND ${game.round} / ${game.rounds}` : 'PRE-SHOW');
  text('phase',game.phase === 'review' && game.approved ? 'PACK APPROVED' : phaseNames[game.phase]);
  text('question',game.phase === 'stopped' ? 'Trivia’s taking a seat.' : game.phase === 'finished' ? 'Good chat. Great company.' : game.question?.prompt || 'A little trivia. A lot of main-character energy.');
  text('hint',game.phase === 'stopped' ? `Answers closed. ${game.totalTabs} earned tabs kept safe for Last Call.` : game.phase === 'review' ? (overlay ? 'Your streamer is getting the next round ready.' : 'Review the questions below, approve the pack, then start the show.') : game.phase === 'question' ? 'Lock your answer in chat. First answer counts.' : game.phase === 'paused' ? 'Stretch break. Answers are paused; your tabs are safe.' : game.phase === 'finished' ? `${game.totalTabs} tabs earned together. Cheers, regulars.` : 'One tab for every correct answer. Ready for another?');
  text('timer',['question','paused'].includes(game.phase) ? game.secondsLeft : '—');
  text('answers',game.answerCount);
  text('total-tabs',game.totalTabs);
  text('goal-label',game.totalTabs >= game.communityGoal ? 'The community tab is covered. Cheers to chat!' : 'Every correct answer adds one to the bar.');
  $('goal').value = Math.min(game.totalTabs,game.communityGoal);
  $('goal').setAttribute('aria-valuenow',Math.min(game.totalTabs,game.communityGoal));
  if ($('goal-fill')) $('goal-fill').style.transform = `scaleX(${Math.min(game.totalTabs/game.communityGoal,1)})`;
  showReward(game);
  const optionNodes = game.phase === 'finished' ? [] : (game.question?.options || []).map((option,index)=> {
    const node = document.createElement('div'); node.className = 'option' + (game.question.answer === index ? ' correct' : '');
    const letter = document.createElement('b'); letter.textContent = String.fromCharCode(65+index);
    const label = document.createElement('span'); label.textContent = option;
    node.append(letter,label); return node;
  });
  $('options').replaceChildren(...optionNodes);
  text('explanation',game.phase !== 'finished' ? game.question?.note || '' : '');
  if ($('leaderboard')) {
    const rows = game.leaderboard.map((player,index) => {
      const row = document.createElement('li');
      const name = document.createElement('span'); name.textContent = `${index+1}. ${player.name}`;
      const tabs = document.createElement('b'); tabs.textContent = `${player.tabs} ${player.tabs === 1 ? 'tab' : 'tabs'}`;
      row.append(name,tabs); return row;
    });
    if (!rows.length) { const row = document.createElement('li'); row.className = 'muted'; row.textContent = 'Your first regular is one answer away.'; rows.push(row); }
    $('leaderboard').replaceChildren(...rows);
  }
  if ($('review') && !reviewRendered && game.review) {
    $('review').replaceChildren(...game.review.map((question,index) => {
      const details = document.createElement('details');
      const summary = document.createElement('summary'); summary.textContent = `${index+1}. ${question.prompt}`;
      const answer = document.createElement('p'); const bold = document.createElement('strong');
      bold.textContent = `${String.fromCharCode(65+question.answer)} · ${question.options[question.answer]}`;
      answer.append(bold,document.createTextNode(` — ${question.note}`));
      details.append(summary,answer); return details;
    }));
    reviewRendered = true;
  }
  const available = {
    approve:game.phase === 'review' && !game.approved,
    start:game.phase === 'review' && game.approved && (demo || connection?.status === 'Chat subscribed'),
    pause:game.phase === 'question',resume:game.phase === 'paused',
    reveal:['question','paused'].includes(game.phase),next:game.phase === 'reveal',stop:['question','paused','reveal'].includes(game.phase),reset:true,
  };
  document.querySelectorAll('[data-action]').forEach(button=>{
    button.disabled = pending || !available[button.dataset.action];
    if (button.dataset.action === 'next') button.textContent = game.round === game.rounds ? 'Finish round →' : 'Next question →';
  });
  document.querySelectorAll('[data-answer]').forEach(button=> { button.disabled = pending || game.phase !== 'question'; });
}
function showReward(game) {
  if (!$('tab-reward')) return;
  const reward = game.reward;
  // Establish a baseline on load. Old awards must not replay on refresh/reconnect.
  if (rewardSeen === undefined) { rewardSeen = reward?.id || 0; return; }
  if (game.phase === 'stopped' || game.phase === 'review') {
    clearTimeout(rewardTimer); $('tab-reward').hidden = true;
  }
  if (!reward || reward.id === rewardSeen) return;
  rewardSeen = reward.id;
  const names = reward.names.join(', ') + (reward.count > reward.names.length ? ` + ${reward.count-reward.names.length} more` : '');
  text('reward-names',names);
  text('reward-label',reward.count === 1 ? '+1 TAB' : `+1 TAB EACH · ${reward.count} REGULARS`);
  const toast = $('tab-reward');
  clearTimeout(rewardTimer);
  toast.hidden = false;
  toast.classList.remove('reward-enter');
  void toast.offsetWidth;
  toast.classList.add('reward-enter');
  rewardTimer = setTimeout(()=>{ toast.hidden = true; },5500);
}
async function request(url,input) {
  const response = await fetch(url,input === undefined ? undefined : {method:'POST',headers:{'Content-Type':'application/json','X-Last-Call':'control'},body:JSON.stringify(input)});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed');
  return result;
}
async function refresh() {
  try {
    const results = await Promise.all([request(demo ? (overlay ? '/api/demo/game' : '/api/demo') : (overlay ? '/api/game' : '/api/producer')), demo ? Promise.resolve(null) : request('/api/status')]);
    connection = results[1];
    if (networkFailed) { error(''); rewardSeen = undefined; }
    networkFailed = false;
    text('connection',demo ? 'Rehearsal · offline' : `${connection.status}${connection.channel ? ` · ${connection.channel}` : ''}`);
    $('connection-dot')?.classList.toggle('connected',connection?.status === 'Chat subscribed');
    render(results[0]);
  } catch { networkFailed = true; error('Connection to the local show was lost. Check that the server is running.'); }
}
document.addEventListener('click',async event=>{
  const button = event.target.closest('button');
  if (!button || button.disabled || pending) return;
  if (button.dataset.action === 'reset' && !confirm('Reset this show? All tabs and approval will be cleared.')) return;
  pending = true;
  if (state) render(state);
  error('');
  try {
    if (button.dataset.action) await request(demo ? '/api/demo/control' : '/api/control',{action:button.dataset.action});
    else if (button.dataset.answer) {
      const result = await request('/api/demo/answer',{viewer:Number($('viewer').value),answer:button.dataset.answer});
      text('demo-result',result.accepted ? 'Answer locked. Reveal to find out how you did.' : 'Answer not accepted: this viewer already answered, or the round closed.');
    }
  } catch (err) { error(err.message); }
  finally { pending = false; await refresh(); }
});
async function poll() { await refresh(); setTimeout(poll,750); }
poll();
