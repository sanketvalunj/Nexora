document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const screens = document.querySelectorAll('.screen');
    const welcomeScreen = document.getElementById('welcome-screen');
    const languageScreen = document.getElementById('language-screen');
    const difficultyScreen = document.getElementById('difficulty-screen');
    const exerciseScreen = document.getElementById('exercise-screen');
    const resultScreen = document.getElementById('result-screen');
    const profileScreen = document.getElementById('profile-screen');

    // Buttons
    const beginBtn = document.getElementById('begin-btn');
    const languageCards = document.querySelectorAll('.language-cards .card');
    const difficultyBtns = document.querySelectorAll('.difficulty-buttons .btn');
    const showProfileBtn = document.getElementById('show-profile-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const retryBtn = document.getElementById('retry-btn');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');

    // User Info & Avatars
    const nicknameInput = document.getElementById('nickname');
    const avatars = document.querySelectorAll('.avatar');
    
    // Game HUD
    const heartsContainer = document.getElementById('hearts-container');
    const xpBar = document.getElementById('xp-bar');
    const xpText = document.getElementById('xp-text');

    // Content Areas
    const exerciseContent = document.getElementById('exercise-content');
    const feedbackPopup = document.getElementById('feedback-popup');
    
    // Result Screen Elements
    const resultTitle = document.getElementById('result-title');
    const resultXp = document.getElementById('result-xp');
    const resultHearts = document.getElementById('result-hearts');
    const resultStars = document.getElementById('result-stars');
    const levelUpMessage = document.getElementById('level-up-message');

    // Profile Screen Elements
    const profileAvatar = document.getElementById('profile-avatar');
    const profileNickname = document.getElementById('profile-nickname');
    const profileXp = document.getElementById('profile-xp');
    const profileLevel = document.getElementById('profile-level');

    // Footer & Counters
    const supportFooter = document.getElementById('support-footer');
    const visitorCounter = document.getElementById('visitor-counter');
    const learnerCountSpan = document.getElementById('learner-count');

    // Audio
    const correctSound = document.getElementById('correct-sound');
    const incorrectSound = document.getElementById('incorrect-sound');

    // --- Game State & localStorage ---
    let gameState = {};

    const defaultState = {
        nickname: 'Explorer',
        avatarId: '1',
        language: '',
        difficulty: '',
        xp: 0,
        level: 1,
        totalHearts: 3,
        currentHearts: 3,
        currentExerciseIndex: 0,
        currentSessionXp: 0,
    };
    
    // In a real app, this would come from a server or a larger JSON file.
    const exercises = {
        spanish: {
            easy: [
                { type: 'mcq', question: 'How do you say "hello"?', options: ['Hola', 'Adiós', 'Gracias', 'Por favor'], answer: 'Hola' },
                { type: 'fill', sentence: 'El gato es ___. (black)', answer: 'negro' },
                { type: 'match', pairs: [{ item: 'Apple', match: 'Manzana' }, { item: 'Water', match: 'Agua' }] },
                { type: 'mcq', question: 'What is "goodbye"?', options: ['Sí', 'No', 'Adiós', 'Amigo'], answer: 'Adiós' },
            ],
            // Add medium and hard questions
        },
        french: {
            easy: [
                { type: 'mcq', question: 'How do you say "hello"?', options: ['Bonjour', 'Au revoir', 'Merci', "S'il vous plaît"], answer: 'Bonjour' },
                { type: 'fill', sentence: 'Le chat est ___. (black)', answer: 'noir' },
                { type: 'match', pairs: [{ item: 'Apple', match: 'Pomme' }, { item: 'Water', match: 'Eau' }] },
            ],
        },
        german: { /* ... */ },
        japanese: { /* ... */ }
    };

    function loadState() {
        const savedState = localStorage.getItem('linguaQuestState');
        gameState = savedState ? JSON.parse(savedState) : { ...defaultState };
        // Ensure all keys from defaultState are present
        Object.keys(defaultState).forEach(key => {
            if (gameState[key] === undefined) {
                gameState[key] = defaultState[key];
            }
        });
    }

    function saveState() {
        localStorage.setItem('linguaQuestState', JSON.stringify(gameState));
    }

    // --- Navigation ---
    function showScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.toggle('active', screen.id === screenId);
        });
    }

    // --- UI Updates ---
    function updateHUD() {
        // Hearts
        heartsContainer.innerHTML = '';
        for (let i = 0; i < gameState.totalHearts; i++) {
            const heartIcon = document.createElement('i');
            heartIcon.className = `fas fa-heart ${i >= gameState.currentHearts ? 'lost' : ''}`;
            heartsContainer.appendChild(heartIcon);
        }

        // XP Bar
        const xpForNextLevel = gameState.level * 100;
        const currentLevelXp = gameState.xp - ((gameState.level - 1) * 100);
        const xpPercentage = (currentLevelXp / xpForNextLevel) * 100;
        xpBar.style.width = `${xpPercentage}%`;
        xpText.textContent = `${gameState.xp} XP`;
    }
    
    function showFeedback(message, isCorrect) {
        feedbackPopup.textContent = message;
        feedbackPopup.className = `show ${isCorrect ? 'correct' : 'incorrect'}`;
        (isCorrect ? correctSound : incorrectSound).play();
        
        setTimeout(() => {
            feedbackPopup.className = '';
        }, 1200);
    }
    
    // --- Gamification Logic ---
    function updateXp(points) {
        gameState.xp += points;
        gameState.currentSessionXp += points > 0 ? points : 0; // Only track positive XP for session
        updateHUD();
        
        // Check for level up
        const xpForNextLevel = gameState.level * 100;
        if (gameState.xp >= xpForNextLevel) {
            gameState.level++;
            // Could add a special level up notification here
        }
        saveState();
    }
    
    function loseHeart() {
        gameState.currentHearts--;
        updateHUD();
        if (gameState.currentHearts <= 0) {
            endSession(false); // Game over
        }
        saveState();
    }
    
    // --- Exercise Logic ---
    function startSession() {
        gameState.currentHearts = gameState.totalHearts;
        gameState.currentExerciseIndex = 0;
        gameState.currentSessionXp = 0;
        updateHUD();
        loadNextExercise();
        showScreen('exercise-screen');
    }
    
    function loadNextExercise() {
        const lang = gameState.language;
        const diff = gameState.difficulty;
        const currentExercises = exercises[lang]?.[diff];

        if (!currentExercises || gameState.currentExerciseIndex >= currentExercises.length) {
            endSession(true); // Session complete
            return;
        }

        const exercise = currentExercises[gameState.currentExerciseIndex];
        renderExercise(exercise);
    }

    function renderExercise(exercise) {
        exerciseContent.innerHTML = `<h3>${exercise.question || ''}</h3>`;
        switch (exercise.type) {
            case 'mcq':
                renderMCQ(exercise);
                break;
            case 'fill':
                renderFillInTheBlank(exercise);
                break;
            case 'match':
                renderMatching(exercise);
                break;
        }
    }
    
    function renderMCQ(exercise) {
        const optionsHtml = exercise.options.map(opt => `<button class="option-btn">${opt}</button>`).join('');
        exerciseContent.innerHTML += `<div class="mcq-options">${optionsHtml}</div>`;
        
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAnswer('mcq', btn, exercise.answer));
        });
    }

    function renderFillInTheBlank(exercise) {
        const sentenceHtml = `<p class="fill-in-blank">${exercise.sentence.replace('___', '<input type="text" id="fill-answer">')}</p><button class="btn btn-secondary" id="submit-fill">Check</button>`;
        exerciseContent.innerHTML += sentenceHtml;
        
        document.getElementById('submit-fill').addEventListener('click', () => {
             const userAnswer = document.getElementById('fill-answer').value;
             handleAnswer('fill', userAnswer, exercise.answer);
        });
    }
    
    function renderMatching(exercise) {
        // Simplified version for demonstration
        exerciseContent.innerHTML = `<p>Matching game UI would go here. This is complex and often requires a library for robust drag-drop.</p><button id="skip-match" class="btn btn-secondary">Continue (Demo)</button>`;
        document.getElementById('skip-match').addEventListener('click', () => handleAnswer('match', true, true));
    }
    
    function handleAnswer(type, userAnswerEl, correctAnswer) {
        let isCorrect;
        
        if (type === 'mcq') {
            isCorrect = userAnswerEl.textContent.toLowerCase() === correctAnswer.toLowerCase();
            document.querySelectorAll('.option-btn').forEach(b => b.disabled = true); // Disable all options
            userAnswerEl.classList.add(isCorrect ? 'correct' : 'incorrect');
        } else if (type === 'fill') {
            isCorrect = userAnswerEl.trim().toLowerCase() === correctAnswer.toLowerCase();
        } else { // For matching or other types
            isCorrect = userAnswerEl === correctAnswer;
        }

        if (isCorrect) {
            showFeedback('Good Job!', true);
            updateXp(10);
        } else {
            showFeedback('Oops! Try again.', false);
            loseHeart();
            updateXp(-5);
        }

        gameState.currentExerciseIndex++;
        saveState();

        setTimeout(() => {
            if (gameState.currentHearts > 0) {
                loadNextExercise();
            }
        }, 1500);
    }

    function endSession(completed) {
        resultTitle.textContent = completed ? 'Level Complete!' : 'Game Over!';
        resultXp.textContent = gameState.currentSessionXp;
        resultHearts.innerHTML = '';
        for (let i=0; i < gameState.currentHearts; i++) resultHearts.innerHTML += '❤️';

        // Star logic
        const performance = gameState.currentHearts / gameState.totalHearts;
        let stars = '⭐';
        if (performance > 0.5) stars += '⭐';
        if (performance === 1) stars += '⭐';
        resultStars.textContent = stars;
        
        // Level up message
        const xpForNextLevel = gameState.level * 100;
        levelUpMessage.textContent = gameState.xp >= xpForNextLevel ? "Next Level Unlocked!" : "";

        // Button visibility
        retryBtn.style.display = completed ? 'none' : 'block';
        nextLevelBtn.style.display = completed ? 'block' : 'none';
        
        showScreen('result-screen');
    }

    // --- Profile & Welcome Logic ---
    function setupWelcomeScreen() {
        nicknameInput.value = gameState.nickname;
        avatars.forEach(avatar => {
            avatar.classList.toggle('selected', avatar.dataset.avatar === gameState.avatarId);
        });
    }

    // avatars
function updateProfilePage() {
    profileNickname.textContent = gameState.nickname;
    profileXp.textContent = gameState.xp;
    profileLevel.textContent = gameState.level;
    profileAvatar.src = `https://api.dicebear.com/8.x/bottts/svg?seed=${getAvatarSeed(gameState.avatarId)}`;
}

function getAvatarSeed(id) {
    const seeds = ['Casper', 'Rocky', 'Misty', 'Coco'];
    return seeds[parseInt(id) - 1] || 'Casper';
}
    
  

    // --- Counters & Footer ---
    function setupCounters() {
        // Visitor Counter
        let visitors = localStorage.getItem('linguaQuestVisitors');
        if (!visitors) {
            visitors = 1;
        } else {
            visitors = parseInt(visitors) + 1;
        }
        localStorage.setItem('linguaQuestVisitors', visitors);
        visitorCounter.textContent = visitors;

        // Animate Learner Counter
        const targetLearners = 5000;
        let currentLearners = 0;
        const increment = Math.ceil(targetLearners / 100);
        const interval = setInterval(() => {
            currentLearners += increment;
            if (currentLearners >= targetLearners) {
                currentLearners = targetLearners;
                clearInterval(interval);
            }
            learnerCountSpan.textContent = currentLearners.toLocaleString();
        }, 20);
    }
    
    function handleScroll() {
        const threshold = document.body.scrollHeight - window.innerHeight - 50;
        if (window.scrollY > threshold) {
            supportFooter.classList.add('visible');
        } else {
            supportFooter.classList.remove('visible');
        }
    }


    // --- Event Listeners ---
    avatars.forEach(avatar => {
        avatar.addEventListener('click', () => {
            gameState.avatarId = avatar.dataset.avatar;
            avatars.forEach(a => a.classList.remove('selected'));
            avatar.classList.add('selected');
            // If on profile page, update immediately
            if(profileScreen.classList.contains('active')) {
                updateProfilePage();
                saveState();
            }
        });
    });

    beginBtn.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim();
        if (!nickname) {
            alert('Please enter your Pookie Name!');
            return;
        }
        gameState.nickname = nickname;
        saveState();
        showScreen('language-screen');
    });
    
    languageCards.forEach(card => {
        card.addEventListener('click', () => {
            gameState.language = card.dataset.lang;
            // Check if exercises exist for this language
            if (!exercises[gameState.language] || !exercises[gameState.language].easy) {
                alert('Coming Soon! Exercises for this language are under development.');
                return;
            }
            saveState();
            showScreen('difficulty-screen');
        });
    });
    
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gameState.difficulty = btn.dataset.difficulty;
            saveState();
            startSession();
        });
    });
    
    showProfileBtn.addEventListener('click', () => {
        updateProfilePage();
        showScreen('profile-screen');
    });

    backToMenuBtn.addEventListener('click', () => showScreen('language-screen'));
    mainMenuBtn.addEventListener('click', () => showScreen('language-screen'));
    nextLevelBtn.addEventListener('click', () => showScreen('language-screen')); // Or go to a new level
    retryBtn.addEventListener('click', () => startSession());
    
    window.addEventListener('scroll', handleScroll);

    // --- Initialization ---
    function init() {
        loadState();
        setupWelcomeScreen();
        setupCounters();
        // If user data exists, maybe skip welcome screen
        if (gameState.nickname !== 'Explorer') {
            showScreen('language-screen');
        } else {
            showScreen('welcome-screen');
        }
    }

    init();
});