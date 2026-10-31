const fs = require('fs');
const path = require('path');

// 1. Analyze simulation report
const simPath = 'd:/Downloads/terra-dev-simulation-terra-source-d114d9d3.json';
const sim = JSON.parse(fs.readFileSync(simPath, 'utf8'));

console.log('========================================================');
console.log('=== 1. DEV SIMULATION REPORT ANALYSIS ===');
console.log('========================================================');
console.log('Summary:', JSON.stringify(sim.summary, null, 2));
console.log('\nFailures (Count: ' + (sim.failures?.length || 0) + '):');
console.log(JSON.stringify(sim.failures, null, 2));

console.log('\nDeath Causes (Top 15):');
const sortedDeaths = Object.entries(sim.deathCauses || {}).sort((a,b) => b[1] - a[1]);
console.log(sortedDeaths.slice(0, 15));

console.log('\nTerra-Specific Mortality:');
console.log(JSON.stringify(sim.terraSpecificMortality, null, 2));

console.log('\nDiscrimination Metrics:');
console.log(JSON.stringify(sim.discriminationMetrics, null, 2));

console.log('\nEconomic Health Metrics:');
console.log(JSON.stringify(sim.economicHealthMetrics, null, 2));

console.log('\nLongest Event-Free Examples:');
console.log(JSON.stringify(sim.lifePaths?.longestEventFreeExamples?.slice(0, 3), null, 2));

console.log('\nLongest Without Recorded Job Examples:');
console.log(JSON.stringify(sim.lifePaths?.longestWithoutRecordedJobExamples?.slice(0, 3), null, 2));

// Check zero-coverage events count
const zeroCoverage = (sim.eventCoverage || []).filter(e => e.count === 0);
console.log('\nZero-coverage events count:', zeroCoverage.length, 'out of', (sim.eventCoverage || []).length);
console.log('Sample zero-coverage events:', zeroCoverage.slice(0, 10).map(e => e.id));

