// Game setup
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
canvas.focus();

// Game state
let gameRunning = false;
let score = 0;
let currentWave = 0;
let enemiesRemaining = 0;
let animationFrameId = null;

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    speed: 5,
    color: '#FFA500',
    health: 100,
    maxHealth: 100,
    gunAngle: 0,
    gunLength: 30,
    gunWidth: 8,
    invincible: false,
    lastHit: 0,
    invincibleDuration: 1000
};

// Bullets
const bullets = [];
const bulletSpeed = 10;
const bulletRadius = 5;

// Enemies
const enemies = [];
const baseEnemyStats = {
    radius: 15,
    speed: 1,
    health: 1
};

// Input
const keys = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false
};
const mouse = { x: 0, y: 0 };

// Initialize game
function init() {
    setupEventListeners();
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('next-wave-btn').addEventListener('click', startNextWave);
    document.getElementById('restart-btn').addEventListener('click', startGame);
}

function setupEventListeners() {
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('click', handleShoot);

    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
    });
}

function handleShoot() {
    if (!gameRunning || document.getElementById('wave-screen').style.display === 'flex') return;
    
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    bullets.push({
        x: player.x + Math.cos(angle) * player.radius,
        y: player.y + Math.sin(angle) * player.radius,
        dx: Math.cos(angle) * bulletSpeed,
        dy: Math.sin(angle) * bulletSpeed
    });
}

function startGame() {
    // Clean up any existing game state
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Reset game state
    gameRunning = true;
    score = 0;
    currentWave = 1;
    player.health = player.maxHealth;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    bullets.length = 0;
    enemies.length = 0;
    
    // Reset UI
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('wave-screen').style.display = 'none';
    
    updateHUD();
    startWave(currentWave);
    gameLoop();
}

function startWave(waveNumber) {
    currentWave = waveNumber;
    const enemyCount = 3 + Math.floor(waveNumber * 0.7);
    const healthMultiplier = 1 + (waveNumber * 0.3);
    const speedMultiplier = 1 + (waveNumber * 0.05);
    
    enemiesRemaining = enemyCount;
    updateHUD();
    
    // Clear any existing enemies
    enemies.length = 0;
    
    // Spawn enemies with delay
    for (let i = 0; i < enemyCount; i++) {
        setTimeout(() => {
            if (gameRunning) {
                enemies.push({
                    x: Math.random() < 0.5 ? 0 : canvas.width,
                    y: Math.random() * canvas.height,
                    radius: baseEnemyStats.radius,
                    speed: baseEnemyStats.speed * speedMultiplier,
                    health: baseEnemyStats.health * healthMultiplier,
                    maxHealth: baseEnemyStats.health * healthMultiplier,
                    color: `hsl(${Math.random() * 60}, 100%, 50%)`
                });
            }
        }, i * 500);
    }
}

function startNextWave() {
    currentWave++;
    updateHUD();
    
    // Reset player position
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    
    // Clear bullets
    bullets.length = 0;
    
    document.getElementById('wave-screen').style.display = 'none';
    gameRunning = true;
    startWave(currentWave);
    gameLoop();
}

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    render();
    
    // Only request new frame if game is still running
    if (gameRunning) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function update() {
    // Player movement
    let moveX = 0, moveY = 0;
    if (keys.KeyW) moveY -= player.speed;
    if (keys.KeyS) moveY += player.speed;
    if (keys.KeyA) moveX -= player.speed;
    if (keys.KeyD) moveX += player.speed;
    
    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
    }
    
    player.x += moveX;
    player.y += moveY;
    
    // Boundaries
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
    
    // Update gun angle
    player.gunAngle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].dx;
        bullets[i].y += bullets[i].dy;
        
        // Remove out-of-bounds bullets
        if (bullets[i].x < 0 || bullets[i].x > canvas.width || 
            bullets[i].y < 0 || bullets[i].y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
    
    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Move toward player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }
        
        // Check collision with player
        if (!player.invincible && dist < player.radius + enemy.radius) {
            player.health -= 10;
            player.invincible = true;
            player.lastHit = performance.now();
            player.color = '#FF0000';
            setTimeout(() => { player.color = '#FFA500'; }, 200);
            
            enemies.splice(i, 1);
            enemiesRemaining--;
            updateHUD();
            
            if (player.health <= 0) {
                gameOver();
                return;
            }
        }
        
        // Check bullet collisions
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const bulletDist = Math.sqrt(
                Math.pow(bullet.x - enemy.x, 2) + 
                Math.pow(bullet.y - enemy.y, 2)
            );
            
            if (bulletDist < enemy.radius + bulletRadius) {
                enemy.health--;
                bullets.splice(j, 1);
                
                if (enemy.health <= 0) {
                    score += 10;
                    enemies.splice(i, 1);
                    enemiesRemaining--;
                    updateHUD();
                }
                break;
            }
        }
    }
    
    // Check invincibility
    if (player.invincible && performance.now() - player.lastHit > player.invincibleDuration) {
        player.invincible = false;
    }
    
    // Check wave completion
    if (enemiesRemaining <= 0 && enemies.length === 0 && gameRunning) {
        if (currentWave >= 100) {
            gameOver(true);
        } else {
            completeWave();
        }
    }
}

function completeWave() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    document.getElementById('wave-number').textContent = currentWave;
    document.getElementById('wave-screen').style.display = 'flex';
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    drawPlayer();
    
    // Draw bullets
    ctx.fillStyle = '#FFFF00';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bulletRadius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw enemies
    enemies.forEach(enemy => {
        // Body
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Health bar
        const healthPercent = enemy.health / enemy.maxHealth;
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        ctx.fillRect(
            enemy.x - 15,
            enemy.y - enemy.radius - 8,
            30,
            3
        );
        ctx.fillStyle = 'rgba(0,255,0,0.7)';
        ctx.fillRect(
            enemy.x - 15,
            enemy.y - enemy.radius - 8,
            30 * healthPercent,
            3
        );
    });
    
    // Draw aiming reticle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
    ctx.moveTo(mouse.x - 15, mouse.y);
    ctx.lineTo(mouse.x - 5, mouse.y);
    ctx.moveTo(mouse.x + 5, mouse.y);
    ctx.lineTo(mouse.x + 15, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - 15);
    ctx.lineTo(mouse.x, mouse.y - 5);
    ctx.moveTo(mouse.x, mouse.y + 5);
    ctx.lineTo(mouse.x, mouse.y + 15);
    ctx.stroke();
}

function drawPlayer() {
    // Body
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Gun
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.gunAngle);
    ctx.fillStyle = '#333';
    ctx.fillRect(
        player.radius - 5,
        -player.gunWidth / 2,
        player.gunLength,
        player.gunWidth
    );
    ctx.restore();
    
    // Health bar
    const barWidth = 40;
    const barHeight = 5;
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.fillRect(
        player.x - barWidth/2,
        player.y - player.radius - 10,
        barWidth,
        barHeight
    );
    ctx.fillStyle = 'rgba(0,255,0,0.7)';
    ctx.fillRect(
        player.x - barWidth/2,
        player.y - player.radius - 10,
        barWidth * (player.health/player.maxHealth),
        barHeight
    );
}

function updateHUD() {
    document.getElementById('health').textContent = player.health;
    document.getElementById('score').textContent = score;
    document.getElementById('wave').textContent = currentWave;
    document.getElementById('enemies-left').textContent = enemiesRemaining;
}

function gameOver(victory = false) {
    gameRunning = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    document.getElementById('final-wave').textContent = currentWave;
    document.getElementById('final-score').textContent = score;
    
    if (victory) {
        document.getElementById('game-over').innerHTML = `
            <h2>VICTORY!</h2>
            <p>You completed all 100 waves!</p>
            <p>Final Score: <span id="final-score">${score}</span></p>
            <button id="restart-btn">Play Again</button>
        `;
    }
    
    document.getElementById('game-over').style.display = 'flex';
}

// Start the game
init();