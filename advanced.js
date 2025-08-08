const quizData = [
    {
      question: "Select the correct form of 'haben' (to have) in subjunctive II: 'Ich _____ mehr Zeit.'",
      type: "dropdown",
      options: ["habe", "hätte", "hatte", "haben"],
      correct: "hätte"
    },
    {
      question: "Rearrange these words to form a correct sentence: 'morgen / ins / gehe / Kino / Ich'",
      type: "rearrange",
      words: ["morgen", "ins", "gehe", "Kino", "Ich"],
      correct: "Ich gehe morgen ins Kino"
    },
    {
      question: "True or False: The sentence 'Ich ging morgen ins Kino.' is grammatically correct.",
      type: "truefalse",
      correct: false
    },
    {
      question: "Fill in the blank: 'Er fährt mit dem ____ zur Arbeit.' (means 'train')",
      type: "fillblank",
      correct: "Zug"
    },
    {
      question: "Select the correct translation for 'quickly'.",
      type: "dropdown",
      options: ["langsam", "schnell", "lang", "schneller"],
      correct: "schnell"
    },
    {
      question: "Rearrange to form a sentence: 'im / gehen / Park / wir / heute'",
      type: "rearrange",
      words: ["im", "gehen", "Park", "wir", "heute"],
      correct: "Wir gehen heute im Park"
    },
    {
      question: "True or False: 'Ich habe gegessen.' means 'I have eaten.'",
      type: "truefalse",
      correct: true
    },
    {
      question: "Fill in the blank: 'Das Wetter ist heute sehr ____.' (means 'nice' or 'good')",
      type: "fillblank",
      correct: "schön"
    }
  ];

  let currentIndex = 0;
  let score = 0;
  let attempted = 0;
  let correct = 0;
  let wrong = 0;
  let lives = 3;
  let hasAttempted = false;
  let selectedTF = null;

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

    switch(q.type) {
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
    // Toggle button styles
    const trueBtn = document.getElementById("true-btn");
    const falseBtn = document.getElementById("false-btn");
    if (value === true) {
      trueBtn.classList.add("selected");
      falseBtn.classList.remove("selected");
    } else {
      falseBtn.classList.add("selected");
      trueBtn.classList.remove("selected");
    }
  }

  function checkAnswer() {
    if (hasAttempted) return;

    const q = quizData[currentIndex];
    let userAnswer;

    switch(q.type) {
      case "dropdown":
        const selectEl = document.getElementById("answer-select");
        userAnswer = selectEl.value;
        if (!userAnswer) {
          alert("Please select an option.");
          return;
        }
        break;

      case "rearrange":
        const inputs = [...document.querySelectorAll(".rearrange-input")];
        userAnswer = inputs.map(i => i.value.trim()).join(" ");
        break;

      case "truefalse":
        if (selectedTF === null) {
          alert("Please select True or False.");
          return;
        }
        userAnswer = selectedTF;
        break;

      case "fillblank":
        userAnswer = document.getElementById("fill-input").value.trim();
        if (!userAnswer) {
          alert("Please fill in the blank.");
          return;
        }
        break;
    }

    hasAttempted = true;
    attempted++;

    let isCorrect;
    if (typeof q.correct === "boolean") {
      isCorrect = (userAnswer === q.correct);
    } else {
      isCorrect = userAnswer.toLowerCase() === q.correct.toLowerCase();
    }

    if (isCorrect) {
      score += 10;
      correct++;
      resultDiv.innerHTML = `<div class="feedback correct"><span class="emoji">✅</span><p>Correct! 🎉</p></div>`;
    } else {
      wrong++;
      lives--;
      livesCounter.textContent = lives;
      resultDiv.innerHTML = `<div class="feedback wrong"><span class="emoji">❌</span><p>Wrong! The correct answer is <b>${q.correct}</b>.</p></div>`;
    }

    scoreCounter.textContent = score;
    checkBtn.style.display = "none";
    nextBtn.style.display = "inline-block";
    skipBtn.style.display = "none";

    if (lives <= 0) {
      setTimeout(showSummary, 1200);
    }
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

  function updateProgressBar() {
    const progressPercent = ((currentIndex) / quizData.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
  }



function restartQuiz() {
  currentIndex = 0;
  selected = null;
  score = 0;
  attempted = 0;
  correct = 0;
  wrong = 0;
  lives = 3;
  livesCounter.textContent = lives;
  resultDiv.innerHTML = "";
  checkBtn.style.display = "inline-block";
  nextBtn.style.display = "inline-block";
  skipBtn.style.display = "inline-block";
  showQuestion();
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
      <h2 class="summary-title">Advanced German </h2>
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
      <button onclick="window.location.href='contents2.html'" class="btn restart-btn">Go to Contents</button>
      
    </div>
  `;

  resultDiv.innerHTML = "";
  quizDiv.innerHTML = summaryHtml;
}






  // Initial load
  loadQuestion();