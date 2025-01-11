class GeometryKingdom {
    constructor() {
        this.initializeGame();
        this.setupEventListeners();
        this.startGame();
    }

    initializeGame() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Game state
        this.gameState = {
            level: 0,
            score: 0,
            lives: 3,
            exp: 0,
            selectedCharacter: null,
            inventory: [],
            achievements: [],
            mode: 'draw'
        };

        // Drawing state
        this.points = [];
        this.isDragging = false;
        this.selectedPoint = null;
        this.isDrawing = false;

        // Game levels
        this.levels = [
            {
                id: 1,
                name: "认识四边形",
                description: "画一个任意四边形",
                hint: "点击画布上的四个点来创建一个四边形，注意不要有三个点在同一直线上",
                reward: { coins: 100, exp: 50 },
                validate: (points) => points.length === 4 && !this.hasIntersectingEdges(points) && !this.areThreePointsCollinear(points)
            },
            {
                id: 2,
                name: "平行四边形挑战",
                description: "画一个平行四边形",
                hint: "记住：平行四边形的对边平行且相等，长方形和正方形也可以！",
                reward: { coins: 150, exp: 75 },
                validate: (points) => this.isParallelogram(points)
            },
            {
                id: 3,
                name: "长方形���师",
                description: "画一个长方形",
                hint: "记住：长方形的四个角都是90度",
                reward: { coins: 200, exp: 100 },
                validate: (points) => this.isRectangle(points)
            },
            {
                id: 4,
                name: "完美正方形",
                description: "画一个正方形",
                hint: "正方形的四条边长度相等，四个角都是90度",
                reward: { coins: 250, exp: 125 },
                validate: (points) => this.isSquare(points)
            },
            {
                id: 5,
                name: "梯形探索",
                description: "画一个梯形",
                hint: "梯形只有一组对边平行，另一组不平行",
                reward: { coins: 300, exp: 150 },
                validate: (points) => this.isTrapezoid(points)
            }
        ];

        // Current level
        this.currentLevel = this.levels[0];
        
        // Update UI
        this.updateUI();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    setupEventListeners() {
        // Canvas events - mouse
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Canvas events - touch
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 防止触发鼠标事件
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleMouseUp();
        });

        // Button events
        document.getElementById('drawMode').addEventListener('click', () => this.setMode('draw'));
        document.getElementById('dragMode').addEventListener('click', () => this.setMode('drag'));
        document.getElementById('eraseMode').addEventListener('click', () => this.setMode('erase'));
        document.getElementById('checkButton').addEventListener('click', () => this.checkAnswer());
        document.getElementById('hintButton').addEventListener('click', () => this.showHint());
        document.getElementById('resetButton').addEventListener('click', () => this.resetLevel());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        document.getElementById('tryAgainBtn').addEventListener('click', () => {
            this.resetLevel();
            document.getElementById('levelCompleteDialog').style.display = 'none';
        });
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('backToMiniProgram').addEventListener('click', () => {
            // 调用微信小程序的返回方法
            if (window.wx && window.wx.miniProgram) {
                window.wx.miniProgram.navigateBack();
            }
        });

        // Character selection
        document.querySelectorAll('.character').forEach(char => {
            char.addEventListener('click', (e) => this.selectCharacter(e.currentTarget.dataset.character));
        });

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setMode(mode) {
        this.gameState.mode = mode;
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${mode}Mode`).classList.add('active');
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        switch(this.gameState.mode) {
            case 'draw':
                if (this.points.length < 4) {
                    const snappedPoint = this.snapToGrid(x, y);
                    this.points.push(snappedPoint);
                    this.draw();
                }
                break;
            case 'drag':
                this.selectedPoint = this.findNearestPoint(x, y);
                this.isDragging = true;
                break;
            case 'erase':
                const pointToRemove = this.findNearestPoint(x, y);
                if (pointToRemove) {
                    this.points = this.points.filter(p => p !== pointToRemove);
                    this.draw();
                }
                break;
        }
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.selectedPoint) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const snappedPoint = this.snapToGrid(x, y);
        this.selectedPoint.x = snappedPoint.x;
        this.selectedPoint.y = snappedPoint.y;
        this.draw();
    }

    handleMouseUp() {
        this.isDragging = false;
        this.selectedPoint = null;
    }

    findNearestPoint(x, y) {
        return this.points.find(point => {
            const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
            return distance < 20;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw shape
        if (this.points.length > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.points[0].x, this.points[0].y);
            
            for (let i = 1; i < this.points.length; i++) {
                this.ctx.lineTo(this.points[i].x, this.points[i].y);
            }

            if (this.points.length === 4) {
                this.ctx.lineTo(this.points[0].x, this.points[0].y);
            }
            
            this.ctx.strokeStyle = '#1a73e8';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }

        // Draw points
        this.points.forEach((point, index) => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.fill();
            
            // Draw point labels
            this.ctx.fillStyle = '#333';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(String.fromCharCode(65 + index), point.x + 10, point.y + 10);
        });
    }

    drawGrid() {
        const gridSize = 30;
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    snapToGrid(x, y) {
        const gridSize = 30;
        return {
            x: Math.round(x / gridSize) * gridSize,
            y: Math.round(y / gridSize) * gridSize
        };
    }

    checkAnswer() {
        if (this.points.length !== 4) {
            this.showMessage('请先画一个完整的四边形！', false);
            return;
        }

        if (this.hasIntersectingEdges(this.points)) {
            this.showMessage('四边形的边不能相交！请重试。', false);
            return;
        }

        if (this.areThreePointsCollinear(this.points)) {
            this.showMessage('不能有三个点在同一直线上！请重试。', false);
            return;
        }

        if (this.currentLevel.validate(this.points)) {
            this.showSuccess();
        } else {
            this.gameState.lives--;
            if (this.gameState.lives <= 0) {
                this.gameOver();
            } else {
                this.showMessage('不正确，请重试！', false);
            }
            this.updateUI();
        }
    }

    showSuccess() {
        const reward = this.currentLevel.reward;
        this.gameState.score += reward.coins;
        this.gameState.exp += reward.exp;
        this.gameState.level += 1;
        
        document.getElementById('rewardCoins').textContent = reward.coins;
        document.getElementById('rewardExp').textContent = reward.exp;
        document.getElementById('levelCompleteDialog').style.display = 'flex';
        
        // 检查是否是最后一关
        const isLastLevel = this.levels.indexOf(this.currentLevel) === this.levels.length - 1;
        if (isLastLevel) {
            document.getElementById('messageText').textContent = '获得成就';
            document.getElementById('nextLevelBtn').style.display = 'none';
            document.getElementById('tryAgainBtn').style.display = 'none';
            // 3秒后自动进入庆祝页面
            setTimeout(() => {
                this.showFinalCelebration();
            }, 3000);
        } else {
            document.getElementById('messageText').textContent = '获得成就！';
            document.getElementById('nextLevelBtn').style.display = 'block';
            document.getElementById('tryAgainBtn').style.display = 'none';
        }
        
        this.updateUI();
        this.checkAchievements();
    }

    showMessage(message, isSuccess = true) {
        document.getElementById('levelCompleteDialog').style.display = 'flex';
        document.getElementById('messageText').textContent = message;
        document.getElementById('nextLevelBtn').style.display = isSuccess ? 'block' : 'none';
        document.getElementById('tryAgainBtn').style.display = isSuccess ? 'none' : 'block';
    }

    showHint() {
        document.getElementById('levelCompleteDialog').style.display = 'flex';
        document.getElementById('messageText').textContent = this.currentLevel.hint;
        document.getElementById('nextLevelBtn').style.display = 'none';
        document.getElementById('tryAgainBtn').style.display = 'none';
        
        // 隐藏奖励显示
        const rewardsDiv = document.querySelector('.rewards');
        if (rewardsDiv) {
            rewardsDiv.style.display = 'none';
        }

        // 3秒后自动关闭提示
        setTimeout(() => {
            document.getElementById('levelCompleteDialog').style.display = 'none';
            // 显示回奖励区域，以免影响其他弹窗
            if (rewardsDiv) {
                rewardsDiv.style.display = 'flex';
            }
        }, 3000);
    }

    nextLevel() {
        const nextLevelIndex = this.levels.indexOf(this.currentLevel) + 1;
        if (nextLevelIndex < this.levels.length) {
            this.currentLevel = this.levels[nextLevelIndex];
            this.resetLevel();
            document.getElementById('levelCompleteDialog').style.display = 'none';
        } else {
            this.showFinalCelebration();
        }
    }

    showFinalCelebration() {
        const duration = 3000;
        const animationEnd = Date.now() + duration;

        // 立即显示最终得分对话框
        const dialog = document.getElementById('levelCompleteDialog');
        dialog.style.display = 'flex';
        document.getElementById('messageText').textContent = `🎉恭喜你完成了所有关卡！\n最终获得：${this.gameState.score} 金币`;
        document.getElementById('nextLevelBtn').style.display = 'none';
        document.getElementById('tryAgainBtn').style.display = 'none';

        // 隐藏奖励显示
        const rewardsDiv = document.querySelector('.rewards');
        if (rewardsDiv) {
            rewardsDiv.style.display = 'none';
        }

        const confetti = window.confetti;
        if (!confetti) return;

        const randomInRange = (min, max) => {
            return Math.random() * (max - min) + min;
        };

        const runFirework = () => {
            const timeLeft = animationEnd - Date.now();
            
            // 创建多个烟花
            confetti({
                particleCount: 100,
                spread: 100,
                origin: { x: randomInRange(0.2, 0.8), y: randomInRange(0.2, 0.5) },
                colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
                startVelocity: 30,
                gravity: 0.5,
                scalar: 0.7,
                ticks: 100
            });

            // 创建闪光效果
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { x: randomInRange(0.3, 0.7), y: randomInRange(0.3, 0.6) },
                colors: ['#ffffff', '#f0f0f0'],
                startVelocity: 45,
                gravity: 0.7,
                scalar: 0.5,
                ticks: 50
            });

            if (timeLeft > 0) {
                requestAnimationFrame(runFirework);
            } else {
                // 烟花结束后3秒显示链接生涯页面
                setTimeout(() => {
                    dialog.style.display = 'none';
                    document.getElementById('careerConnection').classList.add('show');
                    // 3秒后自动返回小程序
                    setTimeout(() => {
                        document.getElementById('backToMiniProgram').click();
                    }, 5000);
                }, 3000);
            }
        };

        runFirework();
    }

    resetLevel() {
        this.points = [];
        document.getElementById('levelCompleteDialog').style.display = 'none';
        this.draw();
        this.updateUI();
    }

    gameOver() {
        document.getElementById('gameOverDialog').style.display = 'flex';
    }

    restartGame() {
        this.gameState.lives = 3;
        this.gameState.score = 0;
        this.gameState.exp = 0;
        this.currentLevel = this.levels[0];
        this.resetLevel();
        document.getElementById('gameOverDialog').style.display = 'none';
    }

    selectCharacter(character) {
        this.gameState.selectedCharacter = character;
        document.querySelectorAll('.character').forEach(char => {
            char.classList.toggle('selected', char.dataset.character === character);
        });
    }

    updateUI() {
        document.getElementById('score').textContent = this.gameState.score;
        document.getElementById('playerLevel').textContent = this.gameState.level;
        document.getElementById('currentMission').textContent = this.currentLevel.description;
        
        // Update lives display
        const livesContainer = document.querySelector('.lives');
        livesContainer.innerHTML = Array(this.gameState.lives).fill('<i class="fas fa-heart"></i>').join('');
    }

    // Geometry validation methods
    isRectangle(points) {
        const angles = this.calculateAngles(points);
        return angles.every(angle => 
            Math.abs(angle - 90) < 10 || Math.abs(angle - 270) < 10
        );
    }

    isSquare(points) {
        if (!this.isRectangle(points)) return false;
        
        const sides = this.calculateSides(points);
        const firstSide = sides[0];
        return sides.every(side => Math.abs(side - firstSide) < 10);
    }

    isParallelogram(points) {
        // 计算对边长度
        const sides = this.calculateSides(points);
        const oppositeEqual1 = Math.abs(sides[0] - sides[2]) < 10;
        const oppositeEqual2 = Math.abs(sides[1] - sides[3]) < 10;

        // 计算对边斜率
        const slopes = this.calculateSlopes(points);
        const parallel1 = (slopes[0] === Infinity && slopes[2] === Infinity) || 
                         (slopes[0] !== Infinity && slopes[2] !== Infinity && Math.abs(slopes[0] - slopes[2]) < 0.1);
        const parallel2 = (slopes[1] === Infinity && slopes[3] === Infinity) || 
                         (slopes[1] !== Infinity && slopes[3] !== Infinity && Math.abs(slopes[1] - slopes[3]) < 0.1);

        // 平行四边形的条件：两组对边平行且相等
        return (oppositeEqual1 && oppositeEqual2 && parallel1 && parallel2);
    }

    isTrapezoid(points) {
        const slopes = this.calculateSlopes(points);
        
        // Check if exactly one pair of opposite sides is parallel
        const pair1Parallel = (slopes[0] === Infinity && slopes[2] === Infinity) || 
                            (slopes[0] !== Infinity && slopes[2] !== Infinity && Math.abs(slopes[0] - slopes[2]) < 0.1);
        const pair2Parallel = (slopes[1] === Infinity && slopes[3] === Infinity) || 
                            (slopes[1] !== Infinity && slopes[3] !== Infinity && Math.abs(slopes[1] - slopes[3]) < 0.1);
        
        // Return true only if exactly one pair is parallel (XOR operation)
        return (pair1Parallel && !pair2Parallel) || (!pair1Parallel && pair2Parallel);
    }

    calculateAngles(points) {
        const angles = [];
        for (let i = 0; i < 4; i++) {
            const prev = points[(i + 3) % 4];
            const curr = points[i];
            const next = points[(i + 1) % 4];
            
            const angle = this.calculateAngle(prev, curr, next);
            angles.push(angle);
        }
        return angles;
    }

    calculateAngle(p1, p2, p3) {
        const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) -
                     Math.atan2(p1.y - p2.y, p1.x - p2.x);
        let degrees = angle * 180 / Math.PI;
        if (degrees < 0) {
            degrees += 360;
        }
        return degrees;
    }

    calculateSides(points) {
        const sides = [];
        for (let i = 0; i < 4; i++) {
            const curr = points[i];
            const next = points[(i + 1) % 4];
            const distance = Math.sqrt(
                Math.pow(next.x - curr.x, 2) + Math.pow(next.y - curr.y, 2)
            );
            sides.push(distance);
        }
        return sides;
    }

    calculateSlopes(points) {
        const slopes = [];
        for (let i = 0; i < 4; i++) {
            const curr = points[i];
            const next = points[(i + 1) % 4];
            const dx = next.x - curr.x;
            const dy = next.y - curr.y;
            // 如果是垂直线（dx接近0），使用一个特殊值表示
            if (Math.abs(dx) < 0.0001) {
                slopes.push(Infinity);
            } else {
                slopes.push(dy / dx);
            }
        }
        return slopes;
    }

    checkAchievements() {
        const achievements = [
            {
                id: 'first_shape',
                name: '初次创作',
                description: '完成第一个四边形',
                condition: () => this.gameState.score > 0
            },
            {
                id: 'perfect_square',
                name: '完美主义者',
                description: '画出一个完美的正方形',
                condition: () => this.currentLevel.name === "完美正方形" && this.points.length === 4
            },
            {
                id: 'speed_master',
                name: '快速大师',
                description: '在30秒内完成一关',
                condition: () => false // 需要实现计时功能
            }
        ];

        achievements.forEach(achievement => {
            if (!this.gameState.achievements.includes(achievement.id) && achievement.condition()) {
                this.gameState.achievements.push(achievement.id);
                this.showMessage(`获得成就：${achievement.name} - ${achievement.description}`);
            }
        });
    }

    // 检查两条线段是否相交
    doLinesIntersect(p1, p2, p3, p4) {
        // 计算方向
        const d1 = this.direction(p3, p4, p1);
        const d2 = this.direction(p3, p4, p2);
        const d3 = this.direction(p1, p2, p3);
        const d4 = this.direction(p1, p2, p4);

        // 检查是否相交
        if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
            ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
            return true;
        }

        // 检查点是否在线段上
        if (d1 === 0 && this.onSegment(p3, p4, p1)) return true;
        if (d2 === 0 && this.onSegment(p3, p4, p2)) return true;
        if (d3 === 0 && this.onSegment(p1, p2, p3)) return true;
        if (d4 === 0 && this.onSegment(p1, p2, p4)) return true;

        return false;
    }

    // 计算方向
    direction(p1, p2, p3) {
        return ((p3.y - p1.y) * (p2.x - p1.x)) - ((p2.y - p1.y) * (p3.x - p1.x));
    }

    // 检查点是否在线段上
    onSegment(p1, p2, p) {
        return p.x <= Math.max(p1.x, p2.x) && p.x >= Math.min(p1.x, p2.x) &&
               p.y <= Math.max(p1.y, p2.y) && p.y >= Math.min(p1.y, p2.y);
    }

    // 检查四边形是否有相交的边
    hasIntersectingEdges(points) {
        if (points.length !== 4) return false;

        // 检查所有可能的边对组合
        // 检查边 1-2 和 3-4
        if (this.doLinesIntersect(points[0], points[1], points[2], points[3])) return true;
        // 检查边 2-3 和 4-1
        if (this.doLinesIntersect(points[1], points[2], points[3], points[0])) return true;

        return false;
    }

    areThreePointsCollinear(points) {
        // 检查任意三个点是否在同一直线上
        if (points.length < 3) return false;
        
        // 检查所有可能的三点组合
        for (let i = 0; i < points.length - 2; i++) {
            for (let j = i + 1; j < points.length - 1; j++) {
                for (let k = j + 1; k < points.length; k++) {
                    const p1 = points[i];
                    const p2 = points[j];
                    const p3 = points[k];
                    
                    // 使用斜率法检查三点是否共线
                    // (y2-y1)/(x2-x1) = (y3-y1)/(x3-x1)
                    // 为避免除以零，转换为乘法形式
                    const collinear = Math.abs((p2.y - p1.y) * (p3.x - p1.x) - (p3.y - p1.y) * (p2.x - p1.x)) < 0.1;
                    if (collinear) return true;
                }
            }
        }
        return false;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new GeometryKingdom();
}); 