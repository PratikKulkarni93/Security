document.addEventListener('DOMContentLoaded', function () {
    var nav = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');
    var top = document.getElementById('top');

    if (toggle) toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    document.querySelectorAll('.nav__link').forEach(function (l) {
        l.addEventListener('click', function () { nav.classList.remove('open'); });
    });

    function onScroll() {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        if (top) top.classList.toggle('show', window.scrollY > 500);
    }
    window.addEventListener('scroll', onScroll); onScroll();
    if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

    // Scroll reveal
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
    }, { threshold: 0.14 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

    // Animated counters
    function animate(el) {
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var dec = target % 1 !== 0 ? 1 : 0, dur = 1600, t0 = null;
        function step(ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1);
            var val = target * (0.5 - Math.cos(Math.PI * p) / 2);
            el.textContent = prefix + val.toLocaleString(undefined, { maximumFractionDigits: dec }) + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = prefix + target.toLocaleString() + suffix;
        }
        requestAnimationFrame(step);
    }
    var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { animate(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

    // Web3Forms inquiry submit (no backend / no database)
    var form = document.getElementById('inquiryForm');
    if (form) {
        var statusEl = document.getElementById('formStatus');
        var success = document.getElementById('formSuccess');
        var btn = form.querySelector('.form-btn');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            statusEl.textContent = ''; statusEl.classList.remove('err');
            btn.classList.add('is-loading'); btn.disabled = true;
            var obj = {}; new FormData(form).forEach(function (v, k) { obj[k] = v; });
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(obj)
            })
                .then(function (r) { return r.json(); })
                .then(function (res) {
                    if (res.success) { form.style.display = 'none'; if (success) success.classList.add('show'); }
                    else { statusEl.textContent = res.message || 'Something went wrong. Please try again.'; statusEl.classList.add('err'); }
                })
                .catch(function () { statusEl.textContent = 'Network error. Please check your connection and try again.'; statusEl.classList.add('err'); })
                .finally(function () { btn.classList.remove('is-loading'); btn.disabled = false; });
        });
    }
});