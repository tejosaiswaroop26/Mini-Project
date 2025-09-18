const sentenceEl = document.getElementById("sentence");
const statsBox = document.getElementById("statsBox");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timerEl = document.getElementById("timer");

let quote = "";
let typedChars = [];
let startTime = null;
let timer;
let timeLeft = 60;

async function fetchQuote() {
  const res = await fetch("https://dummyjson.com/quotes/random");
  const data = await res.json();
  quote = data.quote.toLowerCase();
  renderSentence();
}

function renderSentence() {
  sentenceEl.innerHTML = "";
  let words = [];
  words = quote.split(" ");
  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement("span");
    wordSpan.classList.add("word");

    for (let i = 0; i < word.length; i++) {
      const charSpan = document.createElement("span");
      charSpan.textContent = word[i];
      charSpan.classList.add("char");
      wordSpan.appendChild(charSpan);
    }
    if (wordIndex < words.length - 1) {
      const spaceSpan = document.createElement("span");
      spaceSpan.textContent = " ";
      spaceSpan.classList.add("char");
      wordSpan.appendChild(spaceSpan);
    }

    sentenceEl.appendChild(wordSpan);
  });
  updateDisplay();
}

function updateDisplay() {
  const spans = sentenceEl.querySelectorAll(".char");
  let correctCount = 0;
 
  for (let i = 0; i < spans.length; i++) {
    const typed = typedChars[i];
    const original = quote[i];
 
    spans[i].className = "char";
 
    if (typed == null) {
      if (i === typedChars.length) {
        spans[i].classList.add("cursor");
      }
    }
    else if (typed === original) {
      spans[i].classList.add("correct");
      correctCount++;
    }
    else {
      spans[i].classList.add("incorrect");
    }
  }
  const elapsed = (Date.now() - startTime) / 1000;
  const wpm = Math.round((typedChars.length / 5) / (elapsed / 60));
  const accuracy = Math.round((correctCount / typedChars.length) * 100) || 0;
 
  wpmEl.textContent = isFinite(wpm) ? wpm : 0;
  accuracyEl.textContent = `${accuracy}%`;
}

function restartTest() {
  clearInterval(timer);
  typedChars = [];
  startTime = null;
  timeLeft = 60;
  timerEl.textContent = timeLeft;
  statsBox.classList.add("hidden");
  fetchQuote();
}

function showResults() {
  updateDisplay();
  statsBox.classList.remove("hidden");
  clearInterval(timer);
 
  const wpm = parseInt(wpmEl.textContent);
  const accuracy = parseInt(accuracyEl.textContent);
 
  let praise = "Nice work";
  if (wpm >= 60 && accuracy >= 95) {
    praise = "You're a typing legend";
  }
  else if (wpm >= 40) {
    praise = "Great speed";
  }
  else if (accuracy >= 90) {
    praise = "Super accurate";
  }
}

window.addEventListener("keydown", (e) => {
  if (!startTime) {
    startTime = Date.now();
    timer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 0) showResults();
    }, 1000);
  }
 
  if (statsBox.classList.contains("hidden")) {
    if (e.key === "Backspace") {
      typedChars.pop();
    } else if (e.key.length === 1) {
      if (typedChars.length < quote.length) {
        typedChars.push(e.key);
      }
    }
    updateDisplay();
 
    if (typedChars.length === quote.length) {
      showResults();
    }
  }
});

window.onload = fetchQuote();