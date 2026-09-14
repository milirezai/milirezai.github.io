/* =====================================================================
   WORK-TICKETFLOW.JS — behavior for the ticketFlow project detail page.
   Typically: theme toggle (persists to localStorage), EN/FA language
   toggle, and (where relevant) a live fetch of GitHub stats/stars.
   Visible TEXT lives in work-ticketflow.html itself, not here — edit the HTML
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
