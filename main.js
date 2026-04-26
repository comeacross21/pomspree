
const generateBtn = document.getElementById('generate-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const lottoContainer = document.getElementById('lotto-container');
const canvas = document.getElementById('falling-coins-canvas');

// --- Theme Logic ---
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        if (themeToggleBtn) themeToggleBtn.textContent = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
    }
}

// Check saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    setTheme('dark');
} else {
    setTheme('light');
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });
}

// --- Falling Coins Animation ---
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let coins = [];
    const coinImg = new Image();
    // 사용자가 원하는 이미지 URL로 변경 가능합니다.
    coinImg.src = 'https://github.com/comeacross21/pomspree/blob/main/images/money.png?raw=true'; // 기본 동전 이미지 예시

    function Coin(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
    }

    Coin.prototype.draw = function() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        
        if (coinImg.complete && coinImg.naturalWidth !== 0) {
            ctx.drawImage(coinImg, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#ffd700' : 'gold';
            ctx.fill();
            ctx.closePath();
        }
        ctx.restore();
    }

    Coin.prototype.update = function() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        if (this.y > window.innerHeight + this.radius * 2) {
            this.y = -this.radius * 2;
            this.x = Math.random() * window.innerWidth;
        }
        this.draw();
    }

    function createCoins() {
        coins = [];
        for (let i = 0; i < 50; i++) { // Reduced count for better performance with larger images
            let radius = Math.random() * 40 + 20; // 5x larger (range 20 to 60)
            let x = Math.random() * window.innerWidth;
            let y = Math.random() * -window.innerHeight;
            let speed = Math.random() * 2 + 1;
            coins.push(new Coin(x, y, radius, speed));
        }
    }

    function animate() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (let i = 0; i < coins.length; i++) {
            coins[i].update();
        }
        requestAnimationFrame(animate);
    }

    createCoins();
    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createCoins();
    });
}

// --- Lotto Generation ---
if (generateBtn && lottoContainer) {
    function getBallColor(number) {
        if (number <= 10) return '#fbc400';
        if (number <= 20) return '#69c8f2';
        if (number <= 30) return '#ff7272';
        if (number <= 40) return '#aaa';
        return '#b0d840';
    }

    // Initial lotto display (empty balls)
    function initLotto() {
        lottoContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const row = document.createElement('div');
            row.className = 'lotto-numbers';
            row.style.display = 'flex';
            row.style.justifyContent = 'center';
            row.style.gap = '10px';
            row.style.marginBottom = '10px';
            for (let j = 0; j < 6; j++) {
                const ball = document.createElement('div');
                ball.className = 'lotto-ball';
                ball.style.opacity = '1';
                ball.style.transform = 'translateY(0)';
                row.appendChild(ball);
            }
            lottoContainer.appendChild(row);
        }
    }
    initLotto();

    generateBtn.addEventListener('click', () => {
        const rows = lottoContainer.querySelectorAll('.lotto-numbers');
        
        rows.forEach((row, rowIndex) => {
            const balls = row.querySelectorAll('.lotto-ball');
            balls.forEach(ball => {
                ball.style.opacity = 0;
                ball.style.transform = 'translateY(20px)';
            });

            setTimeout(() => {
                const numbers = new Set();
                while (numbers.size < 6) {
                    const randomNum = Math.floor(Math.random() * 45) + 1;
                    numbers.add(randomNum);
                }

                const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

                balls.forEach((ball, index) => {
                    ball.textContent = sortedNumbers[index];
                    ball.style.backgroundColor = getBallColor(sortedNumbers[index]);
                    ball.style.opacity = 1;
                    ball.style.transform = 'translateY(0)';
                    ball.style.transitionDelay = `${index * 0.05}s`;
                    ball.style.color = '#fff';
                });
            }, rowIndex * 100);
        });
    });
}

// --- Meal Recommendation Logic ---
const recommendBtn = document.getElementById('recommend-menu-btn');
const retryBtn = document.getElementById('retry-menu-btn');
const recentFoodInput = document.getElementById('recent-food');
const resultSection = document.getElementById('recommendation-result');
const foodDisplay = document.getElementById('food-display');
const foodReason = document.getElementById('food-reason');

if (recommendBtn) {
    const foodList = [
        { name: '김치찌개', category: '한식', reason: '매콤하고 시원한 국물이 일품인 한국인의 소울푸드!' },
        { name: '된장찌개', category: '한식', reason: '구수한 맛이 일품이며 속이 편안해지는 한식의 정석입니다.' },
        { name: '불고기', category: '한식', reason: '달콤 짭조름한 양념이 고기에 잘 배어 밥도둑이 따로 없죠.' },
        { name: '비빔밥', category: '한식', reason: '신선한 나물과 고추장의 조화, 건강까지 생각한 한 끼!' },
        { name: '제육볶음', category: '한식', reason: '매콤달콤한 양념에 볶아낸 고기는 언제나 옳습니다.' },
        { name: '짜장면', category: '중식', reason: '달콤하고 고소한 춘장 소스, 남녀노소 누구나 좋아하는 별미입니다.' },
        { name: '짬뽕', category: '중식', reason: '얼큰하고 시원한 국물로 스트레스를 날려보세요!' },
        { name: '탕수육', category: '중식', reason: '바삭한 튀김과 새콤달콤한 소스의 환상적인 만남.' },
        { name: '초밥', category: '일식', reason: '신선한 생선의 맛을 그대로 느낄 수 있는 깔끔한 한 끼.' },
        { name: '돈가츠', category: '일식', reason: '겉은 바삭, 속은 촉촉한 고기의 육즙을 즐겨보세요.' },
        { name: '라멘', category: '일식', reason: '진한 육수와 쫄깃한 면발이 주는 깊은 풍미.' },
        { name: '스테이크', category: '양식', reason: '특별한 기분을 내고 싶을 때, 육즙 가득한 고기가 최고죠.' },
        { name: '파스타', category: '양식', reason: '다양한 소스와 면의 조합으로 취향껏 즐길 수 있습니다.' },
        { name: '피자', category: '양식', reason: '풍성한 치즈와 토핑이 주는 행복한 맛.' },
        { name: '떡볶이', category: '분식', reason: '매콤달콤한 소스에 쫄깃한 떡, 간식으로도 식사로도 완벽합니다.' },
        { name: '햄버거', category: '패스트푸드', reason: '한 손에 들고 즐기는 풍부한 맛의 조화.' },
        { name: '치킨', category: '기타', reason: '오늘 하루 고생한 당신에게 주는 바삭한 선물!' },
        { name: '쌀국수', category: '아시안', reason: '담백한 국물과 부드러운 면발로 부담 없는 한 끼.' },
        { name: '샌드위치', category: '기타', reason: '신선하고 가볍게 즐기고 싶을 때 최고의 선택.' }
    ];

    function recommend() {
        const recentFood = recentFoodInput.value.trim();
        let filteredList = foodList;

        if (recentFood) {
            filteredList = foodList.filter(food => 
                !recentFood.includes(food.name) && 
                !recentFood.includes(food.category)
            );
            if (filteredList.length === 0) filteredList = foodList;
        }

        const randomIndex = Math.floor(Math.random() * filteredList.length);
        const selected = filteredList[randomIndex];

        foodDisplay.textContent = selected.name;
        foodReason.textContent = selected.reason;
        
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    recommendBtn.addEventListener('click', recommend);
    if (retryBtn) retryBtn.addEventListener('click', recommend);
}

// --- Ladder Game Logic ---
const ladderSetupCard = document.getElementById('setup-card');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const toStep2Btn = document.getElementById('to-step-2');
const toGameBtn = document.getElementById('to-game');
const playerCountInput = document.getElementById('player-count');
const playerNamesContainer = document.getElementById('player-names-container');
const playerOutcomesContainer = document.getElementById('player-outcomes-container');
const gameArea = document.getElementById('game-area');
const ladderCanvas = document.getElementById('ladder-canvas');
const topLabels = document.getElementById('top-labels');
const bottomLabels = document.getElementById('bottom-labels');
const executionInfo = document.getElementById('execution-info');
const startExecutionBtn = document.getElementById('start-execution-btn');
const resetGameBtn = document.getElementById('reset-game-btn');
const historySection = document.getElementById('ladder-history');
const historyList = document.getElementById('history-list');

let ladderData = {
    players: [],
    outcomes: [],
    lines: [], 
    verticalCount: 0,
    executedCount: 0
};

if (toStep2Btn) {
    toStep2Btn.addEventListener('click', () => {
        const count = parseInt(playerCountInput.value);
        if (count < 2 || count > 20) return alert('2명에서 20명 사이로 입력해주세요.');
        
        playerNamesContainer.innerHTML = '';
        playerOutcomesContainer.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'player-name';
            nameInput.placeholder = `참가자 ${i+1}`;
            nameInput.value = `사람 ${i+1}`;
            nameInput.style.padding = '8px';
            nameInput.style.borderRadius = '5px';
            nameInput.style.border = '1px solid var(--input-border)';
            nameInput.style.backgroundColor = 'var(--input-bg)';
            nameInput.style.color = 'var(--text-color)';
            nameInput.style.fontSize = '14px';
            playerNamesContainer.appendChild(nameInput);

            const outcomeInput = document.createElement('input');
            outcomeInput.type = 'text';
            outcomeInput.className = 'player-outcome';
            outcomeInput.placeholder = `결과 ${i+1}`;
            outcomeInput.value = i === 0 ? '당첨' : '꽝';
            outcomeInput.style.padding = '8px';
            outcomeInput.style.borderRadius = '5px';
            outcomeInput.style.border = '1px solid var(--input-border)';
            outcomeInput.style.backgroundColor = 'var(--input-bg)';
            outcomeInput.style.color = 'var(--text-color)';
            outcomeInput.style.fontSize = '14px';
            playerOutcomesContainer.appendChild(outcomeInput);
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
        
        // Clear history
        historyList.innerHTML = '';
        historySection.style.display = 'none';
        
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
    const rows = 12; 
    for (let r = 0; r < rows; r++) {
        for (let v = 0; v < ladderData.verticalCount - 1; v++) {
            if (Math.random() > 0.6) {
                if (v > 0 && ladderData.lines.some(l => l.row === r && l.v === v - 1)) continue;
                ladderData.lines.push({ row: r, v: v });
            }
        }
    }
}

function setupGameUI() {
    const vCount = ladderData.verticalCount;
    // Calculate required width based on player count
    const minWidth = vCount * 80; // Ensure enough space for each player
    const width = Math.max(minWidth, Math.min(window.innerWidth * 0.9, 1000));
    const height = 500;
    
    ladderCanvas.width = width;
    ladderCanvas.height = height;
    
    // Ensure label containers match canvas width exactly
    topLabels.style.width = `${width}px`;
    bottomLabels.style.width = `${width}px`;
    
    topLabels.innerHTML = '';
    bottomLabels.innerHTML = '';
    
    const spacing = width / (vCount + 1);
    
    ladderData.players.forEach((name, i) => {
        const label = document.createElement('div');
        label.className = 'label-box';
        label.textContent = name;
        // Position at exactly the same X as the vertical line
        label.style.left = `${(i + 1) * spacing}px`;
        topLabels.appendChild(label);
    });
    
    ladderData.outcomes.forEach((text, i) => {
        const label = document.createElement('div');
        label.className = 'label-box';
        label.textContent = text;
        // Position at exactly the same X as the vertical line
        label.style.left = `${(i + 1) * spacing}px`;
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
    const rowHeight = (h - 40) / 13;
    
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 4;
    for (let i = 1; i <= vCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * spacing, 20);
        ctx.lineTo(i * spacing, h - 20);
        ctx.stroke();
    }
    
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
        
        animatePath(playerIdx, (finalIndex) => {
            const playerName = ladderData.players[playerIdx];
            const resultValue = ladderData.outcomes[finalIndex];
            
            // Show history section
            historySection.style.display = 'block';
            
            // Append result to history list
            const historyItem = document.createElement('div');
            historyItem.style.padding = '10px';
            historyItem.style.background = 'var(--machine-bg)';
            historyItem.style.borderRadius = '8px';
            historyItem.style.display = 'flex';
            historyItem.style.justifyContent = 'space-between';
            historyItem.style.boxShadow = 'var(--shadow)';
            historyItem.innerHTML = `<span><strong>${playerName}</strong></span> <span>${resultValue}</span>`;
            historyList.appendChild(historyItem);
            
            ladderData.executedCount++;
            startExecutionBtn.disabled = false;
            if (ladderData.executedCount < ladderData.verticalCount) {
                startExecutionBtn.textContent = '다음 실행하기';
                executionInfo.textContent = '다음 실행 버튼을 눌러주세요.';
            } else {
                startExecutionBtn.textContent = '종료';
                executionInfo.textContent = '모든 실행이 완료되었습니다!';
            }
        });
    });
}

function animatePath(startIndex, callback) {
    const ctx = ladderCanvas.getContext('2d');
    const w = ladderCanvas.width;
    const h = ladderCanvas.height;
    const spacing = w / (ladderData.verticalCount + 1);
    const rowHeight = (h - 40) / 13;
    
    let currentV = startIndex;
    let path = [{ x: (currentV + 1) * spacing, y: 0 }];
    
    for (let r = 0; r < 12; r++) {
        path.push({ x: (currentV + 1) * spacing, y: (r + 1) * rowHeight + 20 });
        const bridge = ladderData.lines.find(l => l.row === r && (l.v === currentV || l.v === currentV - 1));
        if (bridge) {
            if (bridge.v === currentV) currentV++;
            else currentV--;
            path.push({ x: (currentV + 1) * spacing, y: (r + 1) * rowHeight + 20 });
        }
    }
    path.push({ x: (currentV + 1) * spacing, y: h });

    const finalIndex = currentV;

    let step = 0;
    function frame() {
        if (step >= path.length - 1) {
            callback(finalIndex);
            return;
        }
        const end = path[step + 1];
        drawLadder();
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for(let i=0; i<=step; i++) ctx.lineTo(path[i].x, path[i].y);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(end.x, end.y, 10, 0, Math.PI * 2); 
        ctx.fill();
        ctx.strokeStyle = '#ddd';
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.ellipse(end.x - 4, end.y - 10, 3, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(end.x + 4, end.y - 10, 3, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        step++;
        setTimeout(() => requestAnimationFrame(frame), 100);
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

// --- Partnership Form Logic ---
const inquiryForm = document.getElementById('inquiry-form');
if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.createElement('p');
        status.id = 'form-status';
        status.style.marginTop = '20px';
        status.style.fontWeight = 'bold';
        status.style.textAlign = 'center';
        const data = new FormData(e.target);
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '보내는 중...';
        try {
            const response = await fetch(e.target.action, {
                method: e.target.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                status.textContent = '문의가 성공적으로 전송되었습니다. 감사합니다!';
                status.style.color = '#28a745';
                inquiryForm.reset();
            } else {
                const result = await response.json();
                status.textContent = result.errors ? result.errors.map(error => error.message).join(", ") : '문제가 발생했습니다.';
                status.style.color = '#dc3545';
            }
        } catch (error) {
            status.textContent = '서버 통신 중 오류가 발생했습니다.';
            status.style.color = '#dc3545';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            const existingStatus = document.getElementById('form-status');
            if (existingStatus) existingStatus.remove();
            inquiryForm.appendChild(status);
            setTimeout(() => { if (status) status.remove(); }, 5000);
        }
    });
}
