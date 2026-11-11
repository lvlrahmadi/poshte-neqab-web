'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PoshteNeghabEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const isMafia=p=>!!p&&(p.team==='مافیا'||p.converted===true);
  const alive=players=>players.filter(p=>p.alive);
  function investigationTeam(target,{round=1,actions=[]}={}){
    if(!target)return 'نامشخص';
    const framed=actions.some(a=>a.type==='frame'&&a.target===target.id&&a.round===round);
    if(target.status?.deceiverMaskRound===round)return target.status.deceiverMaskTeam||'شهروند';
    if(framed)return 'مافیا';
    if(target.role==='پدرخوانده'||target.role==='نفوذی')return 'شهروند';
    return isMafia(target)?'مافیا':'شهروند';
  }
  function checkWin(game){
    const a=alive(game.players), mafia=a.filter(isMafia).length, nonMafia=a.length-mafia;
    const confirmed=(game.independentWins||[]).map(i=>game.players[i]).filter(p=>p&&p.alive);
    if(confirmed.length)return 'پیروزی مستقل: '+confirmed.map(p=>p.name).join(' و ');
    const killer=a.find(p=>p.role==='جانی');
    if(killer&&a.length===1)return 'پیروزی جانی';
    const deceiver=a.find(p=>p.role==='فریبکار');
    const minRound=Number.isInteger(game.rules?.deceiverRound)?game.rules.deceiverRound:6;
    const maxAlive=Number.isInteger(game.rules?.deceiverAliveLimit)?game.rules.deceiverAliveLimit:4;
    if(deceiver&&game.phase==='روز'&&game.round>=minRound&&a.length<=maxAlive)return 'پیروزی مستقل: فریبکار';
    const opportunist=a.find(p=>p.role==='فرصت‌طلب');
    const opportunistRound=Number.isInteger(game.rules?.opportunistRound)?game.rules.opportunistRound:5;
    const requiredMafia=Number.isInteger(game.rules?.opportunistMafiaEliminations)?game.rules.opportunistMafiaEliminations:2;
    if(opportunist&&game.phase==='روز'&&game.round>=opportunistRound&&(game.mafiaEliminated||0)>=requiredMafia)return 'پیروزی مستقل: فرصت‌طلب';
    // سایر مستقل‌ها تا تعیین شرط اختصاصی‌شان مانع پایان خودکار می‌شوند.
    const unresolvedIndependent=a.some(p=>p.team==='مستقل'&&!['جانی','فریبکار'].includes(p.role));
    if(mafia===0&&!killer&&!unresolvedIndependent)return 'پیروزی شهروندان';
    if(mafia>0&&!killer&&!unresolvedIndependent&&mafia>=nonMafia)return 'پیروزی مافیا';
    return null;
  }
  function resolveNight(players,actions,round){
    const night=actions.filter(a=>a.round===round), aliveIds=new Set(players.filter(p=>p.alive).map(p=>p.id));
    const jammed=new Set(night.filter(a=>a.type==='jam').map(a=>a.target));
    const active=night.filter(a=>!a.actor||!jammed.has(a.actor));
    const doctors=active.filter(a=>a.type==='protect_doctor');
    const guards=active.filter(a=>a.type==='protect_guard');
    const poisoned=new Set(active.filter(a=>a.type==='poison').map(a=>a.target));
    const attacks=active.filter(a=>['mafia_attack','serial_attack','shot'].includes(a.type));
    const deaths=new Map(), events=[];
    for(const attack of attacks){
      if(!aliveIds.has(attack.target))continue;
      let victim=players.find(p=>p.id===attack.target);
      const guard=guards.find(g=>g.target===victim.id);
      if(guard){
        const protector=players.find(p=>p.id===guard.actor);
        if(protector?.alive)victim=protector;
      }
      const saved=doctors.some(d=>d.target===victim.id)&&!poisoned.has(victim.id);
      if(saved){events.push(`حمله به ${victim.name} با نجات پزشک خنثی شد.`);continue;}
      deaths.set(victim.id,attack.type==='mafia_attack'?'شلیک مافیا':attack.type==='serial_attack'?'حمله جانی':'شلیک تک‌تیرانداز');
    }
    return {deaths:[...deaths.entries()].map(([id,reason])=>({id,reason})),events,jammed:[...jammed]};
  }
  return {isMafia,alive,investigationTeam,checkWin,resolveNight};
});
