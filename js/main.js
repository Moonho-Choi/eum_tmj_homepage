// ============================================
// 이음턱편한치과 — 공통 스크립트 (스크롤 애니메이션)
// 요소 성격에 따라 서로 다른 효과를 적용합니다.
//  - fx-up    : 아래에서 떠오름 (제목, 텍스트, 카드)
//  - fx-zoom  : 살짝 확대되며 나타남
//  - fx-photo : 사진이 줌아웃되며 선명해짐 (갤러리, 인물 사진)
// 효과 제외: "다른 이유"(#why), 장비 소개(#equipment), 오시는길(#location),
//           자가진단 배너(banner-cta), FAQ, 체크리스트 등
// ============================================
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.classList.add('fx');

  // 이 영역 안의 요소는 애니메이션을 적용하지 않음
  var EXCLUDE = '#why, #equipment, #location, .banner-cta';

  function tag(els, cls) {
    els.forEach(function (el) {
      if (el.closest(EXCLUDE)) return;
      el.classList.add('reveal', cls);
    });
  }

  // 1) 아래에서 떠오름 — 제목·텍스트·기본 카드
  tag(document.querySelectorAll(
    '.section-title, .card, .step, .doctor-info, ' +
    '.band-quote, .band-tags, .blog-cta, .ba-slider, .pillar'
  ), 'fx-up');

  // 2) 사진 줌아웃 — 갤러리, 인물/병원 사진
  tag(document.querySelectorAll('.gallery-item, .about-visual, .doctor-photo'), 'fx-photo');

  // 그리드 안 형제들은 순차 등장 (도미노)
  var groups = new Map();
  document.querySelectorAll('.reveal').forEach(function (el) {
    var parent = el.parentElement;
    var n = groups.get(parent) || 0;
    el.style.setProperty('--d', Math.min(n * 0.1, 0.5) + 's');
    groups.set(parent, n + 1);
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
})();
