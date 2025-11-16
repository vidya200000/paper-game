const choices = ['rock', 'paper', 'scissors'];
const emojis = { rock: '✊', paper: '✋', scissors: '✌️' };

let playerScore = 0;
let computerScore = 0;
let liveMode = false;
let liveInterval;
let soundEnabled = true;
let difficulty = 'normal';

const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const playerDisplay = document.getElementById('player-display');
const computerDisplay = document.getElementById('computer-display');
const resultEl = document.getElementById('result');
const liveModeBtn = document.getElementById('live-mode-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const resetBtn = document.getElementById('reset-btn');
const cameraBtn = document.getElementById('camera-btn');
const difficultySelect = document.getElementById('difficulty-select');
const cameraContainer = document.getElementById('camera-container');
const cameraFeed = document.getElementById('camera-feed');
const gestureCanvas = document.getElementById('gesture-canvas');
const gestureStatus = document.getElementById('gesture-status');

// Audio context for sound effects
let audioContext;
try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
    console.warn('Web Audio API not supported');
}

// Function to play sound
function playSound(frequency, duration, type = 'sine') {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Particle system for win/lose effects
function createParticles(container, count, color) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = color;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 2000);
    }
}

document.querySelectorAll('.choice').forEach(choice => {
    choice.addEventListener('click', () => {
        const playerChoice = choice.dataset.choice;
        playSound(440, 0.1, 'square'); // Click sound
        playGame(playerChoice);
    });
});

function playGame(playerChoice) {
    let computerChoice;

    // Difficulty-based computer choice
    if (difficulty === 'easy') {
        // Computer has 30% chance to choose randomly, 70% chance to lose
        if (Math.random() < 0.3) {
            computerChoice = choices[Math.floor(Math.random() * choices.length)];
        } else {
            // Choose a losing move
            const losingMoves = choices.filter(choice => choice !== playerChoice && getWinner(playerChoice, choice) === 'player');
            computerChoice = losingMoves[Math.floor(Math.random() * losingMoves.length)];
        }
    } else if (difficulty === 'hard') {
        // Computer has 70% chance to choose winning move, 30% random
        if (Math.random() < 0.7) {
            // Choose a winning move
            const winningMoves = choices.filter(choice => getWinner(playerChoice, choice) === 'computer');
            computerChoice = winningMoves[Math.floor(Math.random() * winningMoves.length)];
        } else {
            computerChoice = choices[Math.floor(Math.random() * choices.length)];
        }
    } else {
        // Normal: random choice
        computerChoice = choices[Math.floor(Math.random() * choices.length)];
    }

    // Display choices with animation
    playerDisplay.textContent = emojis[playerChoice];
    playerDisplay.classList.add('animate');
    setTimeout(() => playerDisplay.classList.remove('animate'), 600);

    // Simulate computer thinking
    computerDisplay.textContent = '🤔';
    setTimeout(() => {
        computerDisplay.textContent = emojis[computerChoice];
        computerDisplay.classList.add('animate');
        setTimeout(() => computerDisplay.classList.remove('animate'), 600);

        // Determine winner
        const winner = getWinner(playerChoice, computerChoice);
        displayResult(winner, playerChoice, computerChoice);
    }, 1000);
}

function getWinner(player, computer) {
    if (player === computer) return 'tie';
    if (
        (player === 'rock' && computer === 'scissors') ||
        (player === 'paper' && computer === 'rock') ||
        (player === 'scissors' && computer === 'paper')
    ) {
        return 'player';
    }
    return 'computer';
}

function displayResult(winner, playerChoice, computerChoice) {
    let message = '';
    if (winner === 'tie') {
        message = "It's a tie!";
        playSound(300, 0.5, 'triangle'); // Tie sound
        createParticles(document.body, 30, '#ffff00'); // Yellow particles for tie
    } else if (winner === 'player') {
        message = 'You win!';
        playerScore++;
        playerScoreEl.textContent = playerScore;
        playerDisplay.classList.add('winner');
        computerDisplay.classList.add('loser');
        playSound(523, 0.3, 'sine'); // Win sound
        createParticles(document.body, 50, '#00ff00'); // More green particles for win
    } else {
        message = 'Computer wins!';
        computerScore++;
        computerScoreEl.textContent = computerScore;
        computerDisplay.classList.add('winner');
        playerDisplay.classList.add('loser');
        playSound(220, 0.3, 'sawtooth'); // Lose sound
        createParticles(document.body, 50, '#ff0000'); // More red particles for lose
    }

    resultEl.textContent = message;
    resultEl.style.opacity = '1';

    // Reset after 2 seconds for faster live feel
    setTimeout(() => {
        resultEl.style.opacity = '0';
        playerDisplay.classList.remove('winner', 'loser');
        computerDisplay.classList.remove('winner', 'loser');

        // Remove old automation, now handled by live mode
    }, 2000);
}

// Live mode functionality
liveModeBtn.addEventListener('click', () => {
    liveMode = !liveMode;
    if (liveMode) {
        liveModeBtn.textContent = 'Stop Live Mode';
        startLiveMode();
    } else {
        liveModeBtn.textContent = 'Start Live Mode';
        stopLiveMode();
    }
});

function startLiveMode() {
    // Add live effects
    document.body.classList.add('live-glow');
    document.querySelector('.game-container').classList.add('live-shake');

    liveInterval = setInterval(() => {
        const playerChoice = choices[Math.floor(Math.random() * choices.length)];
        playGame(playerChoice);
    }, 2500); // Play every 2.5 seconds
}

function stopLiveMode() {
    clearInterval(liveInterval);
    // Remove live effects
    document.body.classList.remove('live-glow');
    document.querySelector('.game-container').classList.remove('live-shake');
}

// Sound toggle functionality
soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
});

// Reset scores functionality
resetBtn.addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
    playSound(800, 0.2, 'square'); // Reset sound
});

// Difficulty selector functionality
difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value;
    playSound(600, 0.1, 'sine'); // Change sound
});

// Override playSound to respect sound toggle
const originalPlaySound = playSound;
playSound = function(frequency, duration, type = 'sine') {
    if (!soundEnabled) return;
    return originalPlaySound(frequency, duration, type);
};

// Camera and gesture recognition functionality using MediaPipe Hands
let cameraEnabled = false;
let gestureDetected = false;
let lastGestureTime = 0;
let hands;
let camera;

cameraBtn.addEventListener('click', async () => {
    if (!cameraEnabled) {
        try {
            cameraContainer.style.display = 'block';
            cameraBtn.textContent = '📷 Disable Camera';
            cameraEnabled = true;
            gestureStatus.textContent = 'Gesture: Loading MediaPipe...';
            startMediaPipeHands();
        } catch (error) {
            console.error('Error initializing MediaPipe:', error);
            alert('Failed to initialize gesture recognition. Please try again.');
        }
    } else {
        stopCamera();
    }
});

function stopCamera() {
    if (camera) {
        camera.stop();
        camera = null;
    }
    if (hands) {
        hands.close();
        hands = null;
    }
    cameraContainer.style.display = 'none';
    cameraBtn.textContent = '📷 Enable Camera';
    cameraEnabled = false;
    gestureStatus.textContent = 'Gesture: Camera disabled';
}

function startMediaPipeHands() {
    const videoElement = cameraFeed;
    const canvasElement = gestureCanvas;
    const canvasCtx = canvasElement.getContext('2d');

    // Initialize MediaPipe Hands
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    // Initialize camera
    camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({image: videoElement});
        },
        width: 320,
        height: 240
    });

    camera.start();
    gestureStatus.textContent = 'Gesture: Camera ready - show your hand!';
}

function onResults(results) {
    const canvasElement = gestureCanvas;
    const canvasCtx = canvasElement.getContext('2d');

    // Draw the hand landmarks on the canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(cameraFeed, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // Draw hand landmarks
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
        drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});

        // Detect gesture
        const gesture = detectGestureFromLandmarks(landmarks);
        gestureStatus.textContent = `Gesture: ${gesture}`;

        // Trigger game if gesture detected and enough time has passed
        if (gesture !== 'none' && !gestureDetected && Date.now() - lastGestureTime > 2000) {
            gestureDetected = true;
            lastGestureTime = Date.now();
            playSound(440, 0.1, 'square');
            playGame(gesture);

            setTimeout(() => {
                gestureDetected = false;
            }, 1000);
        }
    } else {
        gestureStatus.textContent = 'Gesture: No hand detected';
    }

    canvasCtx.restore();
}

function detectGestureFromLandmarks(landmarks) {
    // MediaPipe hand landmarks indices:
    // 0: wrist, 4: thumb tip, 8: index tip, 12: middle tip, 16: ring tip, 20: pinky tip

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    // Get finger base positions for comparison
    const thumbBase = landmarks[2];
    const indexBase = landmarks[5];
    const middleBase = landmarks[9];
    const ringBase = landmarks[13];
    const pinkyBase = landmarks[17];

    // Check if fingers are extended (tip is above base in y-direction, assuming hand is upright)
    const thumbExtended = thumbTip.y < thumbBase.y;
    const indexExtended = indexTip.y < indexBase.y;
    const middleExtended = middleTip.y < middleBase.y;
    const ringExtended = ringTip.y < ringBase.y;
    const pinkyExtended = pinkyTip.y < pinkyBase.y;

    const extendedFingers = [thumbExtended, indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

    // Rock: Fist (no fingers extended or only thumb)
    if (extendedFingers <= 1) {
        return 'rock';
    }
    // Paper: Open hand (all fingers extended)
    else if (extendedFingers >= 4) {
        return 'paper';
    }
    // Scissors: Index and middle fingers extended
    else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
        return 'scissors';
    }

    return 'none';
}
