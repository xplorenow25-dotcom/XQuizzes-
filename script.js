// --- DOM Elements ---
const screens = {
    loading: document.getElementById('loading-screen'),
    quiz: document.getElementById('quiz-screen'),
    results: document.getElementById('results-screen'),
    header: document.getElementById('quiz-header')
};

const ui = {
    questionText: document.getElementById('question-text'),
    optionsContainer: document.getElementById('options-container'),
    btnCheck: document.getElementById('btn-check'),
    btnNext: document.getElementById('btn-next'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    explanationContainer: document.getElementById('explanation-container'),
    explanationText: document.getElementById('explanation-text'),
    scorePercentage: document.getElementById('score-percentage'),
    scoreText: document.getElementById('score-text'),
    totalText: document.getElementById('total-text')
};

// --- State Management ---
let questions = [];
let currentIndex = 0;
let currentScore = 0;
let selectedOptionIndex = null;
let hasCheckedAnswer = false;

// --- Initialization ---
async function init() {
    try {
        // Must run on a local server (e.g., Live Server) for fetch to work locally
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to load questions');
        
        questions = await response.json();
        
        screens.loading.classList.add('hidden');
        screens.header.classList.remove('hidden');
        screens.quiz.classList.remove('hidden');
        screens.quiz.classList.add('flex');
        
        loadQuestion();
    } catch (error) {
        console.error("Error loading quiz data:", error);
        screens.loading.innerHTML = `<p class="text-red-500 font-medium">Error loading questions. Ensure questions.json exists and you are running a local server.</p>`;
    }
}

// --- Core Logic ---
function loadQuestion() {
    // Reset state for new question
    selectedOptionIndex = null;
    hasCheckedAnswer = false;
    ui.btnCheck.disabled = true;
    ui.btnCheck.classList.remove('hidden');
    ui.btnNext.classList.add('hidden');
    ui.explanationContainer.classList.add('hidden');
    
    const currentQuestion = questions[currentIndex];
    ui.questionText.textContent = currentQuestion.question;
    
    // Render Options
    ui.optionsContainer.innerHTML = '';
    currentQuestion.options.forEach((optionText, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.textContent = optionText;
        optionBtn.className = `w-full text-left p-4 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all font-medium text-gray-700`;
        
        optionBtn.onclick = () => selectOption(index, optionBtn);
        ui.optionsContainer.appendChild(optionBtn);
    });

    updateProgress();
}

function selectOption(index, buttonElement) {
    if (hasCheckedAnswer) return; // Prevent selection changes after checking

    selectedOptionIndex = index;
    ui.btnCheck.disabled = false;

    // Reset styles for all options
    const allOptions = ui.optionsContainer.children;
    Array.from(allOptions).forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50');
        btn.classList.add('border-gray-200', 'bg-white');
    });

    // Highlight selected option
    buttonElement.classList.remove('border-gray-200', 'bg-white');
    buttonElement.classList.add('border-blue-500', 'bg-blue-50');
}

function checkAnswer() {
    if (selectedOptionIndex === null) return;
    hasCheckedAnswer = true;

    const currentQuestion = questions[currentIndex];
    const isCorrect = (selectedOptionIndex === currentQuestion.correctIndex);
    
    if (isCorrect) currentScore++;

    // Color code options
    const allOptions = ui.optionsContainer.children;
    Array.from(allOptions).forEach((btn, index) => {
        btn.disabled = true; // Lock inputs
        
        if (index === currentQuestion.correctIndex) {
            // Highlight correct answer in Green
            btn.classList.add('option-correct', 'border-green-500');
        } else if (index === selectedOptionIndex && !isCorrect) {
            // Highlight user's incorrect answer in Red
            btn.classList.add('option-incorrect', 'border-red-500');
        }
    });

    // Swap buttons
    ui.btnCheck.classList.add('hidden');
    ui.btnNext.classList.remove('hidden');

    // Trigger Explanation
    triggerShowExplanationHook(currentQuestion.explanation);
}

// --- Monetization Hook ---
function triggerShowExplanationHook(explanationText) {
    /** * FUTURE MONETIZATION SLOT:
     * This is where you can intercept the flow to show a rewarded ad.
     * e.g.,
     * if (adManager.isReady() && shouldShowAd()) {
     * adManager.showRewarded(() => displayExplanationToUser(explanationText));
     * } else {
     * displayExplanationToUser(explanationText);
     * }
     */
    displayExplanationToUser(explanationText);
}

function displayExplanationToUser(text) {
    ui.explanationText.textContent = text;
    ui.explanationContainer.classList.remove('hidden');
}

// --- Navigation & State ---
function nextQuestion() {
    currentIndex++;
    if (currentIndex < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function updateProgress() {
    const total = questions.length;
    const current = currentIndex + 1;
    ui.progressText.textContent = `${current}/${total}`;
    
    const percentage = (current / total) * 100;
    ui.progressBar.style.width = `${percentage}%`;
}

function showResults() {
    screens.header.classList.add('hidden');
    screens.quiz.classList.add('hidden');
    screens.results.classList.remove('hidden');
    screens.results.classList.add('flex');

    const percentage = Math.round((currentScore / questions.length) * 100);
    
    ui.scorePercentage.textContent = `${percentage}%`;
    ui.scoreText.textContent = currentScore;
    ui.totalText.textContent = questions.length;
}

// --- Event Listeners ---
ui.btnCheck.addEventListener('click', checkAnswer);
ui.btnNext.addEventListener('click', nextQuestion);

// Start the app
init();
