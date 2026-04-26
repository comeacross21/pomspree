
// --- Existing Lotto & Menu Logic (Omitted for brevity, but assume it exists above or below) ---

// --- Ladder Game Logic ---
const ladderSetupCard = document.getElementById('setup-card');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const toStep2Btn = document.getElementById('to-step-2');
const toGameBtn = document.getElementById('to-game');
const playerCountInput = document.getElementById('player-count');
const playerInputsContainer = document.getElementById('player-inputs');
const gameArea = document.getElementById('game-area');
const ladderCanvas = document.getElementById('ladder-canvas');
const topLabels = document.getElementById('top-labels');
const bottomLabels = document.getElementById('bottom-labels');
const executionInfo = document.getElementById('execution-info');
const startExecutionBtn = document.getElementById('start-execution-btn');
const resetGameBtn = document.getElementById('reset-game-btn');

let ladderData = {
    players: [],
    outcomes: [],
    lines: [], // horizontal bridges
    verticalCount: 0,
    executedCount: 0
};

if (toStep2Btn) {
    toStep2Btn.addEventListener('click', () => {
        const count = parseInt(playerCountInput.value);
        if (count < 2 || count > 10) return alert('2명에서 10명 사이로 입력해주세요.');
        
        playerInputsContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            playerInputsContainer.innerHTML += `
                <div class="participant-input-group">
                    <label>참가자 ${i+1}</label>
                    <input type="text" class="player-name" placeholder="이름" value="사람 ${i+1}">
                    <input type="text" class="player-outcome" placeholder="결과" value="${i === 0 ? '당첨' : '꽝'}">
                </div>
            `;
        }
        
        step1.classList.remove('active');
        step2.classList.add('active');
    });
}

if (toGameBtn) {
    toGameBtn.addEventListener('click', () => {
        const names = Array.from(document.querySelectorAll('.player-name')).map(input => input.value || '무명');
        const outcomes = Array.from(document.querySelectorAll('.player-outcome')).map(input => input.value || '결과없음');
        
        ladderData.players = names;
        ladderData.outcomes = outcomes;
        ladderData.verticalCount = names.length;
        ladderData.executedCount = 0;
        
        generateLadderLines();
        setupGameUI();
        
        ladderSetupCard.style.display = 'none';
        gameArea.style.display = 'flex';
        startExecutionBtn.style.display = 'block';
        executionInfo.textContent = '실행 버튼을 눌러주세요.';
    });
}

function generateLadderLines() {
    ladderData.lines = [];
    const rows = 10; // Number of potential bridge levels
    for (let r = 0; r < rows; r++) {
        for (let v = 0; v < ladderData.verticalCount - 1; v++) {
            if (Math.random() > 0.6) {
                // Prevent adjacent horizontal lines at same level
                if (v > 0 && ladderData.lines.some(l => l.row === r && l.v === v - 1)) continue;
                ladderData.lines.push({ row: r, v: v });
            }
        }
    }
}

function setupGameUI() {
    const width = Math.min(window.innerWidth * 0.9, 600);
    const height = 400;
    ladderCanvas.width = width;
    ladderCanvas.height = height;
    
    topLabels.innerHTML = '';
    bottomLabels.innerHTML = '';
    
    const spacing = width / (ladderData.verticalCount + 1);
    
    ladderData.players.forEach((name, i) => {
        const label = document.createElement('div');
        label.className = 'label-box';
        label.textContent = name;
        label.style.width = '60px';
        topLabels.appendChild(label);
    });
    
    ladderData.outcomes.forEach((text, i) => {
        const label = document.createElement('div');
        label.className = 'label-box';
        label.textContent = text;
        label.style.width = '60px';
        bottomLabels.appendChild(label);
    });
    
    drawLadder();
}

function drawLadder(highlightPath = null) {
    const ctx = ladderCanvas.getContext('2d');
    const w = ladderCanvas.width;
    const h = ladderCanvas.height;
    const vCount = ladderData.verticalCount;
    const spacing = w / (vCount + 1);
    const rowHeight = h / 12;
    
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    
    // Draw vertical lines
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 4;
    for (let i = 1; i <= vCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * spacing, 20);
        ctx.lineTo(i * spacing, h - 20);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    ctx.lineWidth = 3;
    ladderData.lines.forEach(line => {
        const x1 = (line.v + 1) * spacing;
        const x2 = (line.v + 2) * spacing;
        const y = (line.row + 1) * rowHeight + 20;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
    });
}

if (startExecutionBtn) {
    startExecutionBtn.addEventListener('click', () => {
        if (ladderData.executedCount >= ladderData.verticalCount) {
            executionInfo.textContent = '모든 실행이 완료되었습니다.';
            startExecutionBtn.style.display = 'none';
            return;
        }
        
        const playerIdx = ladderData.executedCount;
        executionInfo.textContent = `${ladderData.players[playerIdx]}님의 결과를 확인합니다...`;
        startExecutionBtn.disabled = true;
        
        animatePath(playerIdx, () => {
            ladderData.executedCount++;
            startExecutionBtn.disabled = false;
            if (ladderData.executedCount < ladderData.verticalCount) {
                startExecutionBtn.textContent = '다음 실행하기';
            } else {
                startExecutionBtn.textContent = '종료';
            }
        });
    });
}

function animatePath(startIndex, callback) {
    const ctx = ladderCanvas.getContext('2d');
    const w = ladderCanvas.width;
    const h = ladderCanvas.height;
    const spacing = w / (ladderData.verticalCount + 1);
    const rowHeight = h / 12;
    
    let currentV = startIndex;
    let currentRow = -1; // -1 means starting top
    let path = [{ x: (currentV + 1) * spacing, y: 0 }];
    
    // Calculate path
    for (let r = 0; r < 11; r++) {
        // Vertical step
        path.push({ x: (currentV + 1) * spacing, y: (r + 1) * rowHeight + 20 });
        
        // Check for horizontal bridge
        const bridge = ladderData.lines.find(l => l.row === r && (l.v === currentV || l.v === currentV - 1));
        if (bridge) {
            if (bridge.v === currentV) {
                currentV++;
            } else {
                currentV--;
            }
            path.push({ x: (currentV + 1) * spacing, y: (r + 1) * rowHeight + 20 });
        }
    }
    path.push({ x: (currentV + 1) * spacing, y: h });

    let step = 0;
    function frame() {
        if (step >= path.length - 1) {
            callback();
            return;
        }
        
        const start = path[step];
        const end = path[step + 1];
        
        // Draw Rabbit (Top view - basically a white fluffy ball with ears)
        drawLadder(); // Redraw static ladder
        
        // Highlight current path in light green
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for(let i=0; i<=step; i++) ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();

        // Rabbit Animation (Top-down)
        const progress = 0; // simplified for one-frame-per-segment or add sub-animation
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(end.x, end.y, 12, 0, Math.PI * 2); // Body
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.stroke();
        
        // Ears
        ctx.fillStyle = '#fff';
        ctx.ellipse(end.x - 5, end.y - 12, 4, 10, 0, 0, Math.PI * 2);
        ctx.ellipse(end.x + 5, end.y - 12, 4, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        step++;
        setTimeout(() => requestAnimationFrame(frame), 150);
    }
    
    frame();
}

if (resetGameBtn) {
    resetGameBtn.addEventListener('click', () => {
        gameArea.style.display = 'none';
        ladderSetupCard.style.display = 'block';
        step1.classList.add('active');
        step2.classList.remove('active');
    });
}

// --- Original Logic ---
const generateBtn = document.getElementById('generate-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
// ... rest of original code ...
