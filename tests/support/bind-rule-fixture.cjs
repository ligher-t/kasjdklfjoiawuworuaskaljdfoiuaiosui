'use strict';
// Data-only unit tests provide their existing helpers through the explicit API.
// Unused services throw if called; they never fabricate a passing game result.
function bindRuleFixture(context) {
  const api=context.window.TERRA_RULES,providers={};
  for(const [domain,methods]of Object.entries(api.contract)){
    providers[domain]={};
    for(const [method,originalName]of Object.entries(methods)){
      const missing=()=>{throw Error('Data-only fixture did not provide '+originalName);};
      Object.defineProperty(providers[domain],method,{enumerable:true,get:()=>typeof context[originalName]==='function'?context[originalName]:missing});
    }
  }
  api.bind(providers);
}
module.exports={bindRuleFixture};
