const fs = require('fs');

const sim = JSON.parse(fs.readFileSync('d:/Downloads/terra-dev-simulation-terra-source-d114d9d3.json', 'utf8'));
console.log('=== FAILURE 2 (Life 639) ===');
console.log(JSON.stringify(sim.failures[1], null, 2));

console.log('\n=== ANALYZING 6 INDIVIDUAL LIFE LOGS ===');
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
  console.log(`\n======================================================`);
  console.log(`File: ${f.split('/').pop()}`);
  console.log(`Person: ${p.name} (${cs.race || '不明'}, ${cs.region || '不明'}, 年齢: ${p.age})`);
  console.log(`Dead: ${p.dead}, Death Cause: ${cs.deathCause || 'なし'}`);
  console.log(`Status: 所持金 ${cs.m}, 健康 ${cs.h}, 精神 ${cs.p}, 知識 ${cs.k}, 人脈 ${cs.rl}, 信用 ${cs.cr}`);
  console.log(`Job: ${cs.job} (ID: ${cs.job}), Rank: ${cs.jobRank}, Career Path: ${cs.careerPath}`);
  console.log(`Spouse:`, cs.spouse ? JSON.stringify(cs.spouse) : 'なし');
  console.log(`Children:`, (cs.children || []).length ? JSON.stringify(cs.children) : 'なし');
  console.log(`Parents:`, (cs.parents || []).map(x => `${x.name}(存命: ${x.alive}, 没年: ${x.deathYear})`));
  console.log(`Siblings:`, (cs.siblings || []).map(x => `${x.name}(存命: ${x.alive}, 没年: ${x.deathYear})`));
  console.log(`Person Ties count:`, Object.keys(d.personTies || {}).length);
  console.log(`Infection: ${cs.inf ? '感染' : '非感染'}, 診断: ${cs.diagnosed ? '済' : '未'}, 潜在: ${cs.latentInfection ? 'あり' : 'なし'}`);
  
  // Last 5 log entries
  const visible = d.visibleLog || [];
  console.log(`Total visible log entries: ${visible.length}`);
  console.log('Last 3 log entries:');
  visible.slice(-3).forEach(v => {
    console.log(`  [${v.year}年 ${v.age}歳] ${v.text?.slice(0, 100)}...`);
  });
}
