const quizData = [
  // Existing questions

  // Your 5 new translation questions
  {
    question: `"Ich habe gestern einen interessanten Film gesehen."\nChoose the correct English translation:`,
    type: "dropdown",
    options: [
      "I saw an interesting movie yesterday.",
      "I watched a boring film today.",
      "I have a new film camera.",
      "I went to the cinema yesterday."
    ],
    correct: "I saw an interesting movie yesterday."
  },
  {
    question: `"She is learning German because she wants to study in Berlin."\nChoose the correct German translation:`,
    type: "dropdown",
    options: [
      "Sie lernt Deutsch, weil sie in Berlin studieren möchte.",
      "Sie wohnt in Berlin, weil sie Deutsch spricht.",
      "Sie geht nach Berlin, um Englisch zu lernen.",
      "Sie studiert Deutsch in München."
    ],
    correct: "Sie lernt Deutsch, weil sie in Berlin studieren möchte."
  },
  {
    question: `"Kannst du mir bitte den Weg zum Bahnhof zeigen?"\nChoose the correct English translation:`,
    type: "dropdown",
    options: [
      "Can you please show me the way to the train station?",
      "Can you give me a ticket to the airport?",
      "Where is the bus stop, please?",
      "Do you need help with your suitcase?"
    ],
    correct: "Can you please show me the way to the train station?"
  },
  {
    question: `"They are looking for a new apartment in the city."\nChoose the correct German translation:`,
    type: "dropdown",
    options: [
      "Sie suchen eine neue Wohnung in der Stadt.",
      "Sie leben in einem alten Haus auf dem Land.",
      "Er wohnt in der Nähe des Parks.",
      "Ich finde mein Handy nicht in der Wohnung."
    ],
    correct: "Sie suchen eine neue Wohnung in der Stadt."
  },
  {
    question: `"Obwohl es regnete, gingen wir spazieren."\nChoose the correct English translation:`,
    type: "dropdown",
    options: [
      "Although it was raining, we went for a walk.",
      "Because it was raining, we stayed home.",
      "We walked to the store in the rain.",
      "The weather was nice, so we went hiking."
    ],
    correct: "Although it was raining, we went for a walk."
  },

  // My 5 additional translation questions
  {
    question: `"My brother works at a hospital in Frankfurt."\nChoose the correct German translation:`,
    type: "dropdown",
    options: [
      "Mein Bruder arbeitet in einem Krankenhaus in Frankfurt.",
      "Mein Bruder besucht ein Krankenhaus in Berlin.",
      "Mein Bruder lebt in einer Wohnung in Frankfurt.",
      "Mein Bruder ist ein Student in Köln."
    ],
    correct: "Mein Bruder arbeitet in einem Krankenhaus in Frankfurt."
  },
  {
    question: `"Wir haben das Museum gestern besucht."\nChoose the correct English translation:`,
    type: "dropdown",
    options: [
      "We visited the museum yesterday.",
      "We are going to the museum today.",
      "We built a museum last week.",
      "We saw a movie yesterday."
    ],
    correct: "We visited the museum yesterday."
  },
  {
    question: `"He usually goes to school by bike."\nChoose the correct German translation:`,
    type: "dropdown",
    options: [
      "Er fährt normalerweise mit dem Fahrrad zur Schule.",
      "Er läuft jeden Tag zum Park.",
      "Er geht mit dem Bus ins Kino.",
      "Er spielt Fußball mit seinen Freunden."
    ],
    correct: "Er fährt normalerweise mit dem Fahrrad zur Schule."
  },
  {
    question: `"Was machst du am Wochenende?"\nChoose the correct English translation:`,
    type: "dropdown",
    options: [
      "What are you doing on the weekend?",
      "Where are you during the week?",
      "How do you go to work?",
      "Do you have school today?"
    ],
    correct: "What are you doing on the weekend?"
  },
  {
    question: `"The children are playing in the garden."\nChoose the correct German translation:`,
    type: "dropdown",
    options: [
      "Die Kinder spielen im Garten.",
      "Die Kinder essen im Restaurant.",
      "Die Schüler schreiben eine Prüfung.",
      "Die Freunde tanzen im Club."
    ],
    correct: "Die Kinder spielen im Garten."
  }
];

// State variables
let currentIndex = 0;
let score = 0;
let attempted = 0;
let correct = 0;
let wrong = 0;
let lives = 3;
let hasAttempted = false;
let selectedTF = null;

// DOM elements
const quizDiv = document.getElementById("quiz");
const resultDiv = document.getElementById("result");
const checkBtn = document.querySelector(".btn.check");
const nextBtn = document.querySelector(".btn.next");
const skipBtn = document.querySelector(".btn.skip");
const scoreCounter = document.getElementById("score-counter");
const livesCounter = document.getElementById("lives-counter");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("total-questions");
const progressBar = document.getElementById("progress-bar");

totalQuestionsSpan.textContent = quizData.length;
livesCounter.textContent = lives;

function loadQuestion() {
  if (lives <= 0 || currentIndex >= quizData.length) {
    showSummary();
    return;
  }

  const q = quizData[currentIndex];
  selectedTF = null;
  hasAttempted = false;
  resultDiv.innerHTML = "";
  checkBtn.style.display = "inline-block";
  nextBtn.style.display = "none";
  skipBtn.style.display = "inline-block";

  currentQuestionSpan.textContent = currentIndex + 1;
  updateProgressBar();

  let html = `<div class="question">${q.question}</div>`;

  switch (q.type) {
    case "dropdown":
      html += `<select id="answer-select"><option value="">--Select--</option>`;
      q.options.forEach(opt => {
        html += `<option value="${opt}">${opt}</option>`;
      });
      html += `</select>`;
      break;

    case "rearrange":
      html += `<div id="rearrange-container">`;
      q.words.forEach((word, idx) => {
        html += `<input type="text" class="rearrange-input" id="word${idx}" value="${word}" /> `;
      });
      html += `</div><p><small>Rearrange words by editing input boxes to form a correct sentence.</small></p>`;
      break;

    case "truefalse":
      html += `
        <div class="truefalse-buttons">
          <button id="true-btn" onclick="selectTF(true)">True</button>
          <button id="false-btn" onclick="selectTF(false)">False</button>
        </div>`;
      break;

    case "fillblank":
      html += `<input type="text" id="fill-input" placeholder="Type your answer here" autocomplete="off" />`;
      break;
  }

  quizDiv.innerHTML = html;
}

function selectTF(value) {
  if (hasAttempted) return;
  selectedTF = value;
  const trueBtn = document.getElementById("true-btn");
  const falseBtn = document.getElementById("false-btn");
  trueBtn.classList.remove("selected");
  falseBtn.classList.remove("selected");
  (value ? trueBtn : falseBtn).classList.add("selected");
}

function checkAnswer() {
  if (hasAttempted) return;
  const q = quizData[currentIndex];
  let userAnswer = "";

  switch (q.type) {
    case "dropdown":
      userAnswer = document.getElementById("answer-select").value;
      break;
    case "rearrange":
      const inputs = document.querySelectorAll(".rearrange-input");
      userAnswer = Array.from(inputs).map(i => i.value.trim()).join(" ");
      break;
    case "truefalse":
      if (selectedTF === null) return alert("Please select True or False.");
      userAnswer = selectedTF;
      break;
    case "fillblank":
      userAnswer = document.getElementById("fill-input").value.trim();
      break;
  }

  let isCorrect = userAnswer == q.correct;
  hasAttempted = true;
  attempted++;
  if (isCorrect) {
    score += 10;
    correct++;
    resultDiv.innerHTML = `<span class="correct">Correct!</span>`;
  } else {
    wrong++;
    lives--;
    resultDiv.innerHTML = `<span class="wrong">Wrong! Correct: ${q.correct}</span>`;
  }

  scoreCounter.textContent = score;
  livesCounter.textContent = lives;

  checkBtn.style.display = "none";
  nextBtn.style.display = "inline-block";
  skipBtn.style.display = "none";

  if (lives <= 0) showSummary();
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex >= quizData.length) {
    showSummary();
  } else {
    loadQuestion();
  }
}

function skipQuestion() {
  currentIndex++;
  if (currentIndex >= quizData.length) {
    showSummary();
  } else {
    loadQuestion();
  }
}

function showSummary() {
  const percent = ((correct / attempted) * 100).toFixed(1);
  quizDiv.innerHTML = "";
  resultDiv.innerHTML = `
    <h3>Quiz Completed</h3>
    <p>Total Questions: ${quizData.length}</p>
    <p>Attempted: ${attempted}</p>
    <p>Correct: ${correct}</p>
    <p>Wrong: ${wrong}</p>
    <p>Final Score: ${score}</p>
    <p>Accuracy: ${percent}%</p>
    <button onclick="restartQuiz()">Restart Quiz</button>
  `;
  checkBtn.style.display = "none";
  nextBtn.style.display = "none";
  skipBtn.style.display = "none";
}

function updateProgressBar() {
  const progress = ((currentIndex) / quizData.length) * 100;
  progressBar.style.width = `${progress}%`;
}
function showSummary() {
  quizDiv.innerHTML = "";
  checkBtn.style.display = "none";
  nextBtn.style.display = "none";
  skipBtn.style.display = "none";
  progressBar.style.width = "100%";

  const skipped = quizData.length - attempted;
  const percentCorrect = Math.round((correct / quizData.length) * 100);
  const percentWrong = Math.round((wrong / quizData.length) * 100);
  const percentSkipped = Math.round((skipped / quizData.length) * 100);
  const currentDateTime = new Date().toLocaleString();

  // Emoji based on performance
  let performanceEmoji = "👍";
  if (percentCorrect >= 90) performanceEmoji = "🏆";
  else if (percentCorrect >= 75) performanceEmoji = "🎉";
  else if (percentCorrect >= 50) performanceEmoji = "😊";
  else performanceEmoji = "🤔";

  const summaryHtml = `
    <div class="summary-card" role="region" aria-label="Quiz Summary">
      <h2 class="summary-title">Intermediate German</h2>
      <p><strong>Completed on:</strong> ${currentDateTime}</p>
      <p><em>Danke fürs Mitmachen! Here's how you did:</em></p>
      <div class="summary-icon" aria-hidden="true">${performanceEmoji}</div>

      <div class="summary-stats">
        <div class="stat" data-tooltip="Total number of questions in the quiz">
          <h3>Total Questions</h3>
          <p>${quizData.length}</p>
        </div>
        <div class="stat" data-tooltip="Questions you attempted to answer">
          <h3>Attempted</h3>
          <p>${attempted}</p>
        </div>
        <div class="stat" data-tooltip="Number of questions you answered correctly">
          <h3>Correct</h3>
          <p>${correct}</p>
        </div>
        <div class="stat" data-tooltip="Number of questions answered incorrectly">
          <h3>Wrong</h3>
          <p>${wrong}</p>
        </div>
        <div class="stat" data-tooltip="Questions you skipped">
          <h3>Skipped</h3>
          <p>${skipped}</p>
        </div>
        <div class="stat" data-tooltip="Total points scored in the quiz">
          <h3>Score</h3>
          <p>${score}</p>
        </div>
      </div>

      <div class="progress-summary" aria-label="Answer correctness distribution">
        <div class="progress-bar-label">
          <span>Correct</span><span>${percentCorrect}%</span>
        </div>
        <div class="progress-bar-inner" role="progressbar" aria-valuenow="${percentCorrect}" aria-valuemin="0" aria-valuemax="100" aria-label="Percentage of correct answers">
          <div class="progress-bar-fill correct-fill" style="width: ${percentCorrect}%;"></div>
        </div>

        <div class="progress-bar-label">
          <span>Wrong</span><span>${percentWrong}%</span>
        </div>
        <div class="progress-bar-inner" role="progressbar" aria-valuenow="${percentWrong}" aria-valuemin="0" aria-valuemax="100" aria-label="Percentage of wrong answers">
          <div class="progress-bar-fill wrong-fill" style="width: ${percentWrong}%;"></div>
        </div>

        <div class="progress-bar-label">
          <span>Skipped</span><span>${percentSkipped}%</span>
        </div>
        <div class="progress-bar-inner" role="progressbar" aria-valuenow="${percentSkipped}" aria-valuemin="0" aria-valuemax="100" aria-label="Percentage of skipped answers">
          <div class="progress-bar-fill skipped-fill" style="width: ${percentSkipped}%;"></div>
        </div>
      </div>

      <button class="btn restart-btn" onclick="restartQuiz()" aria-label="Restart Quiz">Restart</button>
      <button onclick="window.location.href='contents3.html'" class="btn restart-btn">Go to Contents</button>
    </div>
  `;

  resultDiv.innerHTML = "";
  quizDiv.innerHTML = summaryHtml;
}


function restartQuiz() {
  currentIndex = 0;
  score = 0;
  attempted = 0;
  correct = 0;
  wrong = 0;
  lives = 3;
  scoreCounter.textContent = score;
  livesCounter.textContent = lives;
  resultDiv.innerHTML = "";
  checkBtn.style.display = "inline-block";
  nextBtn.style.display = "none";
  skipBtn.style.display = "inline-block";
  loadQuestion();
}

window.onload = loadQuestion;