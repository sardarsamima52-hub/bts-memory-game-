// BTS Game Data
const btsMembers = [
    { id: 1, name: "RM", icon: "fas fa-globe-asia", color: "#6a1b9a" },
    { id: 2, name: "Jin", icon: "fas fa-utensils", color: "#e91e63" },
    { id: 3, name: "SUGA", icon: "fas fa-music", color: "#2196f3" },
    { id: 4, name: "j-hope", icon: "fas fa-sun", color: "#4caf50" },
    { id: 5, name: "Jimin", icon: "fas fa-dove", color: "#ff9800" },
    { id: 6, name: "V", icon: "fas fa-palette", color: "#9c27b0" },
    { id: 7, name: "Jung Kook", icon: "fas fa-bolt", color: "#f44336" },
    { id: 8, name: "BTS", icon: "fas fa-heart", color: "#ff4081" }
];

// Game State
let gameState = {
    difficulty: "easy",
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: 0,
    timerInterval: null,
    gameStarted: false,
    hintsUsed: 0,
    maxHints: 3
};

// Difficulty Settings
const difficultySettings = {
    easy: { pairs: 8, columns: 4 },
    medium: { pairs: 12, columns: 6 },
    hard: { pairs: 16, columns: 8 }
};

// DOM Elements
const gameBoard = document.getElementById('gameBoard');
const movesElement = document.getElementById('moves');
const timerElement = document.getElementById('timer');
const matchesElement = document.getElementById('matches');
const resetBtn = document.getElementById('resetBtn');
const hintBtn = document.getElementById('hintBtn');
const winMessage = document.getElementById('winMessage');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');
const playAgainBtn = document.getElementById('playAgainBtn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

// Initialize Game
function initGame() {
    // Reset game state
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.timer = 0;
    gameState.gameStarted = false;
    gameState.hintsUsed = 0;
    
    // Clear game board
    gameBoard.innerHTML = '';
    
    // Set difficulty
    const settings = difficultySettings[gameState.difficulty];
    gameBoard.style.gridTemplateColumns = `repeat(${settings.columns}, 1fr)`;
    
    // Create card pairs
    const selectedMembers = btsMembers.slice(0, settings.pairs);
    const cardPairs = [...selectedMembers, ...selectedMembers];
    
    // Shuffle cards
    shuffleArray(cardPairs);
    
    // Create cards
    cardPairs.forEach((member, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = member.id;
        card.dataset.index = index;
        
        // Card front
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.style.background = `linear-gradient(45deg, ${member.color}, ${darkenColor(member.color, 20)})`;
        
        const memberIcon = document.createElement('i');
        memberIcon.className = member.icon;
        cardFront.appendChild(memberIcon);
        
        const memberName = document.createElement('div');
        memberName.className = 'member-name';
        memberName.textContent = member.name;
        cardFront.appendChild(memberName);
        
        // Card back
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        
        const backIcon = document.createElement('i');
        backIcon.className = 'fas fa-heart';
        cardBack.appendChild(backIcon);
        
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        
        // Add click event
        card.addEventListener('click', () => flipCard(card));
        
        gameBoard.appendChild(card);
        gameState.cards.push({
            element: card,
            member: member,
            isFlipped: false,
            isMatched: false
        });
    });
    
    // Update UI
    updateUI();
    
    // Stop timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Reset timer display
    timerElement.textContent = '00:00';
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Darken color
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Flip card
function flipCard(cardElement) {
    const cardIndex = parseInt(cardElement.dataset.index);
    const card = gameState.cards[cardIndex];
    
    // Check if can flip
    if (card.isFlipped || card.isMatched || gameState.flippedCards.length >= 2) {
        return;
    }
    
    // Start timer on first move
    if (!gameState.gameStarted) {
        startTimer();
        gameState.gameStarted = true;
    }
    
    // Flip the card
    cardElement.classList.add('flipped');
    card.isFlipped = true;
    gameState.flippedCards.push(card);
    
    // Check for match when two cards are flipped
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        updateUI();
        
        const [card1, card2] = gameState.flippedCards;
        
        if (card1.member.id === card2.member.id) {
            // Match found
            setTimeout(() => {
                card1.element.classList.add('matched');
                card2.element.classList.add('matched');
                card1.isMatched = true;
                card2.isMatched = true;
                
                gameState.matchedPairs++;
                gameState.flippedCards = [];
                
                updateUI();
                
                // Check for win
                const totalPairs = difficultySettings[gameState.difficulty].pairs;
                if (gameState.matchedPairs === totalPairs) {
                    endGame();
                }
            }, 500);
        } else {
            // No match
            setTimeout(() => {
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                card1.isFlipped = false;
                card2.isFlipped = false;
                gameState.flippedCards = [];
            }, 1000);
        }
    }
}

// Start timer
function startTimer() {
    gameState.timer = 0;
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimerDisplay();
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timer / 60).toString().padStart(2, '0');
    const seconds = (gameState.timer % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
}

// Update UI
function updateUI() {
    movesElement.textContent = gameState.moves;
    
    const totalPairs = difficultySettings[gameState.difficulty].pairs;
    matchesElement.textContent = `${gameState.matchedPairs}/${totalPairs}`;
    
    // Update hint button
    hintBtn.innerHTML = `<i class="fas fa-lightbulb"></i> Hint (${gameState.maxHints - gameState.hintsUsed})`;
    hintBtn.disabled = gameState.hintsUsed >= gameState.maxHints;
}

// Provide hint
function provideHint() {
    if (gameState.hintsUsed >= gameState.maxHints || gameState.matchedPairs === difficultySettings[gameState.difficulty].pairs) {
        return;
    }
    
    // Find unmatched cards
    const unmatchedCards = gameState.cards.filter(card => !card.isMatched && !card.isFlipped);
    
    if (unmatchedCards.length < 2) return;
    
    // Find matching pairs
    const matches = {};
    let hintCards = [];
    
    for (const card of unmatchedCards) {
        if (!matches[card.member.id]) {
            matches[card.member.id] = [card];
        } else {
            matches[card.member.id].push(card);
            hintCards = matches[card.member.id];
            break;
        }
    }
    
    if (hintCards.length === 2) {
        // Highlight matching cards
        hintCards.forEach(card => {
            card.element.style.boxShadow = '0 0 20px gold, 0 0 30px gold';
            card.element.style.transition = 'box-shadow 0.3s';
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
                card.element.style.boxShadow = '';
            }, 2000);
        });
        
        gameState.hintsUsed++;
        updateUI();
    }
}

// End game
function endGame() {
    clearInterval(gameState.timerInterval);
    
    // Update win message
    finalMoves.textContent = gameState.moves;
    finalTime.textContent = timerElement.textContent;
    
    // Show win message
    setTimeout(() => {
        winMessage.style.display = 'flex';
    }, 1000);
}

// Set difficulty
function setDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    
    // Update active button
    difficultyButtons.forEach(btn => {
        if (btn.dataset.level === difficulty) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Initialize game with new difficulty
    initGame();
}

// Share game
function shareGame() {
    const url = window.location.href;
    const text = "Check out this awesome BTS Memory Game! 🎵 Can you beat my score?";
    
    if (navigator.share) {
        navigator.share({
            title: 'BTS Memory Game',
            text: text,
            url: url
        });
    } else {
        // Fallback for desktop
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank');
    }
}

// Event Listeners
resetBtn.addEventListener('click', initGame);
hintBtn.addEventListener('click', provideHint);
playAgainBtn.addEventListener('click', () => {
    winMessage.style.display = 'none';
    initGame();
});

difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setDifficulty(btn.dataset.level);
    });
});

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', initGame);