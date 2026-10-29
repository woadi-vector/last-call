export const DEMO_CONTENT = [
  {id:1,theme:'After Hours in Orbit',clue:'A small window. A very big universe.',title:'Orbital Drift',file:'orbit.mp4',duration:18,rights:'Original procedural animation created for Last Call. Silent demo segment.'},
  {id:2,theme:'Below the Surface',clue:'Something glows where the light runs out.',title:'Deep Blue Signals',file:'ocean.mp4',duration:18,rights:'Original procedural animation created for Last Call. Silent demo segment.'},
  {id:3,theme:'One More Quarter',clue:'Follow the lights back to the arcade.',title:'Neon Grid',file:'arcade.mp4',duration:18,rights:'Original procedural animation created for Last Call. Silent demo segment.'},
];

export class Finale {
  constructor(game,{content=DEMO_CONTENT,now=Date.now}={}) {
    this.game=game; this.content=content; this.now=now; this.revision=0; this.reset();
  }
  reset() {
    this.phase='preparing'; this.revealed=0;
    this.approved=new Set(); this.removed=new Set(); this.ballots=new Map();
    this.selected=null; this.candidates=[]; this.position=0; this.startedAt=null;
    this.error=null; this.revision++;
  }
  item(id) { return this.content.find(item=>item.id===id); }
  tally() { return this.content.map(item=>({id:item.id,votes:[...this.ballots.values()].filter(id=>id===item.id).length})); }
  elapsed() { return this.position+(this.phase==='playing' ? Math.max(0,this.now()-this.startedAt) : 0); }
  tick() {
    if (this.phase==='playing' && this.elapsed()>=this.item(this.selected).duration*1000) { this.phase='ended'; this.startedAt=null; this.position=0; }
  }
  approve(id) {
    if (this.phase!=='preparing' || !this.item(id) || this.removed.has(id)) throw new Error('This segment cannot be approved now.');
    this.approved.add(id);
  }
  remove(id) {
    if (!this.item(id)) throw new Error('Unknown door.');
    this.approved.delete(id); this.removed.add(id);
    for (const [viewer,door] of this.ballots) if (door===id) {
      this.game.refundTab(viewer); this.ballots.delete(viewer);
    }
    if (this.phase!=='preparing') { this.phase='stopped'; this.selected=null; this.startedAt=null; this.position=0; this.revision++; }
  }
  vote(viewer,text) {
    this.tick();
    const match=/^\s*!door\s+([1-3])\s*$/i.exec(String(text));
    if (!match || this.phase!=='voting' || this.ballots.has(viewer)) return false;
    const id=Number(match[1]);
    if (id>this.revealed || !this.approved.has(id) || this.removed.has(id) || !this.game.spendTab(viewer)) return false;
    this.ballots.set(viewer,id);
    return true;
  }
  act(action,id) {
    this.tick();
    if (action==='remove') { this.remove(id); return; }
    if (action==='stop') { this.phase='stopped'; this.startedAt=null; this.position=0; this.revision++; return; }
    if (action==='end' || action==='skip') { this.phase='ended'; this.startedAt=null; this.position=0; this.revision++; return; }
    if (action==='reveal-door' && this.phase==='preparing' && this.revealed<3) { this.revealed++; return; }
    if (action==='open-vote' && this.phase==='preparing' && this.revealed===3 && this.approved.size===3 && this.removed.size===0 && ['stopped','finished'].includes(this.game.phase)) { this.phase='voting'; return; }
    if (action==='close-vote' && this.phase==='voting') {
      const tally=this.tally(); const max=Math.max(...tally.map(door=>door.votes));
      this.candidates=tally.filter(door=>door.votes===max).map(door=>door.id);
      if(this.candidates.length===1) { this.selected=this.candidates[0]; this.phase='ready'; }
      else this.phase='choice';
      return;
    }
    if (action==='choose' && this.phase==='choice' && this.candidates.includes(id) && this.approved.has(id) && !this.removed.has(id)) { this.selected=id; this.phase='ready'; return; }
    if (action==='play' && this.phase==='ready' && this.approved.has(this.selected) && !this.removed.has(this.selected)) { this.phase='playing'; this.position=0; this.startedAt=this.now(); this.revision++; return; }
    if (action==='pause' && this.phase==='playing') { this.position=this.elapsed(); this.phase='paused'; this.startedAt=null; return; }
    if (action==='resume' && this.phase==='paused' && this.approved.has(this.selected)) { this.phase='playing'; this.startedAt=this.now(); this.error=null; return; }
    if (action==='playback-error' && this.phase==='playing') { this.position=this.elapsed(); this.phase='paused'; this.startedAt=null; this.error='The television could not play this segment. Retry with Resume, or skip/end the show.'; return; }
    throw new Error('That finale control is unavailable. Approve the content, reveal three doors, and finish or stop trivia before voting.');
  }
  activeItem() {
    this.tick();
    return ['playing','paused'].includes(this.phase) && this.approved.has(this.selected) && !this.removed.has(this.selected) ? this.item(this.selected) : null;
  }
  snapshot() {
    this.tick();
    const tally=this.tally();
    const result={phase:this.phase,revealed:this.revealed,revision:this.revision,selected:this.selected,candidates:this.candidates,error:this.error,
      doors:this.content.map(item=>({id:item.id,revealed:item.id<=this.revealed,approved:this.approved.has(item.id),removed:this.removed.has(item.id),votes:tally.find(door=>door.id===item.id).votes,...(item.id<=this.revealed ? {theme:item.theme,clue:item.clue} : {})})),
      ballotCount:this.ballots.size,canOpen:this.revealed===3 && this.approved.size===3 && this.removed.size===0 && ['stopped','finished'].includes(this.game.phase)};
    const active=this.activeItem();
    if(active) result.playback={title:active.title,duration:active.duration,elapsedMs:Math.min(this.elapsed(),active.duration*1000),revision:this.revision};
    return result;
  }
  curatorSnapshot() { return {phase:this.phase,items:this.content.map(item=>({id:item.id,theme:item.theme,title:item.title,rights:item.rights,duration:item.duration,approved:this.approved.has(item.id),removed:this.removed.has(item.id)}))}; }
}
