// Fisher–Yates shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Image list (exact filenames from images/ folder)
const imageFiles = [
  'CAT.png', 'DOG.png', 'SUN.png', 'CAR.png',
  'LIAM.jpg', 'ELENA.jpg', 'MOM.jpg', 'DAD.jpg', 'MAMAN.jpg', 'BABA.jpg',
  'NIMA.jpg', 'MARJAN.jpg', 'LOVE.png', 'PIG.png', 'COW.png', 'BAT.png',
  'BEE.png', 'EGG.png', 'JAM.png', 'CORN.png', 'BAG.png', 'PEN.png',
  'MAP.png', 'BOX.png', 'SKY.jpg', 'LEAF.png', 'TREE.png', 'SEA.png',
  'RAIN.png', 'HAT.png', 'MAHSA.jpg', 'UNCLE.jpg',
  'SILLY.png' // silly mode special image
];

// Words array (exclude SILLY.png from normal play)
const words = imageFiles
  .filter(name => name.toLowerCase() !== 'silly.png')
  .map(name => ({
    img: 'images/' + name,
    word: name.split('.')[0].toUpperCase()
  }));

let idx = 0;
let silly = false;
let showHint = false; // HINT button state

// Sounds
const clickSfx = new Audio('sounds/click.mp3');
const successSfx = new Audio('sounds/success.mp3');

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

function loadWord() {
  silly = false;
  document.getElementById('image').src = words[idx].img;
  document.getElementById('target-word').innerText = showHint ? words[idx].word : '';
  document.getElementById('drop-zone').innerText = '';
  document.getElementById('feedback').innerText = '';

  const lettersDiv = document.getElementById('letters');
  lettersDiv.innerHTML = '';
  words[idx].word
    .split('')
    .sort(() => 0.5 - Math.random())
    .forEach(l => createLetterButton(l));
  createBackspaceButton();
}

function createLetterButton(letter) {
  const btn = document.createElement('div');
  btn.className = 'letter';
  btn.innerText = letter;
  btn.onclick = () => {
    playSound(clickSfx);
    const zone = document.getElementById('drop-zone');
    zone.innerText += letter;

    if (silly) checkSillyWord(zone.innerText);
  };
  document.getElementById('letters').appendChild(btn);
}

function createBackspaceButton() {
  const btn = document.createElement('div');
  btn.className = 'letter';
  btn.style.background = '#FF9800';
  btn.innerText = '⌫';
  btn.onclick = () => {
    playSound(clickSfx);
    const zone = document.getElementById('drop-zone');
    zone.innerText = zone.innerText.slice(0, -1);
  };
  document.getElementById('letters').appendChild(btn);
}

function createSpaceButton() {
  const btn = document.createElement('div');
  btn.className = 'letter';
  btn.style.background = '#9E9E9E';
  btn.innerText = '␣';
  btn.onclick = () => {
    playSound(clickSfx);
    const zone = document.getElementById('drop-zone');
    zone.textContent += ' ';
  };
  document.getElementById('letters').appendChild(btn);
}

function checkWord() {
  const formed = document.getElementById('drop-zone').innerText;
  if (silly) {
    document.getElementById('feedback').innerText = 'In Silly Mode, any word is okay!';
    return;
  }
  if (formed === words[idx].word) {
    document.getElementById('feedback').innerText = '✅ Great!';
    playSound(successSfx);
    speak(formed);
    launchConfetti();
  } else {
    document.getElementById('feedback').innerText = '❌ Try Again!';
    playSound(clickSfx);
  }
}

function nextWord() {
  if (showHint) toggleHint();
  idx = (idx + 1) % words.length;
  loadWord();
}

function toggleSillyMode() {
  silly = !silly;
  document.getElementById('drop-zone').innerText = '';
  document.getElementById('feedback').innerText = silly ? 'Silly Mode: Build any word!' : '';
  const lettersDiv = document.getElementById('letters');
  lettersDiv.innerHTML = '';
  if (silly) {
    document.getElementById('image').src = 'images/SILLY.png';
    document.getElementById('target-word').innerText = '';
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(createLetterButton);
    createBackspaceButton();
    createSpaceButton();
  } else {
    loadWord();
  }
}

function toggleHint() {
  showHint = !showHint;
  const btn = document.getElementById('hint-btn');
  btn.innerText = `Hint: ${showHint ? 'ON' : 'OFF'}`;
  btn.classList.toggle('hint-on', showHint);

  // Update word display only in normal mode
  if (!silly) {
    document.getElementById('target-word').innerText = showHint ? words[idx].word : '';
  }
}

function checkSillyWord(typedWord) {
  const match = words.find(w => w.word === typedWord);
  if (match) {
    playSound(successSfx);
    speak(typedWord);
    launchConfetti();

    // Show the matching image for 3 seconds, then revert
    document.getElementById('image').src = match.img;
    setTimeout(() => {
      if (silly) {
        document.getElementById('image').src = 'images/SILLY.png';
      }
    }, 3000);
  }
}

function sayWord() {
  const txt = silly ? document.getElementById('drop-zone').innerText || '???' : words[idx].word;
  playSound(clickSfx);
  speak(txt);
}

function speak(txt) {
  if (!txt) return;
  const u = new SpeechSynthesisUtterance(txt);
  speechSynthesis.speak(u);
}

function launchConfetti() {
  if (window.confetti) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

function preloadImages(files, callback) {
  let loaded = 0;
  files.forEach(file => {
    const img = new Image();
    img.src = 'images/' + file;
    img.onload = img.onerror = () => {
      loaded++;
      if (loaded === files.length) callback();
    };
  });
}

window.onload = () => {
  preloadImages(imageFiles, () => {
    shuffle(words);
    idx = 0;
    loadWord();
  });
};
