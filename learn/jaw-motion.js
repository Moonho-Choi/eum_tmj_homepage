/* 턱관절 움직임 뷰어 — 묘책 도해를 층으로 나눠 움직임을 입힌 공용 코드
   initJawViewer({viewer, play, slider, cap, click})
   click:false = 정상 개구 / click:true = 소리 나는 턱(밀려난 디스크 → '딱') */
(function () {
  var BASE = window.JAW_ASSET_BASE || "";
  var GEO = {
    bone: { left: 399, top: 392, ox: 256, oy: 206, src: BASE + "img/motion/bone.webp", w: 1077 },
    disc: { left: 388, top: 302, ox: 267, oy: 296, src: BASE + "img/motion/disc.webp", w: 779 },
    end: { tx: 235, ty: 165, rot: 16, ddx: -60, ddy: 0, drot: -16 }
  };
  var SNAP_T = 0.52;
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  window.initJawViewer = function (opts) {
    var root = document.getElementById(opts.viewer);
    var stage = document.createElement("div");
    stage.className = "jaw-stage";
    stage.innerHTML =
      '<img src="' + BASE + 'img/motion/bg-plate.jpg" style="left:0;top:0;width:1536px" alt="턱관절 단면 배경">' +
      '<img class="jm-disc" src="' + GEO.disc.src + '" style="left:' + GEO.disc.left + 'px;top:' + GEO.disc.top + 'px;width:' + GEO.disc.w + 'px;transform-origin:' + GEO.disc.ox + 'px ' + GEO.disc.oy + 'px" alt="관절원판(디스크)">' +
      '<img class="jm-bone" src="' + GEO.bone.src + '" style="z-index:2;left:' + GEO.bone.left + 'px;top:' + GEO.bone.top + 'px;width:' + GEO.bone.w + 'px;transform-origin:' + GEO.bone.ox + 'px ' + GEO.bone.oy + 'px" alt="아래턱뼈(과두)">' +
      '<img src="' + BASE + 'img/motion/eminence.webp" style="z-index:4;left:835px;top:245px;width:701px" alt="">' +
      (opts.click ? '<img class="jm-disc2" src="' + BASE + 'img/motion/disc-displaced.webp" style="z-index:3;left:509px;top:255px;width:649px;opacity:0" alt="앞으로 밀려난 디스크">' : "") +
      '<div class="jm-flash"></div><div class="jm-label">딱!</div>' +
      (opts.click ? '<div class="jm-legend">빨간색 = 밀려난 디스크</div>' : "");
    root.appendChild(stage);

    var bone = stage.querySelector(".jm-bone"), disc = stage.querySelector(".jm-disc");
    var disc2 = stage.querySelector(".jm-disc2");
    var flash = stage.querySelector(".jm-flash"), label = stage.querySelector(".jm-label");
    if (opts.click) {
      disc.style.filter = "hue-rotate(145deg) saturate(4) contrast(1.15)";
      if (disc2) disc2.style.filter = "hue-rotate(145deg) saturate(4) contrast(1.15)";
    }

    function fit() { stage.style.transform = "scale(" + root.clientWidth / 1536 + ")"; }
    new ResizeObserver(fit).observe(root); fit();

    var capEl = document.getElementById(opts.cap);

    function render(t) {
      var rotT = easeInOut(Math.min(t / 0.45, 1));
      var glB = easeInOut(Math.max((t - 0.35) / 0.65, 0));
      var shake = 0, snapNow = false, stuck = false;

      if (opts.click) {
        if (t < SNAP_T) {
          stuck = glB > 0.02;
          glB = Math.min(glB, 0.18);
          if (t > 0.34) shake = Math.sin(t * 170) * 3;
        } else {
          snapNow = t < SNAP_T + 0.10;
          glB = Math.max(0.18, easeInOut((t - SNAP_T) / (1 - SNAP_T)));
        }
      }

      var rot = lerp(0, 9, rotT) + lerp(0, GEO.end.rot - 9, glB);
      var tx = lerp(0, GEO.end.tx, glB) + shake;
      var ty = lerp(0, GEO.end.ty, Math.pow(glB, 0.72));
      bone.style.transform = "translate(" + tx + "px," + ty + "px) rotate(" + rot + "deg)";

      if (opts.click && t < SNAP_T) {
        disc.style.opacity = 0; disc2.style.opacity = 1;
      } else {
        if (opts.click) { disc.style.opacity = 1; disc2.style.opacity = 0; }
        var ddx = lerp(0, GEO.end.ddx, glB), ddy = lerp(0, GEO.end.ddy, glB), drot = lerp(0, GEO.end.drot, glB);
        disc.style.transform = "translate(" + (tx - shake + ddx) + "px," + (ty + ddy) + "px) rotate(" + drot + "deg)";
      }

      if (opts.click) {
        flash.style.left = (655 + tx - 110) + "px"; flash.style.top = (598 + ty - 150) + "px";
        label.style.left = "300px"; label.style.top = "220px";
        flash.style.opacity = snapNow ? 0.95 : 0;
        label.style.opacity = snapNow ? 1 : 0;
      }

      if (opts.click) {
        if (t < 0.06) capEl.innerHTML = "<b>다문 상태</b> — 디스크(빨간색)가 과두 위가 아니라 앞으로 밀려나 있습니다.";
        else if (t < SNAP_T) capEl.innerHTML = stuck
          ? "<b>걸림</b> — 과두가 나아가려 해도 밀려난 디스크가 길을 막아 더 벌어지지 않습니다."
          : "<b>1단계 · 제자리 회전</b> — 여기까지는 정상과 같습니다.";
        else if (t < SNAP_T + 0.16) capEl.innerHTML = "<b>'딱!'</b> — 과두가 디스크 밑으로 올라타는 순간, 소리가 납니다.";
        else capEl.innerHTML = "<b>소리 뒤에는 정상처럼</b> — 디스크를 되찾은 과두가 끝까지 미끄러집니다.";
      } else {
        if (t < 0.06) capEl.innerHTML = "<b>다문 상태</b> — 턱뼈 머리(과두)가 오목한 자리(관절와)에 들어 있습니다.";
        else if (glB < 0.05) capEl.innerHTML = "<b>1단계 · 제자리 회전</b> — 입을 조금 벌릴 때는 과두가 경첩처럼 제자리에서 돕니다.";
        else capEl.innerHTML = "<b>2단계 · 앞으로 미끄러짐(활주)</b> — 과두가 디스크와 함께 언덕(관절융기)의 비탈을 타고 내려옵니다.";
      }
      return snapNow;
    }

    var playing = true, t = 0, dir = 1, hold = 0, snapHeld = false;
    var slider = document.getElementById(opts.slider), btn = document.getElementById(opts.play);
    function tick() {
      if (playing) {
        if (hold > 0) hold--;
        else {
          t += dir * 0.006;
          if (t >= 1) { t = 1; dir = -1; hold = 55; snapHeld = false; }
          if (t <= 0) { t = 0; dir = 1; hold = 45; snapHeld = false; }
        }
        slider.value = Math.round(t * 1000);
        var snapNow = render(t);
        if (snapNow && !snapHeld && dir > 0) { hold = 40; snapHeld = true; }
      }
      requestAnimationFrame(tick);
    }
    slider.addEventListener("input", function () {
      playing = false; btn.textContent = "▶ 자동"; btn.classList.remove("on");
      t = +slider.value / 1000; render(t);
    });
    btn.addEventListener("click", function () {
      playing = !playing;
      btn.textContent = playing ? "⏸ 자동" : "▶ 자동";
      btn.classList.toggle("on", playing);
    });
    render(0); tick();
  };
})();
