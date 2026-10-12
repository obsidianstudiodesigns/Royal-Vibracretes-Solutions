(function () {
  var header = document.querySelector('[data-header]');
  var menuBtn = document.querySelector('[data-menu]');
  var nav = document.getElementById('site-nav');
  var waFloat = document.querySelector('.wa-float');
  var hero = document.querySelector('.hero');

  // Solid header and floating WhatsApp button once the hero is scrolled past
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-solid', y > 40);
    if (hero && waFloat) {
      waFloat.classList.toggle('is-visible', y > hero.offsetHeight * 0.6);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  // Quote form opens WhatsApp with the details filled in
  var form = document.querySelector('[data-quote]');
  var error = form.querySelector('[data-error]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var name = (data.get('name') || '').trim();
    var area = (data.get('area') || '').trim();

    form.name.setAttribute('aria-invalid', String(!name));
    form.area.setAttribute('aria-invalid', String(!area));
    if (!name || !area) {
      error.hidden = false;
      (name ? form.area : form.name).focus();
      return;
    }
    error.hidden = true;

    var lines = [
      'Hi Innocent, I\'d like a quote please.',
      '',
      'Name: ' + name,
      'Suburb: ' + area,
      'Service: ' + data.get('service')
    ];
    var length = (data.get('length') || '').trim();
    if (length) lines.push('Length: ' + length + ' m');
    lines.push('Height: ' + data.get('height'));
    var notes = (data.get('notes') || '').trim();
    if (notes) lines.push('Notes: ' + notes);

    window.open('https://wa.me/27783202293?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  // Work gallery: filters
  var grid = document.querySelector('[data-gallery]');
  var filterBtns = document.querySelectorAll('[data-filter]:not([data-gallery])');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      grid.setAttribute('data-filter', cat);
      grid.querySelectorAll('li').forEach(function (li) {
        li.hidden = cat !== 'all' && li.getAttribute('data-cat') !== cat;
      });
    });
  });

  // Work gallery: lightbox
  var lb = document.querySelector('[data-lightbox]');
  var lbImg = lb.querySelector('[data-lb-img]');
  var lbCaption = lb.querySelector('[data-lb-caption]');
  var lbCount = lb.querySelector('[data-lb-count]');
  var items = [];
  var current = 0;
  var lastFocus = null;

  function visibleLinks() {
    return Array.prototype.filter.call(grid.querySelectorAll('li a'), function (a) {
      return !a.parentElement.hidden;
    });
  }

  function preload(i) {
    var a = items[(i + items.length) % items.length];
    if (a) new Image().src = a.getAttribute('href');
  }

  function show(i) {
    current = (i + items.length) % items.length;
    var a = items[current];
    var thumb = a.querySelector('img');
    lbImg.classList.add('is-loading');
    lbImg.onload = function () { lbImg.classList.remove('is-loading'); };
    lbImg.src = a.getAttribute('href');
    lbImg.width = a.getAttribute('data-w');
    lbImg.height = a.getAttribute('data-h');
    lbImg.alt = thumb.alt;
    lbCaption.textContent = a.getAttribute('data-caption');
    lbCount.textContent = (current + 1) + ' / ' + items.length;
    preload(current + 1);
    preload(current - 1);
  }

  function openAt(link) {
    items = visibleLinks();
    lastFocus = link;
    show(items.indexOf(link));
    if (typeof lb.showModal === 'function') lb.showModal();
    else lb.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
  }

  function closeLb() {
    if (lb.open && typeof lb.close === 'function') lb.close();
    else lb.removeAttribute('open');
  }

  lb.addEventListener('close', function () {
    document.documentElement.style.overflow = '';
    lbImg.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  });

  grid.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;
    e.preventDefault();
    openAt(link);
  });

  lb.querySelector('[data-lb-prev]').addEventListener('click', function () { show(current - 1); });
  lb.querySelector('[data-lb-next]').addEventListener('click', function () { show(current + 1); });
  lb.querySelector('[data-lb-close]').addEventListener('click', closeLb);

  // Close when tapping the dark area around the photo
  lb.addEventListener('click', function (e) {
    if (e.target === lb || e.target.classList.contains('lb-stage')) closeLb();
  });

  lb.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
  });

  // Swipe left/right on touch screens
  var startX = null, startY = null;
  lb.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
