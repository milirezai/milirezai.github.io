milad-site — publishing instructions
=====================================

STRUCTURE
  index.html               Main portfolio (dark/light, EN/FA; 2 open-source packages)
  work-ticketflow.html     Project detail page — ticketFlow
  work-milipay.html        Project detail page — MiliPay
  work-milirulepilot.html  Project detail page — MiliRulePilot
  terminal.html            Interactive terminal-mode version (English only)
  css/                     One stylesheet per page (index.css, terminal.css, ...)
  js/                      One script per page (index.js, terminal.js, ...)

Each HTML file only has markup; its styling lives in the matching file
under css/, its behavior in the matching file under js/. Every CSS and
JS file starts with a comment explaining what's in it and where to make
changes, so you can edit or extend things without digging through the
whole file. Visible text (English/Persian copy) stays in the HTML files
via data-en/data-fa attributes, so wording changes never require
touching CSS or JS.

TO PUBLISH ON GITHUB PAGES
  1. Add your resume as resume.pdf in the same folder as these files
     (the "resume" command / button won't work without it).
  2. Create a GitHub repo named exactly:  milirezai.github.io
  3. Push everything in this folder (including subfolders and
     resume.pdf) to that repo's main branch.
  4. In the repo Settings -> Pages, set the source to the main branch.
  5. Your site will be live at https://milirezai.github.io

TERMINAL MODE
  - A small terminal icon in the toggle row (next to the theme switch)
    on index.html and every project page opens terminal.html.
  - Terminal mode is English-only. Type "exit" (or "quit") to go back
    to index.html.
  - Commands: help, about, skills, projects [name], experience, stack,
    architecture, now, github, resume, contact, whoami, history, clear,
    theme <dark|light>, neofetch, exit
  - Unknown commands print a real bash-style "command not found".
  - All terminal text lives in the `C` object near the top of
    js/terminal.js — edit there to change wording or add commands.
