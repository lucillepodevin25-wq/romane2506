const pageNames = ['lettre', 'fleur', 'coeur', 'mots', 'amour'];
const crosswordWords = [
  { answer: 'ROMANE', clue: 'La plus belle fille du monde', row: 0, column: 7, vertical: true },
  { answer: 'LUCILLE', clue: 'Celle que tu aimes', row: 5, column: 1, vertical: false },
  { answer: 'CANTINE', clue: 'Là où on s’est rencontrées', row: 5, column: 3, vertical: true },
  { answer: 'AMOUR', clue: 'Ce qu’il y a entre nous', row: 0, column: 3, vertical: false },
  { answer: 'ROSE', clue: 'Ta couleur préférée', row: 11, column: 0, vertical: false },
  { answer: 'CERISE', clue: 'Mon fruit préféré', row: 9, column: 0, vertical: false }
];
const crosswordCells = new Map();
let activeClue = 0;
let crosswordSolved = false;
const petalMessages = [
  'J’aime ton sourire, surtout quand il arrive sans prévenir.',
  'J’aime ces petits moments qui deviennent grands avec toi.',
  'J’aime pouvoir être moi-même à tes côtés.',
  'J’aime ta douceur, et tout ce qui fait de toi… toi.',
  'J’aime penser à toutes nos aventures à venir.',
  'Et surtout, je t’aime. Passionnément.'
];
let removedPetals = 0;
let discoveredMessages = [];
let heartFound = false;
let secretHeartIndex = Math.floor(Math.random() * 6);
let storyUnlocked = false;
const secretForm = document.getElementById('secret-form');
const secretCode = document.getElementById('secret-code');
const secretFeedback = document.getElementById('secret-feedback');
const unlockButton = document.getElementById('unlock-button');

secretCode.addEventListener('input', () => {
  secretCode.value = secretCode.value.replace(/[^0-9]/g, '').slice(0, 3);
  secretCode.removeAttribute('aria-invalid');
  secretFeedback.textContent = '';
});

secretForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (unlockButton.disabled || !secretForm.reportValidity()) return;
  unlockButton.disabled = true;
  secretFeedback.textContent = 'Le cadenas écoute ton petit secret…';
  try {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secretCode.value));
    const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    if (fingerprint !== '6566230e3a3ce3774c1bbc7c18b590ae0f457bbcd511e90e3e7dca2a02e7addc') {
      secretFeedback.textContent = 'Pas tout à fait… Repense à notre toute première date.';
      secretCode.setAttribute('aria-invalid', 'true');
      secretCode.focus();
      secretCode.select();
      unlockButton.disabled = false;
      return;
    }
    secretCode.value = '';
    secretCode.disabled = true;
    document.getElementById('secret-padlock').classList.add('unlocked');
    secretFeedback.textContent = 'C’est bien notre secret. Notre histoire s’ouvre à toi…';
    window.setTimeout(() => {
      storyUnlocked = true;
      location.hash = 'lettre';
      showPage();
      document.getElementById('letter-title').focus({ preventScroll: true });
      rainHearts(12);
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
  } catch {
    secretFeedback.textContent = 'Le cadenas n’a pas pu s’ouvrir. Réessaie depuis la version HTTPS du site.';
    unlockButton.disabled = false;
  }
});

function showPage() {
  const requestedPage = location.hash.slice(1);
  let pageName = storyUnlocked ? (pageNames.includes(requestedPage) ? requestedPage : 'lettre') : 'secret';
  if (pageName === 'amour' && !crosswordSolved) {
    pageName = 'mots';
    history.replaceState(null, '', '#mots');
  }
  document.querySelector('.chapter-nav').hidden = !storyUnlocked;
  document.querySelector('.brand').href = storyUnlocked ? '#lettre' : '#secret';
  document.querySelectorAll('.page').forEach(page => {
    page.hidden = page.id !== pageName;
    page.classList.toggle('active', page.id === pageName);
  });
  document.querySelectorAll('.chapter-link').forEach(link => {
    const active = link.hash === `#${pageName}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  document.title = `${storyUnlocked ? ['La lettre', 'La fleur', 'Mon cœur', 'Les mots de nous', 'Je t’aime'][pageNames.indexOf(pageName)] : 'Notre petit secret'} — Un mois de nous`;
  if (requestedPage) {
    document.querySelector(`#${pageName} h1`).focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

document.getElementById('open-envelope').addEventListener('click', () => {
  document.getElementById('envelope-wrap').classList.add('open');
  document.getElementById('open-envelope').setAttribute('aria-expanded', 'true');
  document.getElementById('love-letter').setAttribute('aria-hidden', 'false');
  document.getElementById('envelope-hint').textContent = 'Une lettre écrite avec le cœur, rien que pour toi.';
  document.getElementById('letter-next').disabled = false;
});

document.querySelectorAll('[data-next]').forEach(button => {
  button.addEventListener('click', () => { location.hash = button.dataset.next; });
});

function createPetals() {
  const petals = document.getElementById('petals');
  petals.replaceChildren();
  petalMessages.forEach((message, index) => {
    const petal = document.createElement('button');
    petal.className = 'petal';
    petal.style.setProperty('--angle', `${index * 60}deg`);
    petal.setAttribute('aria-label', `Effeuiller le pétale ${index + 1} et découvrir son message`);
    petal.addEventListener('click', () => {
      petal.disabled = true;
      petal.classList.add('plucked');
      removedPetals += 1;
      discoveredMessages.push(message);
      const messages = document.getElementById('flower-messages');
      messages.replaceChildren();
      const currentMessage = document.createElement('p');
      currentMessage.textContent = message;
      messages.append(currentMessage);
      if (discoveredMessages.length > 1) {
        const history = document.createElement('p');
        history.className = 'message-history';
        history.textContent = discoveredMessages.slice(0, -1).join(' · ');
        messages.append(history);
      }
      document.getElementById('petal-counter').textContent = removedPetals === 6 ? 'Tous les pétales sont partis. Mon amour, lui, reste.' : `${6 - removedPetals} petits secrets à découvrir`;
      if (removedPetals === 6) document.getElementById('flower-next').disabled = false;
    }, { once: true });
    petals.append(petal);
  });
}

function heartSvg(className = '') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 64 60');
  svg.setAttribute('aria-hidden', 'true');
  if (className) svg.setAttribute('class', className);
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#heart');
  svg.append(use);
  return svg;
}

function createHeartPapers() {
  const papers = document.getElementById('heart-papers');
  papers.replaceChildren();
  const colors = ['#ead3c7', '#d8dfc9', '#f0d5d0', '#eadfbd', '#e2c9c4', '#d9dfd2'];
  const tilts = [-12, 8, -6, 7, -8, 12];
  for (let index = 0; index < 6; index += 1) {
    const slot = document.createElement('div');
    slot.className = 'paper-slot';
    const cover = document.createElement('button');
    cover.className = 'heart-paper';
    cover.style.setProperty('--paper-color', colors[index]);
    cover.style.setProperty('--tilt', `${tilts[index]}deg`);
    cover.setAttribute('aria-label', `Soulever le papier en cœur ${index + 1}`);
    cover.append(heartSvg());
    const number = document.createElement('span');
    number.textContent = `0${index + 1}`;
    cover.append(number);
    cover.addEventListener('click', () => {
      cover.classList.add('lifted');
      cover.disabled = true;
      if (index === secretHeartIndex) {
        slot.prepend(heartSvg('hidden-heart'));
        heartFound = true;
        const message = document.getElementById('found-message');
        message.classList.add('found');
        message.firstElementChild.textContent = 'Bravo tu as trouvé mon cœur, mais en réalité tu n’avais pas besoin de chercher, tu l’as déjà.';
        document.getElementById('heart-next').disabled = false;
        rainHearts(12);
      } else {
        const empty = document.createElement('span');
        empty.className = 'empty-paper';
        empty.textContent = 'encore…';
        slot.prepend(empty);
        if (!heartFound) document.getElementById('found-message').firstElementChild.textContent = 'Pas ici… mais mon cœur n’est jamais bien loin de toi.';
      }
    }, { once: true });
    slot.append(cover);
    papers.append(slot);
  }
}

function rainHearts(count) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rain = document.getElementById('heart-rain');
  if (rain.childElementCount > 70) return;
  for (let index = 0; index < count; index += 1) {
    const heart = heartSvg('rain-heart');
    heart.style.setProperty('--left', `${Math.random() * 100}%`);
    heart.style.setProperty('--size', `${12 + Math.random() * 24}px`);
    heart.style.setProperty('--drift', `${Math.random() * 160 - 80}px`);
    heart.style.setProperty('--duration', `${3 + Math.random() * 2}s`);
    heart.style.setProperty('--color', ['#c98f91', '#e2b8aa', '#aab697'][index % 3]);
    heart.style.animationDelay = `${Math.random() * .6}s`;
    heart.addEventListener('animationend', () => heart.remove(), { once: true });
    rain.append(heart);
  }
}

document.getElementById('love-button').addEventListener('click', () => {
  rainHearts(28);
  document.getElementById('love-hint').textContent = 'Tous ces cœurs, et le mien, sont pour toi.';
});

document.getElementById('replay').addEventListener('click', () => {
  removedPetals = 0;
  discoveredMessages = [];
  heartFound = false;
  secretHeartIndex = Math.floor(Math.random() * 6);
  document.getElementById('envelope-wrap').classList.remove('open');
  document.getElementById('open-envelope').setAttribute('aria-expanded', 'false');
  document.getElementById('love-letter').setAttribute('aria-hidden', 'true');
  document.getElementById('envelope-hint').textContent = 'Clique sur l’enveloppe pour découvrir ma lettre';
  document.querySelectorAll('[data-next]').forEach(button => { button.disabled = true; });
  document.getElementById('flower-messages').innerHTML = '<p>Un pétale, une pensée pour toi.</p>';
  document.getElementById('petal-counter').textContent = '6 petits secrets à découvrir';
  document.getElementById('found-message').classList.remove('found');
  document.getElementById('found-message').firstElementChild.textContent = 'À toi de jouer, mon amour…';
  document.getElementById('love-hint').textContent = 'Appuie sur mon cœur. Il bat pour toi.';
  document.getElementById('heart-rain').replaceChildren();
  resetCrossword();
  createPetals();
  createHeartPapers();
  location.hash = 'lettre';
});

function wordCells(word) {
  return Array.from(word.answer, (_, index) => crosswordCells.get(`${word.row + (word.vertical ? index : 0)},${word.column + (word.vertical ? 0 : index)}`));
}

function wordIsSolved(word) {
  return wordCells(word).map(cell => cell.input.value).join('') === word.answer;
}

function renderClue() {
  const word = crosswordWords[activeClue];
  document.getElementById('clue-number').textContent = `Mot ${activeClue + 1}`;
  document.getElementById('clue-text').textContent = word.clue;
  document.getElementById('clue-direction').textContent = `${word.answer.length} lettres · ${word.vertical ? 'Vertical ↓' : 'Horizontal →'}`;
  document.getElementById('clue-solved').textContent = wordIsSolved(word) ? 'Ce petit secret est trouvé !' : '';
  document.getElementById('clue-pagination').textContent = `${activeClue + 1} / 6`;
  document.getElementById('previous-clue').disabled = activeClue === 0;
  document.getElementById('next-clue').disabled = activeClue === crosswordWords.length - 1;
  crosswordCells.forEach(cell => cell.element.classList.toggle('selected', cell.words.includes(activeClue)));
}

function updateCrossword(checkErrors = false) {
  const solvedWords = crosswordWords.filter(wordIsSolved);
  crosswordCells.forEach(cell => {
    const correct = cell.input.value === cell.letter;
    const incorrect = checkErrors && Boolean(cell.input.value) && !correct;
    cell.element.classList.toggle('solved', cell.words.some(index => wordIsSolved(crosswordWords[index])));
    cell.element.classList.toggle('incorrect', incorrect);
    cell.input.setAttribute('aria-invalid', String(incorrect));
  });
  const complete = solvedWords.length === crosswordWords.length;
  const firstCompletion = complete && !crosswordSolved;
  crosswordSolved = complete;
  document.getElementById('crossword-next').disabled = !complete;
  const feedback = document.getElementById('crossword-feedback');
  feedback.textContent = complete ? '6 / 6. Tu connais tous nos petits secrets. La dernière surprise t’attend…' : `${solvedWords.length} / 6 mots trouvés. ${checkErrors ? 'Complète les cases vides et revois les lettres rosées.' : 'Notre histoire se dessine…'}`;
  renderClue();
  if (firstCompletion) rainHearts(18);
}

function createCrossword() {
  crosswordWords.forEach((word, wordIndex) => {
    Array.from(word.answer).forEach((letter, index) => {
      const row = word.row + (word.vertical ? index : 0);
      const column = word.column + (word.vertical ? 0 : index);
      const cellKey = `${row},${column}`;
      if (!crosswordCells.has(cellKey)) crosswordCells.set(cellKey, { letter, words: [], row, column, starts: [] });
      const cell = crosswordCells.get(cellKey);
      cell.words.push(wordIndex);
      if (index === 0) cell.starts.push(wordIndex + 1);
    });
  });
  const grid = document.getElementById('crossword-grid');
  crosswordCells.forEach(cell => {
    const element = document.createElement('label');
    element.className = 'crossword-cell';
    element.style.gridRow = cell.row + 1;
    element.style.gridColumn = cell.column + 1;
    if (cell.starts.length) {
      const number = document.createElement('span');
      number.className = 'cell-number';
      number.textContent = cell.starts.join('/');
      element.append(number);
    }
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('autocapitalize', 'characters');
    input.setAttribute('aria-label', `Ligne ${cell.row + 1}, colonne ${cell.column + 1}, mot${cell.words.length > 1 ? 's' : ''} ${cell.words.map(index => index + 1).join(' et ')}`);
    input.addEventListener('focus', () => {
      if (!cell.words.includes(activeClue)) activeClue = cell.words[0];
      input.select();
      renderClue();
    });
    input.addEventListener('input', () => {
      input.value = input.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
      updateCrossword();
      if (input.value) {
        const cells = wordCells(crosswordWords[activeClue]);
        cells[cells.indexOf(cell) + 1]?.input.focus();
      }
    });
    input.addEventListener('keydown', event => {
      const directions = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (directions[event.key]) {
        event.preventDefault();
        const [rowChange, columnChange] = directions[event.key];
        crosswordCells.get(`${cell.row + rowChange},${cell.column + columnChange}`)?.input.focus();
      } else if (event.key === 'Backspace' && !input.value) {
        event.preventDefault();
        const cells = wordCells(crosswordWords[activeClue]);
        const previous = cells[cells.indexOf(cell) - 1];
        if (previous) { previous.input.value = ''; previous.input.focus(); updateCrossword(); }
      }
    });
    cell.element = element;
    cell.input = input;
    element.append(input);
    grid.append(element);
  });
  renderClue();
}

function setNotebookOpen(open) {
  document.getElementById('open-notebook').hidden = open;
  document.getElementById('open-notebook').setAttribute('aria-expanded', String(open));
  document.getElementById('notebook-pages').hidden = !open;
  if (open) { renderClue(); document.getElementById('close-notebook').focus({ preventScroll: true }); }
  else document.getElementById('open-notebook').focus({ preventScroll: true });
}

function resetCrossword() {
  activeClue = 0;
  crosswordSolved = false;
  crosswordCells.forEach(cell => { cell.input.value = ''; });
  document.getElementById('open-notebook').hidden = false;
  document.getElementById('open-notebook').setAttribute('aria-expanded', 'false');
  document.getElementById('notebook-pages').hidden = true;
  updateCrossword();
}

document.getElementById('open-notebook').addEventListener('click', () => setNotebookOpen(true));
document.getElementById('close-notebook').addEventListener('click', () => setNotebookOpen(false));
function turnClue(direction) {
  activeClue = Math.max(0, Math.min(crosswordWords.length - 1, activeClue + direction));
  renderClue();
  const page = document.getElementById('clue-page');
  if (page.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    page.animate([
      { transform: `perspective(500px) rotateY(${direction * 25}deg)`, opacity: .3 },
      { transform: 'perspective(500px) rotateY(0deg)', opacity: 1 }
    ], { duration: 320, easing: 'ease-out' });
  }
}

document.getElementById('previous-clue').addEventListener('click', () => turnClue(-1));
document.getElementById('next-clue').addEventListener('click', () => turnClue(1));
document.getElementById('write-word').addEventListener('click', () => {
  const cells = wordCells(crosswordWords[activeClue]);
  (cells.find(cell => !cell.input.value) || cells[0]).input.focus();
});
document.getElementById('check-crossword').addEventListener('click', () => updateCrossword(true));

function closeMusic() {
  document.getElementById('music-panel').hidden = true;
  document.getElementById('music-player').replaceChildren();
  document.getElementById('sound-toggle').setAttribute('aria-expanded', 'false');
  document.getElementById('sound-toggle').focus();
}

document.getElementById('sound-toggle').addEventListener('click', () => {
  const panel = document.getElementById('music-panel');
  if (!panel.hidden) { closeMusic(); return; }
  const player = document.createElement('iframe');
  player.src = 'https://open.spotify.com/embed/track/5TTGoX70AFrTvuEtqHK37S?utm_source=generator';
  player.title = 'No. 1 Party Anthem — Arctic Monkeys, lecteur Spotify';
  player.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  player.referrerPolicy = 'strict-origin-when-cross-origin';
  document.getElementById('music-player').replaceChildren(player);
  panel.hidden = false;
  document.getElementById('sound-toggle').setAttribute('aria-expanded', 'true');
  document.getElementById('music-close').focus();
});
document.getElementById('music-close').addEventListener('click', closeMusic);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !document.getElementById('music-panel').hidden) closeMusic();
});

window.addEventListener('hashchange', showPage);
createPetals();
createHeartPapers();
createCrossword();
showPage();
