'use strict';

const D = window.PSPM_DATA;
const state = { paper: D.years[0] };
const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[character]));
const paperById = id => D.papers.find(paper => paper.id === id);

D.years.forEach((year, index) => {
  const button = document.createElement('button');
  button.id = 'year-' + index;
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-controls', 'year-panel');
  button.textContent = year;
  button.addEventListener('click', () => selectPaper(year));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % D.years.length;
    if (event.key === 'ArrowLeft') next = (index + D.years.length - 1) % D.years.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = D.years.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectPaper(D.years[next]);
      $('years').children[next].focus();
    }
  });
  $('years').append(button);
});

function selectPaper(id) {
  state.paper = id;
  render();
}

function paperMarkup(paper) {
  return `<div class="cardhead"><h2>Paper collection</h2><span class="badge good">Source reviewed</span></div>
    <div class="paper">
      <div class="docicon" aria-hidden="true">PDF</div>
      <h3>${esc(paper.title)}</h3>
      <p>Chemistry 1 · Semester I</p>
      <div class="paper-meta"><span>${paper.questions} questions</span><span>${paper.totalMarks} marks</span><span>2 hours</span></div>
      <div class="paper-actions">
        <a class="button" href="${paper.url}" target="_blank" rel="noopener">Open paper</a>
        <a class="button secondary" href="${paper.url}" download>Download PDF</a>
      </div>
    </div>
    <p class="note">${paper.pages} supplied PDF pages · All six question sections are present.</p>`;
}

function render() {
  const paper = paperById(state.paper);
  [...$('years').children].forEach((button, index) => {
    const active = D.years[index] === state.paper;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });
  const yearIndex = D.years.indexOf(state.paper);
  $('year-panel').setAttribute('aria-labelledby', 'year-' + yearIndex);
  $('paper-card').innerHTML = paper ? paperMarkup(paper) : setCollectionMarkup();
}

function setCollectionMarkup() {
  const older = D.papers.filter(paper => !paper.main);
  return `<div class="cardhead"><h2>PSPM EC015 2021/2022</h2><span class="badge good">Set 1 &amp; Set 2</span></div><div class="supplement-grid">${older.map((paper, index) => `<article class="supplement-item">
    <div class="docicon" aria-hidden="true">PDF</div><h3>Set ${index + 1}</h3>
    <p>${paper.totalMarks} marks · ${paper.questions} questions · ${paper.pages} PDF pages</p>
    <div class="paper-actions">
      <a class="button" href="${paper.url}" target="_blank" rel="noopener" aria-label="Open Set ${index + 1}">Open paper</a>
      <a class="button secondary" href="${paper.url}" download aria-label="Download Set ${index + 1} PDF">Download PDF</a>
    </div>
  </article>`).join('')}</div><p class="note">Filed under 2021/2022 as requested. The original supplied documents are labelled 2020/2021; the PDFs are preserved unchanged.</p>`;
}

function renderCoverage() {
  const reference = paperById('2024/2025');
  const tealBlueColours = ['#087c98', '#2399b8', '#126d91', '#45abc1', '#147f9d', '#07546b'];
  $('chapter-bars').innerHTML = D.chapters.map((chapter, index) => {
    const marks = reference.chapterMarks[chapter.id];
    const share = Number((marks / reference.totalMarks * 100).toFixed(2));
    return `<div class="chapterbar"><span class="chapname">${esc(chapter.name)}<small>Chapter ${chapter.id}</small></span><span class="bartrack" aria-hidden="true"><span class="barfill" style="background:${tealBlueColours[index]};width:${share / 30 * 100}%"></span></span><span class="barvalue">${share}%<small>${marks} marks</small></span></div>`;
  }).join('');
}

renderCoverage();
render();
