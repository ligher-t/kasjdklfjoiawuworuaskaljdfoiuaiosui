const fs = require('fs');

// 1. Inspect Tanaka Mio's economy history
const tanaka = JSON.parse(fs.readFileSync('d:/Downloads/terra-life-1077-66-terra-source-d114d9d3.json', 'utf8'));
console.log('=== TANAKA MIO ECONOMY HISTORY ===');
const econ = tanaka.annualEconomyHistory || [];
console.log(`Total annual economy entries: ${econ.length}`);
console.log('Last 10 annual economy entries:');
econ.slice(-10).forEach(e => {
  console.log(`  Year ${e.year} (Age ${e.age}): Income=${e.income}, Expense=${e.expense}, Cash=${e.closingCash}, Debt=${e.closingDebt}, Net=${e.netFlow}`);
});

console.log('\nChoice economy history (sample):');
const choiceEcon = tanaka.choiceEconomyHistory || [];
console.log(`Total choice economy entries: ${choiceEcon.length}`);
choiceEcon.slice(-5).forEach(c => {
  console.log(`  Year ${c.year} [${c.eventId}]: cost=${c.cost}, loan=${c.loanBorrow}, medical=${c.medicalPayment}`);
});

// 2. Inspect parent death logic in codebase
console.log('\n=== CHECKING PARENT DEATH LOGIC ===');
