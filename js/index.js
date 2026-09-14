/* =====================================================================
   INDEX.JS — behavior for the main portfolio page (hero, about, skills, work, GitHub stats, now, FAQ, contact).
   Typically: theme toggle (persists to localStorage), EN/FA language
   toggle, and (where relevant) a live fetch of GitHub stats/stars.
   Visible TEXT lives in index.html itself, not here — edit the HTML
   to change wording.
===================================================================== */

document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Language toggle ----------
const btnEn = document.getElementById('btn-en');
const btnFa = document.getElementById('btn-fa');

function setLang(lang){
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en]').forEach(el=>{
    el.textContent = el.getAttribute('data-' + lang);
  });
  btnEn.classList.toggle('active', lang==='en');
  btnFa.classList.toggle('active', lang==='fa');
  localStorage.setItem('lang', lang); // note: falls back gracefully if unavailable
}
btnEn.addEventListener('click', ()=>setLang('en'));
btnFa.addEventListener('click', ()=>setLang('fa'));

// ---------- Live GitHub data ----------
async function loadGithub(){
  try{
    const res = await fetch('https://api.github.com/users/milirezai');
    if(!res.ok) throw new Error('gh user fetch failed');
    const data = await res.json();
    document.getElementById('gh-repos').textContent = data.public_repos ?? '–';
    document.getElementById('gh-followers').textContent = data.followers ?? '–';
    document.getElementById('gh-following').textContent = data.following ?? '–';
    if(data.created_at){
      document.getElementById('gh-since').textContent = new Date(data.created_at).getFullYear();
    }
  }catch(e){
    document.getElementById('gh-note').textContent = "Couldn't reach the GitHub API right now — refresh to try again.";
  }
}
async function loadRepoStars(repo, elId){
  try{
    const res = await fetch(`https://api.github.com/repos/milirezai/${repo}`);
    if(!res.ok) throw new Error('repo fetch failed');
    const data = await res.json();
    document.getElementById(elId).textContent = '★ ' + (data.stargazers_count ?? 0);
  }catch(e){
    document.getElementById(elId).textContent = '★ –';
  }
}
loadGithub();
loadRepoStars('ticketFlow', 'stars-ticketflow');
loadRepoStars('milipay', 'stars-milipay');
loadRepoStars('milirulepilot', 'stars-milirulepilot');

// ---------- Contact form -> mailto ----------
const CONTACT_EMAIL = 'miladrezaix@gmail.com';
document.getElementById('contact-form').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const message = document.getElementById('cf-message').value.trim();
  const subject = encodeURIComponent(`Portfolio contact from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

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
