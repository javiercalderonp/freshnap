gsap.registerPlugin(ScrollTrigger);

(async function () {
  const res = await fetch('/data/freshnap.json');
  const data = await res.json();

  populateStatic(data);
  FreshCore.initProgressBar();
  FreshCore.revealOnScroll(document);
  FreshCore.initCounters(document);
  FreshCore.initViewportVideos(document);
  FreshCore.initHoverVideos(document);
  initHero();
  initProblemPin();
  initTabs(data.tabs);
  initClosing(data.closing);
  initChart(data.chart);
})();

function populateStatic(data) {
  document.querySelector('[data-hero-title]').textContent = data.hero.title;
  document.querySelector('[data-hero-subtitle]').textContent = data.hero.subtitle;

  const chips = document.querySelector('[data-hero-chips]');
  chips.innerHTML = data.hero.chips.map(chip => `<span class="pill">${chip}</span>`).join('');

  const foods = document.querySelector('[data-problem-foods]');
  foods.innerHTML = data.problemFoods.map(food => `<span class="pill">${food}</span>`).join('');

  const products = document.querySelector('[data-product-grid]');
  products.innerHTML = data.products.map(product => `
    <article class="card card--hover media-card fade-block">
      <div class="media-card__media">
        <video muted loop playsinline preload="metadata" poster="/brands/freshnap/assets/poster-card.svg" data-play-on-hover>
          <source src="/brands/freshnap/assets/${product.video}" type="video/mp4">
        </video>
      </div>
      <span class="section__eyebrow" style="margin-bottom:.5rem">${product.tag}</span>
      <h3>${product.title}</h3>
      <p>${product.description}</p>
    </article>
  `).join('');

  const plans = document.querySelector('[data-plans]');
  plans.innerHTML = data.plans.map(plan => `
    <article class="card plan-card fade-block">
      <small class="section__eyebrow" style="margin-bottom:.4rem">${plan.price}</small>
      <h3>${plan.name}</h3>
      <p>${plan.desc}</p>
    </article>
  `).join('');

  const market = document.querySelector('[data-market]');
  market.innerHTML = data.market.map(item => `<span class="pill fade-block">${item}</span>`).join('');

  const kpis = document.querySelector('[data-kpis]');
  kpis.innerHTML = data.kpis.map(item => `
    <article class="kpi-card fade-block">
      <small>${item.detail}</small>
      <h3 data-counter="${item.value}" data-suffix="${item.suffix || ''}">${item.value}${item.suffix || ''}</h3>
      <p>${item.label}</p>
    </article>
  `).join('');

  document.querySelector('[data-closing-quote]').textContent = data.closing.quote;
  document.querySelector('[data-closing-support]').textContent = data.closing.support;
}

function initHero() {
  gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })
    .from('.hero-orb', { opacity: 0, scale: 0.7, duration: 1.2 })
    .from('#hero .fade-block', { opacity: 0, y: 24, stagger: 0.12 }, '-=0.8');
}

function initProblemPin() {
  ScrollTrigger.create({
    trigger: '#problema',
    start: 'top top',
    end: '+=70%',
    pin: true,
    scrub: 1
  });

  gsap.utils.toArray('#problema .fade-block').forEach((el, index) => {
    gsap.fromTo(el, { opacity: 0, y: 35 }, {
      opacity: 1,
      y: 0,
      scrollTrigger: {
        trigger: '#problema',
        start: `top+=${index * 40} center`,
        end: 'bottom center',
        scrub: 1
      }
    });
  });
}

function initTabs(tabs) {
  const nav = document.querySelector('[data-tabs-nav]');
  const panels = document.querySelector('[data-tabs-panels]');
  nav.innerHTML = tabs.map((tab, i) => `<button class="tab ${i === 0 ? 'is-active' : ''}" type="button">${tab.label}</button>`).join('');
  panels.innerHTML = tabs.map((tab, i) => `
    <article class="tab-panel ${i === 0 ? 'is-active' : ''}">
      <div class="card">
        <span class="section__eyebrow">${tab.label}</span>
        <h3 class="section__title" style="font-size: clamp(1.7rem, 3vw, 3rem)">${tab.title}</h3>
        <p class="section__lead">${tab.text}</p>
        <ul class="feature-list" style="margin-top:1.25rem;">
          ${tab.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    </article>
  `).join('');

  const tabEls = gsap.utils.toArray('.tab');
  const panelEls = gsap.utils.toArray('.tab-panel');

  ScrollTrigger.create({
    trigger: '#solucion',
    start: 'top top',
    end: `+=${tabs.length * 100}%`,
    pin: true,
    scrub: 1,
    onUpdate: self => {
      const progress = self.progress;
      const rawIndex = Math.min(tabs.length - 1, Math.floor(progress * tabs.length));
      setActiveTab(rawIndex);
    }
  });

  function setActiveTab(index) {
    tabEls.forEach((tab, i) => tab.classList.toggle('is-active', i === index));
    panelEls.forEach((panel, i) => {
      const active = i === index;
      panel.classList.toggle('is-active', active);
      gsap.to(panel, {
        opacity: active ? 1 : 0,
        y: active ? 0 : 28,
        duration: 0.35,
        overwrite: true,
        pointerEvents: active ? 'auto' : 'none'
      });
    });
  }
}

function initChart(chartData) {
  const canvas = document.getElementById('growthChart');
  let chart;

  ScrollTrigger.create({
    trigger: '#crecimiento',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      if (chart) return;
      chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Restaurantes activos',
              data: chartData.restaurants,
              borderColor: '#84d6b8',
              backgroundColor: 'rgba(132,214,184,0.15)',
              borderWidth: 3,
              tension: 0.35,
              fill: true
            },
            {
              label: 'Unidades mensuales',
              data: chartData.units,
              borderColor: '#f2d45f',
              backgroundColor: 'rgba(242,212,95,0.08)',
              borderWidth: 3,
              tension: 0.35,
              fill: false,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { labels: { color: '#f7f8fa' } }
          },
          scales: {
            x: { ticks: { color: '#a3afc4' }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y: { ticks: { color: '#a3afc4' }, grid: { color: 'rgba(255,255,255,0.06)' } },
            y1: { position: 'right', ticks: { color: '#a3afc4' }, grid: { drawOnChartArea: false } }
          }
        }
      });
    }
  });
}

function initClosing(closing) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#cierre',
      start: 'top top',
      end: '+=120%',
      pin: true,
      scrub: 1
    }
  });

  tl.fromTo('[data-closing-logo]', { opacity: 1, scale: 1 }, { opacity: 0.1, scale: 0.8, duration: 1 })
    .fromTo('[data-closing-quote]', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, 0.35)
    .fromTo('[data-closing-support]', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1 }, 0.55);
}
