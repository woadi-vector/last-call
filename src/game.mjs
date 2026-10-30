// Prepared fallback pack. Approval is required each time the show is reset.
export const PACK = {
  title: 'Side Quest: Space Bar',
  description: 'Five quick questions for chat. One correct answer earns one tab.',
  questions: [
    {prompt:'Which planet is known as the Red Planet?', options:['Venus','Mars','Jupiter','Mercury'], answer:1, note:'Iron oxide on the surface gives Mars its reddish color.'},
    {prompt:'In chess, which piece moves in an L shape?', options:['Bishop','Rook','Knight','Queen'], answer:2, note:'The knight moves two squares in one direction and one at a right angle.'},
    {prompt:'What is the name of Mario’s brother?', options:['Luigi','Wario','Yoshi','Toad'], answer:0, note:'Luigi is Mario’s brother and frequent co-star.'},
    {prompt:'Which of these animals is a mammal?', options:['Shark','Octopus','Penguin','Dolphin'], answer:3, note:'Dolphins breathe air and nurse their young.'},
    {prompt:'How many sides does a hexagon have?', options:['Five','Six','Seven','Eight'], answer:1, note:'Hexa means six.'},
  ],
};

export class TriviaGame {
  constructor({now = Date.now, duration = 25_000, pack = PACK} = {}) {
    this.now = now;
    this.duration = duration;
    this.pack = pack;
    this.reset();
  }
  reset() {
    this.rewardSequence = (this.rewardSequence || 0) + 1;
    this.reward = null;
    this.phase = 'review';
    this.index = -1;
    this.approved = false;
    this.deadline = null;
    this.remaining = this.duration;
    this.answers = new Map();
    this.players = new Map();
    this.totalTabs = 0;
  }
  tick() { if (this.phase === 'question' && this.now() >= this.deadline) this.reveal(); }
  configureWindow(seconds) {
    if(this.phase!=='review') throw new Error('Set the answer window before starting trivia.');
    if(![25,45,60].includes(seconds)) throw new Error('Choose a 25, 45 or 60 second answer window.');
    this.duration=seconds*1000;this.remaining=this.duration;
  }
  installPack(pack) {
    if(this.phase!=='review') throw new Error('Reset the show before replacing its trivia pack.');
    this.pack=structuredClone(pack);this.approved=false;this.reward=null;this.index=-1;this.answers.clear();
  }
  openQuestion() {
    this.index++;
    this.answers.clear();
    this.remaining = this.duration;
    this.deadline = this.now() + this.duration;
    this.phase = 'question';
  }
  reveal() {
    if (!['question','paused'].includes(this.phase)) return;
    this.phase = 'reveal';
    this.deadline = null;
    const winners = [];
    for (const [id, entry] of this.answers) {
      if (entry.answer === this.pack.questions[this.index].answer) {
        this.players.get(id).tabs++;
        this.totalTabs++;
        winners.push(this.players.get(id).name);
      }
    }
    this.reward = winners.length ? {id:++this.rewardSequence,at:this.now(),names:winners.slice(0,3),count:winners.length} : null;
  }
  act(action) {
    // Stop preempts lazy deadline processing: an unrevealed round is cancelled.
    if (action === 'stop' && ['question','paused','reveal','stopped'].includes(this.phase)) {
      this.phase = 'stopped';
      this.deadline = null;
      this.remaining = 0;
      this.answers.clear();
      this.reward = null;
      return;
    }
    this.tick();
    if (action === 'reset') { this.reset(); return; }
    if (action === 'approve' && this.phase === 'review') { this.approved = true; return; }
    if (action === 'start' && this.phase === 'review' && this.approved) { this.openQuestion(); return; }
    if (action === 'pause' && this.phase === 'question') {
      this.remaining = Math.max(0, this.deadline - this.now());
      this.deadline = null;
      this.phase = 'paused';
      return;
    }
    if (action === 'resume' && this.phase === 'paused') {
      this.deadline = this.now() + this.remaining;
      this.phase = 'question';
      return;
    }
    if (action === 'reveal' && ['question','paused'].includes(this.phase)) { this.reveal(); return; }
    if (action === 'next' && this.phase === 'reveal') {
      if (this.index + 1 === this.pack.questions.length) this.phase = 'finished';
      else this.openQuestion();
      return;
    }
    throw new Error('That control is unavailable in the current round.');
  }
  answer(id, name, text) {
    this.tick();
    const match = /^\s*!answer\s+([a-d])\s*$/i.exec(String(text));
    if (this.phase !== 'question' || !match || !id || this.answers.has(id)) return false;
    const player = this.players.get(id) || {name:String(name || 'Viewer').slice(0,40), tabs:0};
    this.players.set(id,player);
    this.answers.set(id,{answer:match[1].toUpperCase().charCodeAt(0) - 65});
    return true;
  }
  spendTab(id) {
    const player=this.players.get(id);
    if (!player || player.tabs<1) return false;
    player.tabs--; return true;
  }
  refundTab(id) { const player=this.players.get(id); if(player) player.tabs++; }
  snapshot(producer = false) {
    this.tick();
    const current = this.pack.questions[this.index];
    const showAnswer = ['reveal','finished'].includes(this.phase);
    const state = {
      title:this.pack.title, description:this.pack.description,
      packOrigin:this.pack.origin || 'prepared',
      phase:this.phase, approved:this.approved,
      answerWindowSeconds:this.duration/1000,
      round:Math.max(0,this.index+1), rounds:this.pack.questions.length,
      secondsLeft:Math.ceil((this.phase === 'question' ? Math.max(0,this.deadline-this.now()) : this.phase === 'paused' ? this.remaining : 0)/1000),
      answerCount:this.answers.size, totalTabs:this.totalTabs, communityGoal:10,
      leaderboard:[...this.players.values()].sort((a,b)=>b.tabs-a.tabs || a.name.localeCompare(b.name)).slice(0,8),
      reward:this.reward,
      question:current && this.phase !== 'stopped' ? {prompt:current.prompt,options:current.options,...(showAnswer ? {answer:current.answer,note:current.note} : {})} : null,
    };
    if (producer) state.review = this.pack.questions;
    return state;
  }
}
