const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const pad = document.getElementById('pad');

let expr = '';
let lastWasEqual = false;

function safeEval(input) {
  if (!/^[0-9+\-*/().% ]*$/.test(input)) throw new Error('Invalid');
  input = input.replace(/(\d+)%/g, '($1/100)');
  return Function(`"use strict";return (${input})`)();
}

function render() {
  expressionEl.textContent = expr || '0';
  try {
    resultEl.textContent = expr ? safeEval(expr) : 0;
  } catch {
    resultEl.textContent = '—';
  }
}

function handleInput(key) {
  if (key === 'clear') { expr = ''; lastWasEqual = false; return render(); }
  if (key === 'del') { expr = expr.slice(0, -1); return render(); }
  if (key === 'paren') {
    const open = (expr.match(/\(/g) || []).length;
    const close = (expr.match(/\)/g) || []).length;
    expr += open > close ? ')' : '(';
    return render();
  }
  if (key === 'percent') { expr += '%'; return render(); }
  if (key === '=') {
    try {
      expr = String(safeEval(expr || '0'));
      lastWasEqual = true;
    } catch {
      resultEl.textContent = 'Error';
    }
    return render();
  }
  if (lastWasEqual && /[0-9.]/.test(key)) expr = '';
  expr += key;
  lastWasEqual = false;
  render();
}

pad.addEventListener('click', e => {
  const key = e.target.closest('.key');
  if (!key) return;
  handleInput(key.dataset.key);
});

window.addEventListener('keydown', e => {
  const map = { Enter: '=', Backspace: 'del', Escape: 'clear' };
  let k = map[e.key] || e.key;
  if (/^[0-9+\-*/().%]$/.test(k) || ['=', 'del', 'clear'].includes(k)) {
    handleInput(k);
    e.preventDefault();
  }
});

render();
