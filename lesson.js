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
        question: "Which one is 'Apfel' in German? 🍎",
        type: "icon",
        options: [
            { icon: "🍎", correct: true },
            { icon: "🍊", correct: false },
            { icon: "🥕", correct: false }
        ]
    },
    {
        question: "Fill in the blank: The German word for water is _____.",
        type: "text",
        options: [
            { text: "Milch", correct: false },
            { text: "Wasser", correct: true },
            { text: "Saft", correct: false }
        ]
    },
    {
        question: "Which one is 'Milch' in German? 🥛",
        type: "icon",
        options: [
            { icon: "💧", correct: false },
            { icon: "🥛", correct: true },
            { icon: "🥤", correct: false }
        ]
    },
    {
        question: "Fill in the blank: The German word for bread is _____.",
        type: "text",
        options: [
            { text: "Käse", correct: false },
            { text: "Ei", correct: false },
            { text: "Brot", correct: true }
        ]
    },
    {
        question: "Which one is 'Käse' in German? 🧀",
        type: "icon",
        options: [
            { icon: "🧀", correct: true },
            { icon: "🍞", correct: false },
            { icon: "🥚", correct: false }
        ]
    },
    {
        question: "How do you say 'hello' in German?",
        type: "text",
        options: [
            { text: "Bonjour", correct: false },
            { text: "Hallo", correct: true },
            { text: "Hola", correct: false }
        ]
    },
    {
        question: "Which one is 'Hund' in German? 🐶",
        type: "icon",
        options: [
            { icon: "🐱", correct: false },
            { icon: "🐶", correct: true },
            { icon: "🐈", correct: false }
        ]
    }
];

let currentIndex = 0;
let selected = null;
let score = 0;
let attempted = 0;
let correct = 0;
let wrong = 0;
let lives = 3;
let hasAttempted = false;

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
let correctSound = new Audio("Audio/Audio_correct.mp3");
let wrongSound = new Audio("Audio/Audio_wrong.mp3");
let lessonCompleteSound = new Audio("Audio/lesson_complete.mp3");

function loadQuestion() {
    if (lives <= 0 || currentIndex >= quizData.length) {
        showSummary();
        return;
    }

    const q = quizData[currentIndex];
    selected = null;
    hasAttempted = false;
    resultDiv.innerHTML = "";
    checkBtn.style.display = "inline-block";
    nextBtn.style.display = "none";
    skipBtn.style.display = "inline-block";
    
    currentQuestionSpan.textContent = currentIndex + 1;
    updateProgressBar();

    let html = `<div class="question">${q.question}</div><div class="options">`;
    if (q.type === "icon") {
        q.options.forEach((opt, i) => {
            html += `<div class="icon" onclick="selectOption(${i}, 'icon')" id="opt${i}">${opt.icon}</div>`;
        });
    } else {
        q.options.forEach((opt, i) => {
            html += `<button class="option" onclick="selectOption(${i}, 'text')" id="opt${i}">${opt.text}</button>`;
        });
    }
    html += `</div>`;
    quizDiv.innerHTML = html;
}

function selectOption(index, type) {
    if (hasAttempted) return;
    const options = document.querySelectorAll(`.options ${type === 'icon' ? '.icon' : 'button.option'}`);
    options.forEach(opt => opt.classList.remove("selected"));
    document.getElementById(`opt${index}`).classList.add("selected");
    selected = index;
}

function checkAnswer() {
    if (selected === null) {
        alert("Please select an option.");
        return;
    }
    if (hasAttempted) return;

    const q = quizData[currentIndex];
    const isCorrect = q.options[selected].correct;
    hasAttempted = true;
    attempted++;

    const selectedElement = document.getElementById(`opt${selected}`);
    const correctAnswerIndex = q.options.findIndex(opt => opt.correct);
    const correctAnswerElement = document.getElementById(`opt${correctAnswerIndex}`);

    if (isCorrect) {
        score += 10;
        correct++;
        resultDiv.innerHTML = `<div class="feedback correct"><span class="emoji">✅</span><p>Correct! 🎉</p></div>`;
        selectedElement.classList.add("correct-answer");
        
        // ✅ Play correct sound
        correctSound.currentTime = 0;
        correctSound.play();
    } else {
        wrong++;
        lives--;
        livesCounter.textContent = lives;
        resultDiv.innerHTML = `<div class="feedback wrong"><span class="emoji">❌</span><p>Wrong! The correct answer is ${q.options[correctAnswerIndex].text || q.options[correctAnswerIndex].icon}</p></div>`;
        selectedElement.classList.add("wrong-answer");
        correctAnswerElement.classList.add("correct-answer");
        
        // ❌ Play wrong sound
        wrongSound.currentTime = 0;
        wrongSound.play();
    }

    scoreCounter.textContent = score;
    checkBtn.style.display = "none";
    nextBtn.style.display = "inline-block";
    skipBtn.style.display = "none";

    saveQuizState();  // <<<<< Added save here
}

function nextQuestion() {
    currentIndex++;
    saveQuizState();  // <<<<< Added save here
    loadQuestion();
}

function skipQuestion() {
    currentIndex++;
    saveQuizState();  // <<<<< Added save here
    loadQuestion();
}

function updateProgressBar() {
    const progress = ((currentIndex) / quizData.length) * 100;
    progressBar.style.width = progress + "%";
}

function showSummary() {
    // 🎵 Play completion sound
    lessonCompleteSound.play();
    document.querySelector('.buttons').style.display = 'none';
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

    let performanceEmoji = "👍";
    if (percentCorrect >= 90) performanceEmoji = "🏆";
    else if (percentCorrect >= 75) performanceEmoji = "🎉";
    else if (percentCorrect >= 50) performanceEmoji = "😊";
    else performanceEmoji = "🤔";

    const summaryHtml = `
      <div class="summary-card" role="region" aria-label="Quiz Summary">
        <h2 class="summary-title">Beginner German </h2>
        <p><strong>Completed on:</strong> ${currentDateTime}</p>
        <p><em>Danke fürs Mitmachen! Here's how you did:</em></p>
        <div class="summary-icon" aria-hidden="true">${performanceEmoji}</div>

        <div class="summary-stats">
          <div class="stat"><h3>Total Questions</h3><p>${quizData.length}</p></div>
          <div class="stat"><h3>Attempted</h3><p>${attempted}</p></div>
          <div class="stat"><h3>Correct</h3><p>${correct}</p></div>
          <div class="stat"><h3>Wrong</h3><p>${wrong}</p></div>
          <div class="stat"><h3>Skipped</h3><p>${skipped}</p></div>
          <div class="stat"><h3>Score</h3><p>${score}</p></div>
        </div>

        <div class="progress-summary">
          <div class="progress-bar-label"><span>Correct</span><span>${percentCorrect}%</span></div>
          <div class="progress-bar-inner"><div class="progress-bar-fill correct-fill" style="width: ${percentCorrect}%;"></div></div>

          <div class="progress-bar-label"><span>Wrong</span><span>${percentWrong}%</span></div>
          <div class="progress-bar-inner"><div class="progress-bar-fill wrong-fill" style="width: ${percentWrong}%;"></div></div>

          <div class="progress-bar-label"><span>Skipped</span><span>${percentSkipped}%</span></div>
          <div class="progress-bar-inner"><div class="progress-bar-fill skipped-fill" style="width: ${percentSkipped}%;"></div></div>
        </div>

        <button class="btn restart-btn" onclick="restartQuiz()">Restart</button>
        <button onclick="window.location.href='contents.html'" class="btn restart-btn">Go to Contents</button>
      </div>
    `;

    resultDiv.innerHTML = "";
    quizDiv.innerHTML = summaryHtml;
}

function restartQuiz() {
  currentIndex = 0;
  selected = null;
  score = 0;
  attempted = 0;
  correct = 0;
  wrong = 0;
  lives = 3;
  hasAttempted = false;
  scoreCounter.textContent = score;
  livesCounter.textContent = lives;
  currentQuestionSpan.textContent = currentIndex + 1;

  localStorage.removeItem('quizState');  // <<<<< Clear saved state on restart
    document.querySelector('.buttons').style.display = 'flex';
  loadQuestion();
}

// ======== localStorage save/load functions ========
function saveQuizState() {
    const quizState = {
        currentIndex,
        selected,
        score,
        attempted,
        correct,
        wrong,
        lives,
        hasAttempted
    };
    localStorage.setItem('quizState', JSON.stringify(quizState));
}

function loadQuizState() {
    const saved = localStorage.getItem('quizState');
    if (saved) {
        const state = JSON.parse(saved);
        currentIndex = state.currentIndex || 0;
        selected = state.selected;
        score = state.score || 0;
        attempted = state.attempted || 0;
        correct = state.correct || 0;
        wrong = state.wrong || 0;
        lives = state.lives || 3;
        hasAttempted = state.hasAttempted || false;

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
