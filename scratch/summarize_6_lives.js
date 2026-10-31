const fs = require('fs');
const path = require('path');

const files = [
  'd:/Downloads/terra-life-1077-33-terra-source-d114d9d3.json',
  'd:/Downloads/terra-life-1077-41-terra-source-d114d9d3.json',
  'd:/Downloads/terra-life-1077-62-terra-source-d114d9d3.json',
  'd:/Downloads/terra-life-1077-66-terra-source-d114d9d3.json',
  'd:/Downloads/terra-life-1077-80-terra-source-d114d9d3.json',
  'd:/Downloads/terra-life-1077-94-terra-source-d114d9d3.json',
];

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const p = d.person;
  const cs = d.currentState || {};
  const trace = d.trace || [];
  const death = trace.find(t => t.kind === 'death');
  
  console.log(`\n======================================================`);
  console.log(`【${p.name}】(${cs.region} / ${cs.origin || '種族不明'}, 享年 ${p.age}歳, ${p.birthYear}〜${cs.year}年)`);
  console.log(`死因: ${death ? death.id : '不明'} — ${death?.details?.text || ''}`);
  if (death?.details?.causedBy) {
    console.log(`死亡契機: ${death.details.causedBy.kind} [${death.details.causedBy.id}] ${death.details.causedBy.label || ''}`);
  }
  console.log(`最終パラメータ: 所持金 ${Math.round(cs.cash)} (負債 ${Math.round(cs.debt)}), 健康 ${Math.round(cs.health)}, 精神 ${Math.round(cs.mood)}, 知識 ${Math.round(cs.knowledge)}, 人脈 ${Math.round(cs.relations)}`);
  console.log(`感染状態: 感染=${cs.infected}, 診断=${cs.diagnosed}, 結晶負荷=${cs.infectionLoad}`);
  console.log(`職業: ${cs.job}`);
  console.log(`住居: ${cs.home} (${cs.local || ''})`);
  
  // Parents status
  const fa = cs.parents?.fa;
  const mo = cs.parents?.mo;
  console.log(`父: ${fa ? `${fa.name} (享年/現年齢: ${fa.age}, 存命: ${fa.alive}, 没年: ${fa.deathYear || 'なし'}, 死因: ${fa.deathCause || 'なし'})` : 'なし'}`);
  console.log(`母: ${mo ? `${mo.name} (享年/現年齢: ${mo.age}, 存命: ${mo.alive}, 没年: ${mo.deathYear || 'なし'}, 死因: ${mo.deathCause || 'なし'})` : 'なし'}`);
  
  // Romance & Spouse
  console.log(`配偶者: ${cs.spouse ? `${cs.spouse.name} (存命: ${cs.spouse.alive})` : 'なし'}`);
  console.log(`子: ${(cs.children || []).length}人`);
  console.log(`恋愛・関係履歴: ${(cs.relationshipHistory || []).length}件`);
  
  // Choice choices made
  const choices = trace.filter(t => t.kind === 'choice');
  console.log(`人生での選択イベント総数: ${choices.length}件`);
  console.log(`主な選択イベント (抜粋):`);
  choices.slice(-5).forEach(c => {
    console.log(`  [${c.year}年 ${c.age}歳] ${c.id}: ${c.label} -> ${c.outcomeText?.slice(0, 60)}...`);
  });
}
