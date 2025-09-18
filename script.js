const sentenceEl = document.getElementById("sentence");
const statsBox = document.getElementById("statsBox");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const timerEl = document.getElementById("timer");
let username = "";

window.onload = () => {
  username = prompt("Welcome to GlowType! What's your name?");
  if (!username) username = "Typist";
  fetchQuote();
};

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

  updateDisplay();
}


function updateDisplay() {
  const spans = sentenceEl.querySelectorAll(".char");
  let correctCount = 0;

  for (let i = 0; i < spans.length; i++) {
    const typed = typedChars[i];
    const original = sentence[i];

    spans[i].className = "char";

    if (typed == null) {
      if (i === typedChars.length) spans[i].classList.add("cursor");
    } else if (typed === original) {
      spans[i].classList.add("correct");
      correctCount++;
    } else {
      spans[i].classList.add("incorrect");
    }
  }

  const elapsed = (Date.now() - startTime) / 1000;
  const wpm = Math.round((typedChars.length / 5) / (elapsed / 60));
  const accuracy = Math.round((correctCount / typedChars.length) * 100) || 0;

  wpmEl.textContent = isFinite(wpm) ? wpm : 0;
  accuracyEl.textContent = `${accuracy}%`;
}

function showResults() {
  updateDisplay();
  statsBox.classList.remove("hidden");
  clearInterval(timer);

  const wpm = parseInt(wpmEl.textContent);
  const accuracy = parseInt(accuracyEl.textContent);

  let praise = "Nice work";
  if (wpm >= 60 && accuracy >= 95) praise = "You're a typing legend";
  else if (wpm >= 40) praise = "Great speed";
  else if (accuracy >= 90) praise = "Super accurate";

  statsBox.querySelector("h2").textContent = `🎉 Congratulations, ${username}! ${praise}!`;
  submitScore();
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
      if (typedChars.length < sentence.length) {
        typedChars.push(e.key);
      }
    }
    updateDisplay();

    if (typedChars.length === sentence.length) {
      showResults();
      
    }
    
  }
});

const leaderboardBox = document.getElementById("leaderboardBox");
const leaderboardEl = document.getElementById("leaderboard");

async function submitScore() {
  await fetch("https://sheetdb.io/api/v1/t3yff650driw6", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [
        {
          username: username,
          wpm: parseInt(wpmEl.textContent),
          accuracy: parseInt(accuracyEl.textContent)
        }
      ]
    })
  });
  fetchLeaderboard();
}

async function fetchLeaderboard() {
  const res = await fetch("https://sheetdb.io/api/v1/t3yff650driw6");
  const data = await res.json();

  
  data.sort((a, b) => (parseInt(b.wpm) + (parseInt(b.accuracy) * 100)) - (parseInt(a.wpm) + (parseInt(a.accuracy) * 100)));

  leaderboardEl.innerHTML = `
    <table style="width:100%; color:white;">
      <thead>
        <tr>
          <th style="color:#00ffcc;">Name</th>
          <th style="color:#00ffcc;">WPM</th>
          <th style="color:#00ffcc;">Accuracy</th>
        </tr>
      </thead>
      <tbody>
        ${data.slice(0, 10).map(entry => `
          <tr>
            <td>${entry.username}</td>
            <td>${entry.wpm}</td>
            <td>${entry.accuracy}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  leaderboardBox.classList.remove("hidden");
}