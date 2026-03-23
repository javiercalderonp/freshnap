(function () {
  window.FreshCore = {
    initProgressBar() {
      const fill = document.querySelector('[data-progress-fill]');
      if (!fill) return;
      const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
        fill.style.width = progress + '%';
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
    },

    initCounters(scope) {
      const counters = (scope || document).querySelectorAll('[data-counter]');
      counters.forEach(counter => {
        const end = Number(counter.dataset.counter || 0);
        const decimals = Number(counter.dataset.decimals || 0);
        const suffix = counter.dataset.suffix || '';
        const prefix = counter.dataset.prefix || '';
        gsap.fromTo(counter,
          { innerText: 0 },
          {
            innerText: end,
            duration: 1.8,
            snap: { innerText: decimals ? 0.1 : 1 },
            ease: 'power2.out',
            scrollTrigger: {
              trigger: counter,
              start: 'top 85%',
              once: true
            },
            onUpdate: function () {
              const value = Number(counter.innerText);
              counter.innerText = prefix + value.toFixed(decimals) + suffix;
            },
            onComplete: function () {
              counter.innerText = prefix + end.toFixed(decimals) + suffix;
            }
          }
        );
      });
    },

    initViewportVideos(scope) {
      const videos = (scope || document).querySelectorAll('.phone__screen video[data-autoplay], video[data-play-on-view]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const video = entry.target;
          if (entry.isIntersecting) {
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') promise.catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.45 });
      videos.forEach(video => observer.observe(video));
    },

    initHoverVideos(scope) {
      const videos = (scope || document).querySelectorAll('video[data-play-on-hover]');
      videos.forEach(video => {
        const card = video.closest('.media-card') || video.parentElement;
        if (!card) return;
        card.addEventListener('mouseenter', () => {
          const promise = video.play();
          if (promise && typeof promise.catch === 'function') promise.catch(() => {});
        });
        card.addEventListener('mouseleave', () => {
          video.pause();
          video.currentTime = 0;
        });
      });
    },

    revealOnScroll(scope) {
      const blocks = (scope || document).querySelectorAll('.fade-block');
      blocks.forEach(block => {
        gsap.to(block, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: block,
            start: 'top 80%'
          }
        });
      });
    }
  };
})();
