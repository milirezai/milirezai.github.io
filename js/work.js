/* =====================================================================
   WORK.JS — shared behavior for project detail pages.
   Mirrors the logic in index.html's inline <script>: language toggle,
   theme toggle, scroll-reveal, and the drag + auto ping-pong scroll
   row (used here for the "Package stats" row).
   Each work-*.html page sets window.PKG_REPO to its GitHub repo name
   before loading this file, then calls initPackageStats().
===================================================================== */

document.addEventListener('DOMContentLoaded', function(){
  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
});

// ---------- Reveal sections on scroll ----------
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    var items = document.querySelectorAll('.reveal');
    if(!items.length) return;
    if(!('IntersectionObserver' in window)){
      items.forEach(function(el){ el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });
    items.forEach(function(el){ io.observe(el); });
  });
})();

// ---------- Language toggle ----------
document.addEventListener('DOMContentLoaded', function(){
  var langBtns = document.querySelectorAll('.lang-btn');
  function setLang(lang){
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en]').forEach(function(el){
      el.textContent = el.getAttribute('data-' + lang);
    });
    langBtns.forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    try{ localStorage.setItem('lang', lang); }catch(e){}
  }
  langBtns.forEach(function(btn){
    btn.addEventListener('click', function(){ setLang(btn.getAttribute('data-lang')); });
  });
});

// ---------- Theme toggle ----------
(function(){
  function currentTheme(){ return document.documentElement.getAttribute('data-theme') || 'dark'; }
  function applyThemeIcons(theme){
    document.querySelectorAll('.icon-moon').forEach(function(el){ el.style.display = theme === 'dark' ? 'block' : 'none'; });
    document.querySelectorAll('.icon-sun').forEach(function(el){ el.style.display = theme === 'light' ? 'block' : 'none'; });
  }
  document.addEventListener('DOMContentLoaded', function(){
    applyThemeIcons(currentTheme());
    document.querySelectorAll('.theme-toggle-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try{ localStorage.setItem('theme', next); }catch(e){}
        applyThemeIcons(next);
      });
    });
  });
})();

// ---------- Drag-to-scroll + auto ping-pong scroll for horizontal rows ----------
function makeScrollRow(el, opts){
  opts = opts || {};
  var auto = !!opts.auto, speed = opts.speed || 0.45, resumeDelay = opts.resumeDelay || 1400;
  if(!el) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDown = false, moved = false, startX = 0, startScroll = 0;
  var paused = false, resumeTimer = null, direction = 1;

  function loop(){
    if(auto && !reduceMotion && !paused && !isDown){
      var max = el.scrollWidth - el.clientWidth;
      el.scrollLeft += speed * direction;
      if(el.scrollLeft >= max){ el.scrollLeft = max; direction = -1; }
      else if(el.scrollLeft <= 0){ el.scrollLeft = 0; direction = 1; }
    }
    requestAnimationFrame(loop);
  }
  if(auto) requestAnimationFrame(loop);

  el.addEventListener('pointerdown', function(e){
    isDown = true; moved = false;
    startX = e.clientX; startScroll = el.scrollLeft;
    el.classList.add('dragging');
    try{ el.setPointerCapture(e.pointerId); }catch(err){}
    if(resumeTimer) clearTimeout(resumeTimer);
    paused = true;
  });
  el.addEventListener('pointermove', function(e){
    if(!isDown) return;
    var dx = e.clientX - startX;
    if(Math.abs(dx) > 3) moved = true;
    el.scrollLeft = startScroll - dx;
  });
  function endDrag(){
    if(!isDown) return;
    isDown = false;
    el.classList.remove('dragging');
    if(moved){
      var suppressClick = function(ev){ ev.preventDefault(); ev.stopPropagation(); };
      el.addEventListener('click', suppressClick, { capture:true, once:true });
    }
    if(auto){
      resumeTimer = setTimeout(function(){ paused = false; }, resumeDelay);
    }
  }
  el.addEventListener('pointerup', endDrag);
  el.addEventListener('pointercancel', endDrag);
  el.addEventListener('pointerleave', function(){ if(isDown) endDrag(); });

  el.addEventListener('wheel', function(e){
    if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
      el.scrollLeft += e.deltaY;
      e.preventDefault();
      if(auto){
        if(resumeTimer) clearTimeout(resumeTimer);
        paused = true;
        resumeTimer = setTimeout(function(){ paused = false; }, resumeDelay);
      }
    }
  }, { passive:false });
}

// ---------- Package stats: live GitHub repo data + auto/drag scroll row ----------
function initPackageStats(repo){
  document.addEventListener('DOMContentLoaded', function(){
    var row = document.getElementById('pkg-stats-row');
    makeScrollRow(row, { auto:true, speed:0.45 });

    function setField(field, value){
      document.querySelectorAll('[data-field="' + field + '"]').forEach(function(el){ el.textContent = value; });
    }
    fetch('https://api.github.com/repos/milirezai/' + repo, { headers:{ 'Accept':'application/vnd.github+json' } })
      .then(function(res){ if(!res.ok) throw new Error('repo fetch failed'); return res.json(); })
      .then(function(data){
        setField('stars', data.stargazers_count ?? '–');
        setField('forks', data.forks_count ?? '–');
        setField('issues', data.open_issues_count ?? '–');
        setField('updated', data.pushed_at ? new Date(data.pushed_at).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' }) : '–');
      })
      .catch(function(){
        var note = document.getElementById('pkg-stats-note');
        if(note) note.textContent = "Couldn't reach the GitHub API right now — refresh to try again.";
      });
  });
}
