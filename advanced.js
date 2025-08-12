document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('linguaquest_user') || 'Adventurer';
    const avatarUrl = localStorage.getItem('linguaquest_avatar') || 'https://api.dicebear.com/8.x/adventurer/svg?seed=Default';
    const avatarImg = document.getElementById('user-avatar');
    const nameSpan = document.getElementById('user-name');
    if (avatarImg && nameSpan) {
        avatarImg.src = avatarUrl;
        nameSpan.textContent = username;
    }
});

const quizData = [
    {
      type: "audio",
      question: "Listen to the audio and select the correct sentence.",
      audioText: "mein Vater und meine Mutter",
      options: [
        "mein Vater und meine Mutter",
        "meine Tante und mein Onkel",
        "mein Bruder und meine Schwester",
        "meine Großmutter und mein Großvater"
      ],
      correct: "mein Vater und meine Mutter"
    },
    {
      type: "rearrange",
      question: "Rearrange these words to form a correct sentence: 'morgen / ins / gehe / Ich'",
      correct: "Ich gehe morgen ins Kino"
    },
    {
      type: "audio",
      question: "Listen to the audio and select the correct sentence.",
      audioText: "TechRush ist der beste Hackathon aller Zeiten",
      options: [
        "LinguaQuest ist eine gute App",
        "Hackathons machen Spaß",
        "TechRush ist der beste Hackathon aller Zeiten",
        "Ich liebe es zu programmieren"
      ],
      correct: "TechRush ist der beste Hackathon aller Zeiten"
    },
    {
      type: "fillblank",
      question: "Fill in the blank: 'Er fährt mit dem ____ zur Arbeit.' (means 'train')",
      correct: "Zug"
    },
    {
      type: "audio",
      question: "Listen to the audio and select the correct sentence.",
      audioText: "Tee oder Kaffee, bitte?",
      options: [
        "Wasser oder Saft, bitte?",
        "Tee oder Kaffee, bitte?",
        "Bier oder Wein, bitte?",
        "Milch oder Zucker, bitte?"
      ],
      correct: "Tee oder Kaffee, bitte?"
    },
    {
      type: "truefalse",
      question: "True or False: 'Ich habe gegessen.' means 'I have eaten.'",
      correct: true
    },
    {
      type: "dropdown",
      question: "Select the correct form of 'haben' (to have) in subjunctive II: 'Ich _____ mehr Zeit.'",
      options: ["habe", "hätte", "hatte", "haben"],
      correct: "hätte"
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

let correctQuestions = [];
let wrongQuestions = [];
let skippedQuestions = [];

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

// 🎵 Sound effects
const correctSound = new Audio("Audio/Audio_correct.mp3");
const wrongSound = new Audio("Audio/Audio_wrong.mp3");
const lessonCompleteSound = new Audio("Audio/lesson_complete.mp3");

// Function to play audio using browser's speech synthesis
function playAudio(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE'; // Set language to German
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Sorry, your browser doesn't support text-to-speech.");
    }
}

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
    let answerHtml = '';

    switch(q.type) {
      case "audio":
        answerHtml += `
            <div class="audio-player">
                <button class="play-audio-btn" onclick="playAudio('${q.audioText}')">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
            <div class="mcq-options">
        `;
        q.options.forEach(opt => {
            answerHtml += `<button class="option-btn" onclick="checkAnswer(this)">${opt}</button>`;
        });
        answerHtml += `</div>`;
        checkBtn.style.display = "none";
        break;
      case "dropdown":
        answerHtml += `<select id="answer-select" class="rearrange-input"><option value="">--Select--</option>`;
        q.options.forEach(opt => {
          answerHtml += `<option value="${opt}">${opt}</option>`;
        });
        answerHtml += `</select>`;
        break;
      case "rearrange":
          answerHtml += `<input type="text" id="rearrange-input" class="rearrange-input" placeholder="Rearrange and type here...">`;
          break;
      case "truefalse":
        answerHtml += `
          <div class="truefalse-buttons">
            <button class="option-btn" onclick="selectTF(true, this)">True</button>
            <button class="option-btn" onclick="selectTF(false, this)">False</button>
          </div>`;
        checkBtn.style.display = "none";
        break;
      case "fillblank":
        answerHtml += `<input type="text" id="fill-input" class="rearrange-input" placeholder="Type your answer here" autocomplete="off" />`;
        break;
    }
    quizDiv.innerHTML = html + answerHtml;
}

function selectTF(value, buttonEl) {
    if (hasAttempted) return;
    selectedTF = value;
    document.querySelectorAll('.truefalse-buttons .option-btn').forEach(btn => btn.classList.remove('selected'));
    buttonEl.classList.add('selected');
    checkAnswer();
}

function checkAnswer(mcqButton = null) {
    if (hasAttempted) return;

    const q = quizData[currentIndex];
    let userAnswer;
    let uiElement;

    switch(q.type) {
      case "audio":
      case "dropdown":
        if (q.type === 'audio') {
            userAnswer = mcqButton.textContent;
            uiElement = mcqButton;
            document.querySelectorAll('.mcq-options .option-btn').forEach(btn => btn.disabled = true);
        } else {
            const selectEl = document.getElementById("answer-select");
            userAnswer = selectEl.value;
            uiElement = selectEl;
            if (!userAnswer) {
              alert("Please select an option.");
              return;
            }
        }
        break;
      case "rearrange":
          const inputEl = document.getElementById("rearrange-input");
          userAnswer = inputEl.value.trim();
          uiElement = inputEl;
          break;
      case "truefalse":
        if (selectedTF === null) return;
        userAnswer = selectedTF;
        uiElement = document.querySelector('.truefalse-buttons .selected');
        break;
      case "fillblank":
        const fillInput = document.getElementById("fill-input");
        userAnswer = fillInput.value.trim();
        uiElement = fillInput;
        if (!userAnswer) {
          alert("Please fill in the blank.");
          return;
        }
        break;
    }

    hasAttempted = true;
    attempted++;

    const isCorrect = userAnswer.toString().toLowerCase() === q.correct.toString().toLowerCase();
    
    if (isCorrect) {
        score += 10;
        correct++;
        correctQuestions.push({ ...q, userAnswer });
        resultDiv.innerHTML = `<div class="feedback correct"><span class="emoji">✅</span><p>Correct! 🎉</p></div>`;
        if(uiElement) uiElement.classList.add('correct');
        
        // ✅ Play correct sound
        correctSound.currentTime = 0;
        correctSound.play();
    } else {
        wrong++;
        lives--;
        wrongQuestions.push({ ...q, userAnswer });
        livesCounter.textContent = lives;
        resultDiv.innerHTML = `<div class="feedback wrong"><span class="emoji">❌</span><p>Wrong! The correct answer is <b>${q.correct}</b>.</p></div>`;
        if(uiElement) uiElement.classList.add('incorrect');

        // ❌ Play wrong sound
        wrongSound.currentTime = 0;
        wrongSound.play();
    }

    scoreCounter.textContent = score;
    checkBtn.style.display = "none";
    nextBtn.style.display = "inline-block";
    skipBtn.style.display = "none";

    if (lives <= 0) {
      setTimeout(showSummary, 1200);
    }
    
    // Add save here
    saveQuizState();
}

function nextQuestion() {
    currentIndex++;
    // Add save here
    saveQuizState();
    if (currentIndex >= quizData.length) {
      showSummary();
    } else {
      loadQuestion();
    }
}

function skipQuestion() {
    skippedQuestions.push(quizData[currentIndex]);
    currentIndex++;
    // Add save here
    saveQuizState();
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

function typeWriter(element, text, speed) {
    let i = 0;
    element.classList.add('blinking-cursor-dark');
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            element.classList.remove('blinking-cursor-dark');
        }
    }
    type();
}

function restartQuiz() {
    currentIndex = 0;
    score = 0;
    attempted = 0;
    correct = 0;
    wrong = 0;
    lives = 3;
    hasAttempted = false;
    selectedTF = null;
    correctQuestions = [];
    wrongQuestions = [];
    skippedQuestions = [];
    
    scoreCounter.textContent = score;
    livesCounter.textContent = lives;
    resultDiv.innerHTML = "";
    checkBtn.style.display = "inline-block";
    nextBtn.style.display = "none";
    skipBtn.style.display = "inline-block";
    
    // Clear saved state on restart
    localStorage.removeItem('quizState');
     document.querySelector('.buttons').style.display = 'flex';


    loadQuestion();
}

function showSummary() {
    // 🎵 Play completion sound
    lessonCompleteSound.play();
    quizDiv.innerHTML = "";
    checkBtn.style.display = "none";
    nextBtn.style.display = "none";
    skipBtn.style.display = "none";
      document.querySelector('.buttons').style.display = 'none';

    progressBar.style.width = "100%";
    
    const username = localStorage.getItem('linguaquest_user') || 'Adventurer';
    const avatarUrl = localStorage.getItem('linguaquest_avatar') || 'https://api.dicebear.com/8.x/adventurer/svg?seed=Default';
    const skipped = quizData.length - attempted;
    const percentCorrect = Math.round((correct / quizData.length) * 100);
    const percentWrong = Math.round((wrong / quizData.length) * 100);
    const percentSkipped = Math.round((skipped / quizData.length) * 100);
    const currentDateTime = new Date().toLocaleString();

    let performanceEmoji = "👍";
    if (percentCorrect >= 90) performanceEmoji = "🏆";
    else if (percentCorrect >= 75) performanceEmoji = "🎉";
    else if (percentCorrect >= 50) performanceEmoji = "😊";
    else performanceEmoji = "🤔";

    const summaryHtml = `
      <div class="summary-card" role="region" aria-label="Quiz Summary">
      
        <h2 class="summary-title">Advanced German</h2>
        <p><strong>Completed on:</strong> ${currentDateTime}</p>
        <div class="summary-icon" aria-hidden="true">${performanceEmoji}</div>
        
        <div class="summary-stats">
            <div class="stat" data-tooltip="Total number of questions in the quiz"><h3>Total</h3><p>${quizData.length}</p></div>
            <div class="stat" data-tooltip="Questions you attempted to answer"><h3>Attempted</h3><p>${attempted}</p></div>
            <div class="stat" data-tooltip="Number of questions you answered correctly"><h3>Correct</h3><p>${correct}</p></div>
            <div class="stat" data-tooltip="Number of questions answered incorrectly"><h3>Wrong</h3><p>${wrong}</p></div>
            <div class="stat" data-tooltip="Questions you skipped"><h3>Skipped</h3><p>${skipped}</p></div>
            <div class="stat" data-tooltip="Total points scored in the quiz"><h3>Score</h3><p>${score}</p></div>
        </div>
        
        <div class="progress-summary">
          <div class="progress-section" onclick="showReviewedQuestions('correct')">
            <div class="progress-bar-label"><span>Correct</span><span>${percentCorrect}%</span></div>
            <div class="progress-bar-inner"><div class="progress-bar-fill correct-fill" style="width: ${percentCorrect}%;"></div></div>
          </div>
          <div class="progress-section" onclick="showReviewedQuestions('wrong')">
            <div class="progress-bar-label"><span>Wrong</span><span>${percentWrong}%</span></div>
            <div class="progress-bar-inner"><div class="progress-bar-fill wrong-fill" style="width: ${percentWrong}%;"></div></div>
          </div>
          <div class="progress-section" onclick="showReviewedQuestions('skipped')">
            <div class="progress-bar-label"><span>Skipped</span><span>${percentSkipped}%</span></div>
            <div class="progress-bar-inner"><div class="progress-bar-fill skipped-fill" style="width: ${percentSkipped}%;"></div></div>
          </div>
        </div>
        
        <div class="results-actions">
            <button class="btn restart-btn" onclick="restartQuiz()">Restart</button>
            <button onclick="window.location.href='contents2.html'" class="btn restart-btn">Go to Contents</button>
        </div>
        
        <div id="review-modal" class="modal-hidden">
            <div class="modal-content">
                <span class="modal-close" onclick="closeReviewModal()">&times;</span>
                <h3 id="modal-title"></h3>
                <ul id="modal-body"></ul>
            </div>
        </div>
      </div>
    `;
    
    resultDiv.innerHTML = "";
    quizDiv.innerHTML = summaryHtml;

    const summaryHeading = document.getElementById('summary-heading');
    if (summaryHeading) {
        typeWriter(summaryHeading, `Well done, ${username}!`, 75);
    }
}

// ======== ADDED localStorage save/load functions ========
function saveQuizState() {
    const quizState = {
        currentIndex,
        score,
        attempted,
        correct,
        wrong,
        lives,
        hasAttempted,
        selectedTF,
    };
    localStorage.setItem('quizState', JSON.stringify(quizState));
}

function loadQuizState() {
    const saved = localStorage.getItem('quizState');
    if (saved) {
        const state = JSON.parse(saved);
        currentIndex = state.currentIndex || 0;
        score = state.score || 0;
        attempted = state.attempted || 0;
        correct = state.correct || 0;
        wrong = state.wrong || 0;
        lives = state.lives || 3;
        hasAttempted = state.hasAttempted || false;
        selectedTF = state.selectedTF;

        scoreCounter.textContent = score;
        livesCounter.textContent = lives;
        currentQuestionSpan.textContent = currentIndex + 1;
    }
}

// Load saved quiz state first, then load the question
window.onload = function () {
    loadQuizState();
    loadQuestion();
};

loadQuestion();
