const sentenceEl = document.getElementById("sentence");
const timerEl = document.getElementById("timer");

let sentence = "";
let typedChars = [];
let startTime = null;
let timer;
let timeLeft = 60;

async function fetchQuote() {
  const res = await fetch("https://dummyjson.com/quotes/random");
  const data = await res.json();
  sentence = data.quote.toLowerCase();
  renderSentence();
}

function renderSentence() {
  sentenceEl.innerHTML = "";

  const words = sentence.split(" ");
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
}

function restartTest() {
  typedChars = [];
  startTime = null;
  timeLeft = 60;
  timerEl.textContent = timeLeft;
  statsBox.classList.add("hidden");
  fetchQuote();
}

window.onload = fetchQuote;