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

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
