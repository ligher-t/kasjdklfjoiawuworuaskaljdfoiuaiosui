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

console.log('=== ANALYZING 6 LIFE LOGS ===');
for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log('File not found:', f);
    continue;
  }
  const raw = fs.readFileSync(f, 'utf8');
  const d = JSON.parse(raw);
  const p = d.person || {};
  const ps = d.personSummary || {};
  const st = d.state || {};
  const logs = d.logs || d.lifeLog || [];
  
  console.log(`\n-----------------------------------------`);
  console.log(`File: ${path.basename(f)}`);
  console.log(`Name: ${p.name}, Age: ${p.age}, Dead: ${p.dead}, BirthYear: ${p.birthYear}`);
  console.log(`Birth: ${ps.birth}`);
  console.log(`Work/Edu: ${ps.workAndEducation}`);
  console.log(`Family: ${ps.family}`);
  console.log(`Health: ${ps.health}`);
  console.log(`Trajectory: ${ps.trajectory}`);
  console.log(`Death Cause: ${st.deathCause || st.death_cause || 'None'}`);
  console.log(`Money: ${st.m}, Health: ${st.h}, Mind: ${st.p}, Originium: ${st.ori}`);
  console.log(`Flags count: ${Object.keys(st.fl || {}).length}`);
  console.log(`Key flags:`, Object.keys(st.fl || {}).filter(k => st.fl[k]));
  
  // Look at choice events or major events
  if (d.records) {
    console.log(`Records keys:`, Object.keys(d.records));
  }
  if (d.eventsHistory) {
    console.log(`Events history length:`, d.eventsHistory.length);
  }
}
