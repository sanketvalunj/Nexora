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
        type: 'mcq',
        question: "Choose the correct preposition: 'Er wartet ___ den Bus.'",
        options: ["auf", "an", "in", "mit"],
        answer: "auf"
    },
    {
        type: 'dnd_sentence',
        question: "Unscramble the words to say: 'He has to do his homework.'",
        words: ["machen", "seine", "muss", "Er", "Hausaufgaben"],
        answer: ["Er", "muss", "seine", "Hausaufgaben", "machen"]
    },
    {
        type: 'truefalse',
        question: "True or False: In a German sentence with a modal verb (like 'muss'), the main verb goes to the end.",
        correct: true
    },
    {
        type: 'fillblank',
        question: "Fill in the blank: 'Ich kann ___ nicht helfen, weil ich keine Zeit habe.' (means 'you', dative case)",
        correct: "dir"
    },
    {
        type: 'dnd_sentence',
        question: "Unscramble: 'We went for a walk in the park yesterday.'",
        words: ["spazieren", "sind", "gestern", "Wir", "im", "Park", "gegangen"],
        answer: ["Wir", "sind", "gestern", "im", "Park", "spazieren", "gegangen"]
    },
    {
        type: 'truefalse',
        question: "True or False: The German word 'aktuell' means 'actually'.",
        correct: false
    },
    {
        type: 'mcq',
        question: "Das ist der Mann, ______ ich gestern geholfen habe.",
        options: ["der", "das", "den", "dem"],
        answer: "dem"
    }
];

// Sound effects
const correctSound = new Audio("Audio_correct.mp3");
const wrongSound = new Audio("Audio_wrong.mp3");
const lessonCompleteSound = new Audio("lesson_complete.mp3");

// Quiz state variables
let currentIndex = 0;
let score = 0;
let lives = 3;
let attempted = 0;
let correct = 0;
let wrong = 0;
let hasAttempted = false;
let draggedItem = null;
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

// Initially hide check and next buttons, only skip visible if appropriate
checkBtn.style.display = "none";
nextBtn.style.display = "none";
skipBtn.style.display = "inline-block";

// Save quiz state to localStorage
function saveQuizState() {
    const quizState = {
        currentIndex,
        score,
        lives,
        attempted,
        correct,
        wrong,
        hasAttempted,
        correctQuestions,
        wrongQuestions,
        skippedQuestions
    };
    localStorage.setItem('quizState', JSON.stringify(quizState));
}

// Load quiz state from localStorage
function loadQuizState() {
    const saved = localStorage.getItem('quizState');
    if (saved) {
        const state = JSON.parse(saved);
        currentIndex = state.currentIndex || 0;
        score = state.score || 0;
        lives = state.lives || 3;
        attempted = state.attempted || 0;
        correct = state.correct || 0;
        wrong = state.wrong || 0;
        hasAttempted = state.hasAttempted || false;
        correctQuestions = state.correctQuestions || [];
        wrongQuestions = state.wrongQuestions || [];
        skippedQuestions = state.skippedQuestions || [];

        scoreCounter.textContent = score;
        livesCounter.textContent = lives;
        currentQuestionSpan.textContent = currentIndex + 1;
    }
}

// Load saved state on page load
window.onload = function() {
    loadQuizState();
    loadQuestion();
};

function loadQuestion() {
    if (lives <= 0 || currentIndex >= quizData.length) {
        showSummary();
        return;
    }

    const q = quizData[currentIndex];
    hasAttempted = false;
    selectedTF = null;
    draggedItem = null;
    resultDiv.innerHTML = "";
    checkBtn.style.display = "none";
    nextBtn.style.display = "none";
    skipBtn.style.display = "inline-block";
    currentQuestionSpan.textContent = currentIndex + 1;
    updateProgressBar();

    let questionHtml = `<div class="question">${q.question}</div>`;
    let answerHtml = '';

    switch (q.type) {
        case 'mcq':
            answerHtml = '<div class="mcq-options">';
            q.options.forEach(option => {
                answerHtml += `<button class="option-btn" onclick="checkAnswer(this)">${option}</button>`;
            });
            answerHtml += '</div>';
            break;
        case 'dnd_sentence':
            answerHtml = `
                <div id="dnd-drop-zone" class="dnd-container"></div>
                <div id="dnd-word-bank" class="dnd-container"></div>
                <button class="btn dnd-check-btn" onclick="checkAnswer()">Check Answer</button>
            `;
            break;
        case 'truefalse':
            answerHtml = `
                <div class="truefalse-buttons">
                    <button class="option-btn" onclick="selectTF(true, this)">True</button>
                    <button class="option-btn" onclick="selectTF(false, this)">False</button>
                </div>
            `;
            break;
        case 'fillblank':
            answerHtml = `
                <input type="text" id="fill-input" class="rearrange-input" placeholder="Type your answer...">
                <button class="btn btn-check" onclick="checkAnswer()" style="margin-top: 20px;">Check Answer</button>
            `;
            break;
    }
    quizDiv.innerHTML = questionHtml + answerHtml;

    if (q.type === 'dnd_sentence') {
        setupDragAndDrop(q);
    }

    // Save state after question load
    saveQuizState();
}

function setupDragAndDrop(question) {
    const dropZone = document.getElementById('dnd-drop-zone');
    const wordBank = document.getElementById('dnd-word-bank');

    dropZone.innerHTML = '';
    wordBank.innerHTML = '';

    for (let i = 0; i < question.answer.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'drop-slot';
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);
        dropZone.appendChild(slot);
    }

    question.words.sort(() => Math.random() - 0.5).forEach(word => {
        const chip = document.createElement('div');
        chip.textContent = word;
        chip.className = 'word-chip';
        chip.draggable = true;
        chip.addEventListener('dragstart', handleDragStart);
        chip.addEventListener('dragend', handleDragEnd);
        wordBank.appendChild(chip);
    });
    
    // Add event listeners to the word bank itself
    wordBank.addEventListener('dragover', handleDragOver);
    wordBank.addEventListener('dragleave', handleDragLeave);
    wordBank.addEventListener('drop', handleDrop);
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
    let isCorrect = false;
    let uiElement = quizDiv;

    switch (q.type) {
        case 'mcq':
            userAnswer = mcqButton.textContent;
            isCorrect = userAnswer.toLowerCase() === q.answer.toLowerCase();
            uiElement = mcqButton;
            document.querySelectorAll('.mcq-options .option-btn').forEach(btn => btn.disabled = true);
            break;
        case 'dnd_sentence':
            const dropZone = document.getElementById('dnd-drop-zone');
            userAnswer = Array.from(dropZone.querySelectorAll('.word-chip')).map(chip => chip.textContent);
            isCorrect = JSON.stringify(userAnswer) === JSON.stringify(q.answer);
            uiElement = dropZone;
            document.querySelectorAll('.word-chip').forEach(chip => chip.draggable = false);
            break;
        case 'truefalse':
            if (selectedTF === null) return;
            userAnswer = selectedTF;
            isCorrect = (userAnswer === q.correct);
            uiElement = document.querySelector('.truefalse-buttons .selected');
            document.querySelectorAll('.truefalse-buttons .option-btn').forEach(btn => btn.disabled = true);
            break;
        case 'fillblank':
            const input = document.getElementById('fill-input');
            userAnswer = input.value.trim();
            if (!userAnswer) {
                alert("Please type an answer.");
                return;
            }
            isCorrect = userAnswer.toLowerCase() === q.correct.toLowerCase();
            uiElement = input;
            input.disabled = true;
            break;
    }

    hasAttempted = true;
    attempted++;
    skipBtn.style.display = "none";
    document.querySelectorAll('.btn.dnd-check-btn, .btn.btn-check').forEach(b => b.style.display = 'none');

    if (isCorrect) {
        score += 10;
        correct++;
        correctQuestions.push({ ...q, userAnswer });
        resultDiv.innerHTML = `<div class="feedback correct"><span class="emoji">✅</span><p>Correct! 🎉</p></div>`;
        if(uiElement) uiElement.classList.add('correct');

        // Play correct sound
        correctSound.currentTime = 0;
        correctSound.play();
    } else {
        lives--;
        wrong++;
        wrongQuestions.push({ ...q, userAnswer });
        let correctAnswerText = q.answer;
        if (q.type === 'dnd_sentence') correctAnswerText = q.answer.join(' ');
        if (q.type === 'truefalse') correctAnswerText = q.correct;
        if (q.type === 'fillblank') correctAnswerText = q.correct;
        resultDiv.innerHTML = `<div class="feedback wrong"><span class="emoji">❌</span><p>Wrong! Correct: <b>${correctAnswerText}</b>.</p></div>`;
        if(uiElement) uiElement.classList.add('incorrect');

        // Play wrong sound
        wrongSound.currentTime = 0;
        wrongSound.play();
    }

    updateHud();
    prepareNextQuestion();

    // Save after answer
    saveQuizState();
}

function prepareNextQuestion() {
    if (lives > 0) {
        nextBtn.style.display = "inline-block";
    } else {
        setTimeout(showSummary, 1500);
    }
}

function handleDragStart(e) { draggedItem = e.target; e.target.classList.add('dragging'); }
function handleDragEnd(e) { e.target.classList.remove('dragging'); }
function handleDragOver(e) { e.preventDefault(); if (e.target.classList.contains('drop-slot') || e.target.id === 'dnd-word-bank') e.target.classList.add('drag-over'); }
function handleDragLeave(e) { e.target.classList.remove('drag-over'); }

function handleDrop(e) {
    e.preventDefault();
    const dropTarget = e.target;
    dropTarget.classList.remove('drag-over');

    if (draggedItem) {
        // If the drop target is a valid drop slot AND it's empty
        if (dropTarget.classList.contains('drop-slot') && !dropTarget.hasChildNodes()) {
            dropTarget.appendChild(draggedItem);
        } 
        // If the drop target is the word bank container itself, or a child of the word bank container
        else if (dropTarget.id === 'dnd-word-bank' || dropTarget.closest('#dnd-word-bank')) {
            document.getElementById('dnd-word-bank').appendChild(draggedItem);
        }
    }
}

function updateHud() {
    scoreCounter.textContent = score;
    livesCounter.textContent = lives;
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < quizData.length) {
        loadQuestion();
    } else {
        showSummary();
    }
    saveQuizState();
}

function skipQuestion() {
    if (hasAttempted) return;
    skippedQuestions.push(quizData[currentIndex]);
    nextQuestion();
}

function updateProgressBar() {
    const progress = ((currentIndex) / quizData.length) * 100;
    progressBar.style.width = progress + "%";
    const emoji = document.getElementById("progress-emoji");
    if (emoji) {
        emoji.style.left = `calc(${progress}% - 15px)`;
    }
}

function showSummary() {
    // Play completion sound
    lessonCompleteSound.play();

    quizDiv.innerHTML = "";
    checkBtn.style.display = "none";
    nextBtn.style.display = "none";
    skipBtn.style.display = "none";
      document.querySelector('.buttons').style.display = 'none';

    progressBar.style.width = "100%";

    const emoji = document.getElementById("progress-emoji");
    if (emoji) {
        emoji.style.left = 'calc(100% - 20px)';
    }
    
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
        <div class="summary-profile">
        
            <h3>Well done, ${username}!</h3>
        </div>
        <h2 class="summary-title">Intermediate German</h2>
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
            <button onclick="window.location.href='contents3.html'" class="btn restart-btn">Go to Contents</button>
        </div>
        
       
      </div>
    `;

    resultDiv.innerHTML = "";
    quizDiv.innerHTML = summaryHtml;

    // Clear saved state on quiz end
    localStorage.removeItem('quizState');
}


function restartQuiz() {
    currentIndex = 0;
    score = 0;
    lives = 3;
    attempted = 0;
    correct = 0;
    wrong = 0;
    hasAttempted = false;
    correctQuestions = [];
    wrongQuestions = [];
    skippedQuestions = [];

    updateHud();
    loadQuestion();
    localStorage.removeItem('quizState');
     document.querySelector('.buttons').style.display = 'flex';
}
