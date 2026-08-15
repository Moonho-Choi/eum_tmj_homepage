(function () {
  var form = document.getElementById('tmj-check-form');
  if (!form) return;
  var result = document.getElementById('tmj-check-result');
  var message = document.getElementById('checker-message');
  var progress = document.getElementById('checker-progress-bar');
  var painRange = document.getElementById('tmj-pain-level');
  var painOutput = document.getElementById('tmj-pain-output');
  var names = ['pain', 'painDuration', 'painLevel', 'painChange', 'locking', 'sound', 'impact', 'trauma'];
  function one(name) { var input = form.querySelector('input[name="' + name + '"]:checked'); return input ? input.value : ''; }
  function many(name) { return Array.from(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (input) { return input.value; }); }
  function answered(name) { return name === 'painLevel' ? painRange.dataset.touched === 'true' : name === 'painChange' ? many(name).length > 0 : Boolean(one(name)); }
  function updateProgress() { progress.style.width = Math.round(names.filter(answered).length / names.length * 100) + '%'; }
  painRange.addEventListener('input', function () { painRange.dataset.touched = 'true'; painOutput.value = painRange.value; painRange.style.setProperty('--range-fill', Number(painRange.value) * 10 + '%'); updateProgress(); });
  form.querySelectorAll('[data-exclusive="true"]').forEach(function (exclusive) {
    var group = Array.from(form.querySelectorAll('input[name="' + exclusive.name + '"]'));
    group.forEach(function (input) { input.addEventListener('change', function () { if (input === exclusive && input.checked) group.forEach(function (other) { if (other !== exclusive) other.checked = false; }); else if (input.checked) exclusive.checked = false; }); });
  });
  form.addEventListener('change', updateProgress);
  function outcome(data) {
    var prompt = [], reasons = [], points = 0;
    if (data.locking === 'now') prompt.push('현재 입 벌림이 어렵거나 턱이 잠긴 상태');
    if (data.impact === 'severe') prompt.push('턱 증상으로 일상생활이 어려운 상태');
    if (data.painLevel >= 7) prompt.push('통증 강도가 7점 이상');
    if (data.trauma === 'yes' && (data.painLevel >= 4 || data.locking !== 'no')) prompt.push('외상 뒤 통증 또는 움직임 제한이 동반됨');
    if (data.pain === 'yes') { points += 2; reasons.push('최근 30일 이내 턱·귀 앞·관자놀이 통증'); }
    points += data.painLevel >= 4 ? 2 : data.painLevel > 0 ? 1 : 0;
    if (data.painDuration === 'medium' || data.painDuration === 'long') { points += 2; reasons.push('2주 이상 이어진 불편감'); }
    if (data.painChange.some(function (v) { return v !== 'none'; })) { points += 2; reasons.push('턱의 움직임이나 이 악물기로 심해지는 통증'); }
    if (data.locking === 'often') { points += 3; reasons.push('자주 반복되는 턱 걸림 또는 잠김'); } else if (data.locking === 'sometimes') { points += 1; reasons.push('간헐적인 턱 걸림 또는 잠김'); }
    if (data.sound === 'painful' || data.sound === 'grating') { points += 2; reasons.push('통증을 동반한 소리 또는 거친 마찰음'); }
    if (data.impact === 'moderate') { points += 2; reasons.push('일상생활에 상당한 불편'); } else if (data.impact === 'mild') points += 1;
    if (data.trauma === 'yes') { points += 1; reasons.push('턱 또는 얼굴 외상 뒤 발생한 증상'); }
    if (prompt.length) return ['prompt', '빠른 진료 상담을 권합니다', '입 벌림 제한, 강한 통증 또는 일상생활의 어려움이 확인되었습니다.', '증상이 더 심해지기 전에 치과에 전화하여 현재 상태를 설명하고 가능한 진료 일정을 상담해 주세요.', prompt.concat(reasons)];
    if (points >= 3) return ['consult', '턱관절 진료 상담을 권합니다', '턱관절 또는 주변 근육에 대한 확인이 도움이 될 수 있는 증상이 있습니다.', '증상의 원인은 다양하므로 진찰과 필요한 검사를 통해 현재 상태와 치료 필요 여부를 확인해 보세요.', reasons];
    if (data.sound === 'painless' && data.painLevel === 0 && data.locking === 'no') return ['observe', '현재는 경과를 살펴볼 수 있습니다', '통증이나 움직임 제한 없이 턱 소리만 선택하셨습니다.', '통증 없는 턱 소리는 흔하며 반드시 치료가 필요한 것은 아닙니다. 통증, 턱 걸림 또는 입 벌림 제한이 새로 생기면 진료를 받아보세요.', ['통증을 동반하지 않은 턱 소리']];
    return ['clear', '현재 뚜렷한 위험 신호는 적습니다', '입력한 답변에서는 적극적인 진료 상담이 필요한 증상이 두드러지지 않았습니다.', '턱을 무리하게 사용하지 말고 상태를 지켜보세요. 증상이 계속되거나 새로 생기면 치과에 상담해 주세요.', ['현재 선택한 답변에서 두드러진 통증이나 움직임 제한이 없음']];
  }
  form.addEventListener('submit', function (event) {
    event.preventDefault(); var missingName = names.find(function (name) { return !answered(name); });
    if (missingName) { var missing = form.querySelector('[data-question="' + missingName + '"]'); message.textContent = '모든 질문에 답한 뒤 결과를 확인해 주세요.'; missing.scrollIntoView({ behavior: 'smooth', block: 'center' }); missing.classList.add('needs-answer'); setTimeout(function () { missing.classList.remove('needs-answer'); }, 1800); return; }
    message.textContent = '';
    var data = { pain: one('pain'), painDuration: one('painDuration'), painLevel: Number(painRange.value), painChange: many('painChange'), locking: one('locking'), sound: one('sound'), impact: one('impact'), trauma: one('trauma') };
    var check = outcome(data), top = document.getElementById('checker-result-top'); top.className = 'checker-result-top ' + check[0];
    document.getElementById('checker-result-title').textContent = check[1]; document.getElementById('checker-result-description').textContent = check[2]; document.getElementById('checker-guidance-text').textContent = check[3];
    var list = document.getElementById('checker-summary-list'); list.replaceChildren(); Array.from(new Set(check[4])).forEach(function (text) { var li = document.createElement('li'); li.textContent = text; list.appendChild(li); });
    result.hidden = false; result.focus({ preventScroll: true }); result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (typeof gtag === 'function') gtag('event', 'tmj_self_check_complete', { result_level: check[0] });
  });
  document.getElementById('checker-retry').addEventListener('click', function () { result.hidden = true; form.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  painRange.style.setProperty('--range-fill', '0%'); updateProgress();
})();
