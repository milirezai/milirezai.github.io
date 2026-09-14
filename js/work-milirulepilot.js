/* =====================================================================
   WORK-MILIRULEPILOT.JS — behavior for the MiliRulePilot project detail page.
   Typically: theme toggle (persists to localStorage), EN/FA language
   toggle, and (where relevant) a live fetch of GitHub stats/stars.
   Visible TEXT lives in work-milirulepilot.html itself, not here — edit the HTML
   to change wording.
===================================================================== */

function setLang(lang){
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en]').forEach(el=>{ el.textContent = el.getAttribute('data-' + lang); });
  document.getElementById('btn-en').classList.toggle('active', lang==='en');
  document.getElementById('btn-fa').classList.toggle('active', lang==='fa');
}
document.getElementById('btn-en').addEventListener('click', ()=>setLang('en'));
document.getElementById('btn-fa').addEventListener('click', ()=>setLang('fa'));

(function(){
  function currentTheme(){ return document.documentElement.getAttribute('data-theme') || 'dark'; }
  function applyThemeIcons(theme){
    var moon = document.getElementById('icon-moon');
    var sun = document.getElementById('icon-sun');
    if(moon) moon.style.display = theme === 'dark' ? 'block' : 'none';
    if(sun) sun.style.display = theme === 'light' ? 'block' : 'none';
  }
  applyThemeIcons(currentTheme());
  var btn = document.getElementById('theme-toggle');
  if(btn){
    btn.addEventListener('click', function(){
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try{ localStorage.setItem('theme', next); }catch(e){}
      applyThemeIcons(next);
    });
  }
})();
// ---------- Package stats ----------
(function(){
  const repo = 'milirulepilot';
  const snapshot = {"stars": 17, "installs": 4, "contributors": 1, "forks": 0, "php": ">= 8.2", "version": "v1.2.0", "laravel": "^12.0 · ^13.0", "issues": 0};
  const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=v ?? '—';};
  const fmt=v=>typeof v==='number'?v.toLocaleString():(v ?? '—');
  const render=d=>{
    set('pkg-stars',fmt(d.stars)); set('pkg-installs',fmt(d.installs));
    set('pkg-contributors',fmt(d.contributors)); set('pkg-forks',fmt(d.forks));
    set('pkg-php',d.php); set('pkg-version',d.version); set('pkg-laravel',d.laravel); set('pkg-issues',fmt(d.issues));
  };
  render(snapshot);
  async function load(){
    const ghHeaders={Accept:'application/vnd.github+json'};
    const [repoRes,contribRes,downloadsRes,packageRes]=await Promise.all([
      fetch(`https://api.github.com/repos/milirezai/${repo}`,{headers:ghHeaders,cache:'no-store'}),
      fetch(`https://api.github.com/repos/milirezai/${repo}/contributors?per_page=100&anon=true`,{headers:ghHeaders,cache:'no-store'}),
      fetch(`https://packagist.org/packages/milirezai/${repo}/downloads.json`,{cache:'no-store'}),
      fetch(`https://repo.packagist.org/p2/milirezai/${repo}.json`,{cache:'no-store'})
    ]);
    if(!repoRes.ok||!contribRes.ok||!downloadsRes.ok||!packageRes.ok) throw new Error('stats request failed');
    const [r,c,d,p]=await Promise.all([repoRes.json(),contribRes.json(),downloadsRes.json(),packageRes.json()]);
    const versions=p.packages?.[`milirezai/${repo}`]||[];
    const stable=versions.find(v=>v.version && !v.version.includes('-') && !v.version.startsWith('dev-'));
    if(!stable) throw new Error('stable package version not found');
    const laravel=stable.require?.['illuminate/support'] || '—';
    render({stars:r.stargazers_count,installs:d.downloads?.total ?? 0,contributors:Array.isArray(c)?c.length:0,forks:r.forks_count,php:stable.require?.php || '—',version:stable.version,laravel:laravel.replace(/\|\|/g,' · '),issues:r.open_issues_count});
  }
  load().catch(()=>{});
})();
