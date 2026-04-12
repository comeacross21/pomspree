
const generateBtn = document.getElementById('generate-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const lottoBalls = document.querySelectorAll('.lotto-ball');
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

    function Coin(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
    }

    Coin.prototype.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = document.body.classList.contains('dark-mode') ? '#ffd700' : 'gold';
        ctx.fill();
        ctx.closePath();
    }

    Coin.prototype.update = function() {
        this.y += this.speed;
        if (this.y > window.innerHeight) {
            this.y = -this.radius;
            this.x = Math.random() * window.innerWidth;
        }
        this.draw();
    }

    function createCoins() {
        coins = [];
        for (let i = 0; i < 100; i++) {
            let radius = Math.random() * 8 + 4;
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
if (generateBtn && lottoBalls.length > 0) {
    generateBtn.addEventListener('click', () => {
        // Reset balls
        lottoBalls.forEach(ball => {
            ball.style.opacity = 0;
            ball.style.transform = 'translateY(50px)';
        });

        // Short delay for "generation" feel
        setTimeout(() => {
            const numbers = new Set();
            while (numbers.size < 6) {
                const randomNum = Math.floor(Math.random() * 45) + 1;
                numbers.add(randomNum);
            }

            const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

            lottoBalls.forEach((ball, index) => {
                ball.textContent = sortedNumbers[index];
                ball.style.backgroundColor = getBallColor(sortedNumbers[index]);
                ball.style.opacity = 1;
                ball.style.transform = 'translateY(0)';
                ball.style.transitionDelay = `${index * 0.1}s`;
                ball.style.color = '#fff'; // White text for colored balls
            });
        }, 300);
    });

    function getBallColor(number) {
        if (number <= 10) return '#fbc400'; // Yellow
        if (number <= 20) return '#69c8f2'; // Blue
        if (number <= 30) return '#ff7272'; // Red
        if (number <= 40) return '#aaa';    // Gray
        return '#b0d840';                   // Green
    }
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
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                status.textContent = '문의가 성공적으로 전송되었습니다. 감사합니다!';
                status.style.color = '#28a745';
                inquiryForm.reset();
            } else {
                const result = await response.json();
                if (Object.hasOwn(result, 'errors')) {
                    status.textContent = result.errors.map(error => error.message).join(", ");
                } else {
                    status.textContent = '문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
                }
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
            
            setTimeout(() => {
                if (status) status.remove();
            }, 5000);
        }
    });
}
