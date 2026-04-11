
const generateBtn = document.getElementById('generate-btn');
const lottoBalls = document.querySelectorAll('.lotto-ball');
const dragonImg = document.getElementById('dragon-img');
const canvas = document.getElementById('falling-coins-canvas');
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
    ctx.fillStyle = 'gold';
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
    for (let i = 0; i < 100; i++) {
        let radius = Math.random() * 10 + 5;
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * -window.innerHeight;
        let speed = Math.random() * 3 + 1;
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
    coins = [];
    createCoins();
});

generateBtn.addEventListener('click', () => {
    // Reset balls
    lottoBalls.forEach(ball => {
        ball.style.opacity = 0;
        ball.style.transform = 'translateY(100px)';
    });

    dragonImg.classList.add('breath-animation');

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
        });

        dragonImg.classList.remove('breath-animation');
    }, 1000); // Increased duration to match the 1s breath-animation
});

function getBallColor(number) {
    if (number <= 10) {
        return '#fbc400'; // Yellow
    } else if (number <= 20) {
        return '#69c8f2'; // Blue
    } else if (number <= 30) {
        return '#ff7272'; // Red
    } else if (number <= 40) {
        return '#aaa'; // Gray
    } else {
        return '#b0d840'; // Green
    }
}
