// ============================================
// 이음턱편한치과 — 공통 스크립트 (스크롤 애니메이션)
// 요소 성격에 따라 서로 다른 효과를 적용합니다.
//  - fx-up    : 아래에서 떠오름 (제목, 텍스트, 카드)
//  - fx-left  : 왼쪽에서 들어옴 (사진+텍스트 행의 사진 등)
//  - fx-right : 오른쪽에서 들어옴
//  - fx-zoom  : 살짝 확대되며 나타남 (장비 카드, 배너)
//  - fx-photo : 사진이 줌아웃되며 선명해짐 (갤러리, 인물 사진)
// FAQ, 체크리스트, 진료시간 박스 등은 효과 없이 바로 표시합니다.
// ============================================
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.body.classList.add('fx');

  function tag(els, cls) {
    els.forEach(function (el) { el.classList.add('reveal', cls); });
  }

  // 1) 아래에서 떠오름 — 제목·텍스트·기본 카드
  tag(document.querySelectorAll(
    '.section-title, .equip-group-title, .card, .step, .doctor-info, ' +
    '.band-quote, .band-tags, .blog-cta, .ba-slider, .pillar'
  ), 'fx-up');

  // 2) 확대되며 등장 — 장비 카드, CTA 배너
  tag(document.querySelectorAll('.equip-card, .banner-cta'), 'fx-zoom');

  // 3) 사진 줌아웃 — 갤러리, 인물/병원 사진
  tag(document.querySelectorAll('.gallery-item, .about-visual, .doctor-photo'), 'fx-photo');

  // 4) 좌우 슬라이드 — 사진+텍스트 교차 행 (행 방향에 맞춰 반대편에서 등장)
  document.querySelectorAll('.feature-row').forEach(function (row) {
    var photo = row.querySelector('.feature-photo');
    var text = row.querySelector('.feature-text');
    var rev = row.classList.contains('reverse');
    if (photo) photo.classList.add('reveal', rev ? 'fx-right' : 'fx-left');
    if (text) text.classList.add('reveal', rev ? 'fx-left' : 'fx-right');
  });

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
