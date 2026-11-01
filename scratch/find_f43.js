const path = require('path');
const vm = require('vm');
const { context } = require(path.resolve(__dirname, '../tests/support/presentation-cases.cjs'));
const env = context(path.resolve(__dirname, '..'));

const ev = vm.runInContext('EV.find(e => e.id === "f43")', env.ctx);
console.log('f43:', ev);

const baseDailies = vm.runInContext(`
  EV.filter(e => (!e.c || e.c.length === 0) && !e.id.startsWith('daily_')).map(e => ({
    id: e.id,
    st: e.st,
    t: (e.t || '').slice(0, 30),
    w: e.w
  })).slice(0, 20)
`, env.ctx);
console.log('Base dailies sample:', baseDailies);
