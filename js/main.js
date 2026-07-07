// ============================================
// 이음턱편한치과 — 공통 스크립트 (스크롤 애니메이션)
// JS가 꺼져 있어도 콘텐츠는 항상 보이도록 설계되어 있습니다.
// ============================================
(function () {
  // 사용자가 '동작 줄이기'를 켜둔 경우 애니메이션 없이 표시
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.body.classList.add('fx');

  var selectors = [
    '.section-title', '.card', '.equip-card', '.feature-row', '.gallery-item',
    '.step', '.faq-item', '.info-box', '.pillar', '.band-quote', '.band-tags',
    '.doctor-photo', '.doctor-info', '.about-visual', '.about-grid > div:not(.about-visual)',
    '.check-list li', '.banner-cta', '.equip-group-title', '.ba-slider', '.blog-cta'
  ];
  var items = document.querySelectorAll(selectors.join(','));

  // 같은 부모 안의 형제들은 순차적으로 나타나도록 지연 시간 부여
  var groups = new Map();
  items.forEach(function (el) {
    el.classList.add('reveal');
    var parent = el.parentElement;
    var n = groups.get(parent) || 0;
    el.style.setProperty('--d', Math.min(n * 0.09, 0.45) + 's');
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

  items.forEach(function (el) { observer.observe(el); });
})();
