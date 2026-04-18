
import fs from 'fs';

function checkBalance(content) {
  let braces = 0;
  let parens = 0;
  let brackets = 0;
  for (let char of content) {
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '(') parens++;
    if (char === ')') parens--;
    if (char === '[') brackets++;
    if (char === ']') brackets--;
  }
  return { braces, parens, brackets };
}

const detailContent = fs.readFileSync('/Users/felipesousa/Downloads/Trabalho/sistema_de_abastecimento/frontend/src/pages/Analysis/AnalysisDetail.tsx', 'utf8');
const mainContent = fs.readFileSync('/Users/felipesousa/Downloads/Trabalho/sistema_de_abastecimento/frontend/src/pages/Analysis/Analysis.tsx', 'utf8');

console.log('AnalysisDetail:', checkBalance(detailContent));
console.log('Analysis:', checkBalance(mainContent));
