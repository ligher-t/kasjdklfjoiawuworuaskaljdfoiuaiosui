"use strict";
// Inspect declarations before JS overwrites duplicate keys. Strings/comments and
// nested objects have separate lexical scopes; no evaluated object can prove this.
function duplicateSceneKeys(source){
 const tokens=[];let i=0,line=1;
 while(i<source.length){const c=source[i];
  if(c==='\n'){line++;i++;continue;}
  if(/\s/.test(c)){i++;continue;}
  if(c==='/'&&source[i+1]==='/'){while(i<source.length&&source[i]!=='\n')i++;continue;}
  if(c==='/'&&source[i+1]==='*'){i+=2;while(i<source.length&&!(source[i]==='*'&&source[i+1]==='/')){if(source[i++]==='\n')line++;}i+=2;continue;}
  if(c==='"'||c==="'"||c==='`'){const quote=c,at=line;let text='';i++;
   while(i<source.length){const x=source[i++];if(x==='\n')line++;if(x==='\\'){text+=x+(source[i++]||'');continue;}if(x===quote)break;text+=x;}
   tokens.push({v:text,line:at,string:true});continue;
  }
  if(/[A-Za-z_$]/.test(c)){let word=c;i++;while(i<source.length&&/[\w$]/.test(source[i]))word+=source[i++];tokens.push({v:word,line});continue;}
  tokens.push({v:c,line});i++;
 }
 const scopes=[],errors=[];
 for(let n=0;n<tokens.length;n++){const t=tokens[n],previous=tokens[n-1]?.v,next=tokens[n+1]?.v;
  if(t.v==='{')scopes.push(new Map());else if(t.v==='}')scopes.pop();
  else if(['show','historicalScene','timelineFlag'].includes(t.v)&&['{',','].includes(previous)&&[':', '('].includes(next)&&scopes.length){
   const scope=scopes.at(-1);if(scope.has(t.v))errors.push({key:t.v,line:t.line,previousLine:scope.get(t.v)});else scope.set(t.v,t.line);
  }
 }
 return errors;
}
module.exports={duplicateSceneKeys};
