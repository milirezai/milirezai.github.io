/* =====================================================================
   TERMINAL.JS — behavior for the interactive terminal.
   Start here if you want to change something:
     - All visible TEXT (about, skills, projects, etc.) is in the `C`
       object below — edit that first for wording changes.
     - `runCommand()` is the command dispatcher — add a new command by
       adding a `case 'name':` there, plus its text in `C` above it.
     - `printNeofetch()` builds the boot info panel from C.neofetchRows.
   Styling lives in css/terminal.css, not here.
===================================================================== */

const screen = document.getElementById('screen');
const output = document.getElementById('output');
const input = document.getElementById('cmd-input');
const promptLabel = document.getElementById('prompt-label');

let theme = document.documentElement.getAttribute('data-theme') || 'dark';
let historyStack = [];
let historyIndex = -1;

screen.addEventListener('click', () => input.focus());
window.addEventListener('load', () => input.focus());

function esc(s){
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function printLine(html, cls){
  const div = document.createElement('div');
  div.className = 'line' + (cls ? ' ' + cls : '');
  div.innerHTML = html;
  output.appendChild(div);
}
function printBlank(){ printLine('&nbsp;'); }

function scrollToBottom(){
  screen.scrollTop = screen.scrollHeight;
}

// =====================================================================
// CONTENT — everything the terminal prints lives here. Edit freely:
// each key below is plain text/HTML shown for the matching command.
// =====================================================================
const C = {
  bootIntro: "Type <strong>help</strong> to see available commands.",
  unknown: (c) => `bash: ${esc(c)}: command not found`,
  hint: "Type <span class=\"accent\">help</span> for a list of commands.",

  // help table: [command, short description]
  help: [
    ['about',            'who I am'],
    ['skills',           'languages, frameworks, tools'],
    ['projects [name]',  'list projects, or show one in detail'],
    ['experience',       'work / project history so far'],
    ['stack',            'the tech stack, laid out plainly'],
    ['architecture',     'patterns I reach for, and why'],
    ['now',              'what I\'m currently working on'],
    ['github',           'live stats from github.com/milirezai'],
    ['resume',           'download my résumé (PDF)'],
    ['contact',          'how to reach me'],
    ['whoami',           '...'],
    ['history',          'commands you\'ve typed this session'],
    ['clear',            'clear the screen'],
    ['theme <dark|light>','switch color theme'],
    ['neofetch',         'system info, the fun way'],
    ['exit',             'leave terminal mode, back to the site'],
  ],

  about: [
    "Milad Rezai — backend developer working in PHP and Laravel.",
    "Based in Tehran, Iran. Self-taught, started programming in",
    "",
    "I learn just-in-time: I pick up a concept when a real project",
    "needs it, instead of studying syntax upfront. In about a year",
    "and nine months that's produced two open-source Laravel",
    "packages, plus a full team project — see <span class=\"accent\">projects</span>.",
  ],

  skills: [
    "Language / Framework   PHP, Laravel",
    "Data / Infra            MySQL, Redis, Docker, Linux",
    "Tools                    Git, REST APIs",
  ],

  // "projects" with no argument
  projectsList: [
    "Three projects, including two open-source packages. Type <span class=\"accent\">projects &lt;name&gt;</span> for details:",
    "",
    "  ticketFlow       Laravel REST API ticketing & support system",
    "  milipay          Laravel payment gateway package (Zarinpal, Zibal)",
    "  milirulepilot    Laravel business rule / decision engine",
  ],
  projectsUnknown: (n) => `No project named "${esc(n)}". Try: ticketFlow, milipay, milirulepilot`,

  // "projects <name>" detail views
  project_ticketflow: [
    "<strong>ticketFlow</strong>  —  github.com/milirezai/ticketFlow",
    "",
    "A Laravel REST API ticketing and support system: auth, roles",
    "and permissions, ticket management, notifications, reports,",
    "and SLA-based escalation for tickets left unanswered.",
    "",
    "Built with a teammate. I managed branches, pull requests,",
    "code review, and divided the work between us.",
  ],
  project_milipay: [
    "<strong>MiliPay</strong>  —  github.com/milirezai/milipay",
    "",
    "A Laravel package for integrating payment gateways (Zarinpal,",
    "Zibal), built on contract-based design and an adapter pattern",
    "for normalizing gateway responses. Published on Packagist.",
    "",
    "Includes FastDriver: a scheduled job that probes sandbox",
    "gateways and auto-selects the fastest-responding one when",
    "no driver is set explicitly.",
    "",
    "GitHub stars: <span id=\"stars-milipay\">loading…</span>",
  ],
  project_milirulepilot: [
    "<strong>MiliRulePilot</strong>  —  github.com/milirezai/milirulepilot",
    "",
    "An early-stage Laravel business rule and decision engine.",
    "In progress: fixing a naming typo in the core evaluation",
    "method, adding AND/OR condition grouping, and expanding the",
    "set of comparison operators.",
  ],

  now: [
    "- Maintaining MiliPay: driver-management Artisan commands,",
    "  reviewing contributions.",
    "- Building out MiliRulePilot: AND/OR condition grouping.",
    "- Open to full-time backend roles, remote or in Tehran.",
  ],

  experience: [
    "No formal employment yet — everything here comes from",
    "independent, project-driven work.",
    "",
    "  Aug 2024 → now   Self-taught. Picked up PHP/Laravel by",
    "                   building real projects, not by studying",
    "                   syntax upfront.",
    "  Shipped          2 open-source Laravel packages",
    "                   (see <span class=\"accent\">projects</span>).",
    "  ticketFlow       2-person team project — I managed",
    "                   branches, pull requests, and code review.",
    "",
    "Currently looking for a first full-time backend role.",
  ],

  stack: [
    "Language     PHP",
    "Framework    Laravel",
    "Database     MySQL",
    "Cache        Redis",
    "Containers   Docker",
    "OS           Linux",
    "VCS          Git",
    "API style    REST",
  ],

  architecture: [
    "A few patterns I reach for on purpose, not by default:",
    "",
    "  - Contract-based design: code depends on interfaces, not",
    "    concrete classes, so a driver can be swapped without",
    "    touching callers. Used throughout MiliPay.",
    "  - Adapter pattern: normalizes different providers",
    "    (Zarinpal, Zibal) behind one consistent response shape.",
    "  - Roles and permissions kept out of controllers, in",
    "    ticketFlow.",
    "  - Explicit, boring code over clever abstractions — until",
    "    a second real use case actually justifies one.",
  ],

  contact: [
    "Email      <a href=\"mailto:miladrezaix@gmail.com\">miladrezaix@gmail.com</a>",
    "GitHub     <a href=\"https://github.com/milirezai\" target=\"_blank\" rel=\"noopener\">github.com/milirezai</a>",
    "LinkedIn   <a href=\"https://www.linkedin.com/in/milirezai\" target=\"_blank\" rel=\"noopener\">linkedin.com/in/milirezai</a>",
  ],

  resumeFetching: "Locating resume.pdf …",
  resumeOpening: "Found it — starting the download.",
  resumeMissing: "resume.pdf not found (not uploaded yet).",
  whoami: ["milad"],
  noHistory: "No commands yet.",
  exiting: "Leaving terminal mode…",
  themeSet: (t) => `Theme set to ${t}.`,
  themeUsage: "Usage: theme &lt;dark|light&gt;",
  sudo: "Nice try — permission denied.",

  // neofetch / boot info panel: [label, value]
  neofetchRows: [
    ['os',        'macOS'],
    ['shell',     'zsh'],
    ['editor',    'PhpStorm / VS Code'],
    ['backend',   'Laravel'],
    ['language',  'PHP'],
    ['database',  'MySQL / Redis'],
    ['packages',  '2 (MiliPay, MiliRulePilot)'],
    ['uptime',    '~1 year 9 months'],
  ],
};

function printNeofetch(){
  const b = document.createElement('div');
  b.className = 'banner';
  let html = `<div class="line accent">milad@backend</div><div class="line dim">-------------</div>`;
  C.neofetchRows.forEach(([k, v]) => {
    html += `<div class="row"><span class="k">${k}:</span><span>${v}</span></div>`;
  });
  b.innerHTML = html;
  output.appendChild(b);
}

function printBanner(){
  printNeofetch();
  printBlank();
  printLine(C.bootIntro);
  printBlank();
}

function printHelp(){
  const wrap = document.createElement('div');
  wrap.className = 'help-table';
  let html = '';
  C.help.forEach(([cmd, desc]) => {
    html += `<div class="row"><span class="c1">${esc(cmd)}</span><span class="dim">${esc(desc)}</span></div>`;
  });
  wrap.innerHTML = html;
  output.appendChild(wrap);
}

function printMultiline(lines){
  lines.forEach(l => printLine(l === '' ? '&nbsp;' : l));
}

// ---------------------- live GitHub data ----------------------
async function loadStars(repo, elementId){
  const el = document.getElementById(elementId);
  if(!el) return;
  try{
    const res = await fetch(`https://api.github.com/repos/milirezai/${repo}`, {
      headers: { 'Accept': 'application/vnd.github+json' },
      cache: 'no-store'
    });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    el.textContent = data.stargazers_count ?? '–';
  }catch(e){
    el.textContent = '–';
  }
}
async function printGithub(){
  const loading = document.createElement('div');
  loading.className = 'line dim';
  loading.textContent = 'Fetching GitHub stats...';
  output.appendChild(loading);

  try{
    const headers = { 'Accept': 'application/vnd.github+json' };
    const repos = ['ticketFlow','milipay','milirulepilot'];
    const responses = await Promise.all([
      fetch('https://api.github.com/users/milirezai', {headers, cache:'no-store'}),
      ...repos.map(repo => fetch(`https://api.github.com/repos/milirezai/${repo}`, {headers, cache:'no-store'}))
    ]);
    if(responses.some(r => !r.ok)) throw new Error('GitHub API request failed');

    const [user, ...repoData] = await Promise.all(responses.map(r => r.json()));
    const totalStars = repoData.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repoData.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    loading.remove();
    printLine('github:         github.com/milirezai');
    printLine(`public_repos:   ${user.public_repos ?? '–'}`);
    printLine(`followers:      ${user.followers ?? '–'}`);
    printLine(`following:      ${user.following ?? '–'}`);
    printLine(`featured_stars: ${totalStars}`);
    printLine(`featured_forks: ${totalForks}`);
    repoData.forEach((repo, i) => {
      printLine(`${repos[i].padEnd(15)}${repo.stargazers_count ?? 0} stars · ${repo.forks_count ?? 0} forks · ${repo.open_issues_count ?? 0} open issues`);
    });
    printLine(`member_since:   ${user.created_at ? new Date(user.created_at).getFullYear() : '–'}`);
  }catch(e){
    loading.textContent = 'Couldn\'t reach the GitHub API right now.';
    loading.className = 'line err';
    printLine('Check your internet connection or GitHub API rate limit, then run `github` again.', 'dim');
  }

  scrollToBottom();
}

// ---------------------- commands with side effects ----------------------
function setTheme(next){
  if(next !== 'dark' && next !== 'light'){ printLine(C.themeUsage, 'err'); return; }
  theme = next;
  document.documentElement.setAttribute('data-theme', theme);
  try{ localStorage.setItem('theme', theme); }catch(e){}
  printLine(C.themeSet(theme));
}

// ---------------------- titlebar theme toggle button ----------------------
(function(){
  const btn = document.getElementById('term-theme-toggle');
  if(!btn) return;
  btn.addEventListener('click', function(){
    setTheme(theme === 'dark' ? 'light' : 'dark');
  });
})();

function handleResume(){
  printLine(C.resumeFetching, 'dim');
  fetch('./resume.pdf', { method: 'HEAD' }).then(res => {
    if(res.ok){
      printLine(C.resumeOpening);
      const a = document.createElement('a');
      a.href = './resume.pdf';
      a.download = 'Milad-Rezai-Resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      printLine(C.resumeMissing, 'err');
    }
  }).catch(() => {
    printLine(C.resumeMissing, 'err');
  });
}

function handleExit(){
  printLine(C.exiting, 'dim');
  input.disabled = true;
  setTimeout(() => { window.location.href = 'index.html'; }, 550);
}

// ---------------------- command dispatcher ----------------------
// Add a new command by adding a `case 'name':` here, plus its text in C above.
function runCommand(raw){
  const cmd = raw.trim();
  // echo the typed command as a line
  const row = document.createElement('div');
  row.className = 'history-cmd';
  row.innerHTML = `<span class="p">${esc(promptLabel.textContent)}</span><span>${esc(cmd)}</span>`;
  output.appendChild(row);

  if(cmd === ''){ scrollToBottom(); return; }

  const parts = cmd.split(/\s+/);
  const base = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');

  switch(base){
    case 'help':
      printHelp();
      break;
    case 'about':
      printMultiline(C.about);
      break;
    case 'skills':
      printMultiline(C.skills);
      break;
    case 'projects': {
      const name = arg.toLowerCase().replace(/[^a-z]/g, '');
      if(!name){ printMultiline(C.projectsList); break; }
      const key = 'project_' + (name === 'milipay' ? 'milipay' : name === 'milirulepilot' ? 'milirulepilot' : name === 'ticketflow' ? 'ticketflow' : '');
      if(C[key]){
        printMultiline(C[key]);
        if(key === 'project_milipay') loadStars('milipay', 'stars-milipay');
      } else {
        printLine(C.projectsUnknown(arg), 'err');
      }
      break;
    }
    case 'experience':
      printMultiline(C.experience);
      break;
    case 'stack':
      printMultiline(C.stack);
      break;
    case 'architecture':
      printMultiline(C.architecture);
      break;
    case 'now':
      printMultiline(C.now);
      break;
    case 'history':
      if(historyStack.length === 0){
        printLine(C.noHistory, 'dim');
      } else {
        historyStack.forEach((c, i) => printLine(`${i + 1}  ${esc(c)}`));
      }
      break;
    case 'neofetch':
      printNeofetch();
      break;
    case 'exit':
    case 'quit':
      handleExit();
      break;
    case 'contact':
      printMultiline(C.contact);
      break;
    case 'resume':
      handleResume();
      break;
    case 'github':
      printGithub();
      break;
    case 'whoami':
      printMultiline(C.whoami);
      break;
    case 'theme':
      setTheme(arg.toLowerCase());
      break;
    case 'sudo':
      printLine(C.sudo, 'err');
      break;
    case 'clear':
    case 'cls':
      output.innerHTML = '';
      break;
    default:
      printLine(C.unknown(base), 'err');
      printLine(C.hint, 'dim');
  }
  scrollToBottom();
}

// ---------------------- input handling ----------------------
input.addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){
    const val = input.value;
    if(val.trim() !== ''){
      historyStack.push(val);
      historyIndex = historyStack.length;
    }
    input.value = '';
    runCommand(val);
  } else if(e.key === 'ArrowUp'){
    e.preventDefault();
    if(historyIndex > 0){ historyIndex--; input.value = historyStack[historyIndex]; }
  } else if(e.key === 'ArrowDown'){
    e.preventDefault();
    if(historyIndex < historyStack.length - 1){ historyIndex++; input.value = historyStack[historyIndex]; }
    else { historyIndex = historyStack.length; input.value = ''; }
  }
});

printBanner();
