// 为四边形的认识游戏添加音效
// 运行此脚本将修改game.js文件，在关键交互点添加音效

const fs = require('fs');
const path = require('path');

// 游戏文件路径
const gameJsPath = path.join(__dirname, 'game.js');

// 读取游戏文件
let gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

// 1. 修改构造函数，初始化音频系统
gameJsContent = gameJsContent.replace(
    'constructor() {\n        this.initializeGame();\n        this.setupEventListeners();\n        this.startGame();',
    'constructor() {\n        this.initializeGame();\n        this.setupEventListeners();\n        \n        // 初始化音频系统\n        document.addEventListener("click", () => {\n            if (window.audioManager && !window.audioManager.initialized) {\n                window.audioManager.initialize();\n            }\n        }, { once: true });\n        \n        this.startGame();'
);

// 2. 修改startGame方法，播放背景音乐
gameJsContent = gameJsContent.replace(
    'startGame() {\n        this.updateUI();\n        this.draw();',
    'startGame() {\n        // 开始播放背景音乐\n        if (window.audioManager) {\n            window.audioManager.playBackgroundMusic();\n        }\n        \n        this.updateUI();\n        this.draw();'
);

// 3. 修改handleMouseDown方法，添加放置点、拖拽和擦除音效
gameJsContent = gameJsContent.replace(
    'case \'draw\':\n                if (this.points.length < 4) {\n                    const snappedPoint = this.snapToGrid(x, y);\n                    this.points.push(snappedPoint);\n                    this.draw();\n                }',
    'case \'draw\':\n                if (this.points.length < 4) {\n                    const snappedPoint = this.snapToGrid(x, y);\n                    this.points.push(snappedPoint);\n                    this.draw();\n                    \n                    // 播放放置点音效\n                    if (window.audioManager) {\n                        window.audioManager.playPlacePoint();\n                    }\n                }'
);

gameJsContent = gameJsContent.replace(
    'case \'drag\':\n                this.selectedPoint = this.findNearestPoint(x, y);\n                this.isDragging = true;',
    'case \'drag\':\n                this.selectedPoint = this.findNearestPoint(x, y);\n                this.isDragging = true;\n                \n                // 播放拖拽音效\n                if (window.audioManager && this.selectedPoint) {\n                    window.audioManager.playDragPoint();\n                }'
);

gameJsContent = gameJsContent.replace(
    'case \'erase\':\n                const pointToRemove = this.findNearestPoint(x, y);\n                if (pointToRemove) {\n                    this.points = this.points.filter(p => p !== pointToRemove);\n                    this.draw();\n                }',
    'case \'erase\':\n                const pointToRemove = this.findNearestPoint(x, y);\n                if (pointToRemove) {\n                    this.points = this.points.filter(p => p !== pointToRemove);\n                    this.draw();\n                    \n                    // 播放擦除音效\n                    if (window.audioManager) {\n                        window.audioManager.playErasePoint();\n                    }\n                }'
);

// 4. 修改handleMouseMove方法，添加拖拽音效
gameJsContent = gameJsContent.replace(
    'handleMouseMove(e) {\n        if (!this.isDragging || !this.selectedPoint) return;\n\n        const rect = this.canvas.getBoundingClientRect();\n        const x = e.clientX - rect.left;\n        const y = e.clientY - rect.top;\n\n        const snappedPoint = this.snapToGrid(x, y);\n        this.selectedPoint.x = snappedPoint.x;\n        this.selectedPoint.y = snappedPoint.y;\n        this.draw();',
    'handleMouseMove(e) {\n        if (!this.isDragging || !this.selectedPoint) return;\n\n        const rect = this.canvas.getBoundingClientRect();\n        const x = e.clientX - rect.left;\n        const y = e.clientY - rect.top;\n\n        const snappedPoint = this.snapToGrid(x, y);\n        \n        // 只有当点位置改变时才播放声音\n        if (this.selectedPoint.x !== snappedPoint.x || this.selectedPoint.y !== snappedPoint.y) {\n            // 播放拖拽音效\n            if (window.audioManager) {\n                window.audioManager.playDragPoint();\n            }\n        }\n        \n        this.selectedPoint.x = snappedPoint.x;\n        this.selectedPoint.y = snappedPoint.y;\n        this.draw();'
);

// 5. 修改checkAnswer方法，添加成功或失败音效
gameJsContent = gameJsContent.replace(
    'if (this.currentLevel.validate(this.points)) {\n            this.showSuccess();',
    'if (this.currentLevel.validate(this.points)) {\n            // 播放成功音效\n            if (window.audioManager) {\n                window.audioManager.playSuccess();\n            }\n            this.showSuccess();'
);

gameJsContent = gameJsContent.replace(
    'this.showMessage(\'不正确，请重试！\', false);',
    '// 播放失败音效\n                if (window.audioManager) {\n                    window.audioManager.playFail();\n                }\n                this.showMessage(\'不正确，请重试！\', false);'
);

// 6. 修改showSuccess方法，添加关卡完成音效
gameJsContent = gameJsContent.replace(
    'showSuccess() {\n        const reward = this.currentLevel.reward;\n        this.gameState.score += reward.coins;\n        this.gameState.exp += reward.exp;\n        this.gameState.level += 1;',
    'showSuccess() {\n        const reward = this.currentLevel.reward;\n        this.gameState.score += reward.coins;\n        this.gameState.exp += reward.exp;\n        this.gameState.level += 1;\n        \n        // 播放关卡完成音效\n        if (window.audioManager) {\n            window.audioManager.playLevelComplete();\n        }'
);

// 7. 修改gameOver方法，添加游戏结束音效
gameJsContent = gameJsContent.replace(
    'gameOver() {\n        document.getElementById(\'gameOverDialog\').style.display = \'flex\';',
    'gameOver() {\n        // 播放游戏结束音效\n        if (window.audioManager) {\n            window.audioManager.playGameOver();\n        }\n        \n        document.getElementById(\'gameOverDialog\').style.display = \'flex\';'
);

// 8. 修改showHint方法，添加提示音效
gameJsContent = gameJsContent.replace(
    'showHint() {\n        document.getElementById(\'levelCompleteDialog\').style.display = \'flex\';',
    'showHint() {\n        // 播放提示音效\n        if (window.audioManager) {\n            window.audioManager.playHint();\n        }\n        \n        document.getElementById(\'levelCompleteDialog\').style.display = \'flex\';'
);

// 9. 为所有按钮添加点击音效
gameJsContent = gameJsContent.replace(
    'document.getElementById(\'drawMode\').addEventListener(\'click\', () => this.setMode(\'draw\'));',
    'document.getElementById(\'drawMode\').addEventListener(\'click\', () => {\n            if (window.audioManager) window.audioManager.playButtonClick();\n            this.setMode(\'draw\');\n        });'
);

gameJsContent = gameJsContent.replace(
    'document.getElementById(\'dragMode\').addEventListener(\'click\', () => this.setMode(\'drag\'));',
    'document.getElementById(\'dragMode\').addEventListener(\'click\', () => {\n            if (window.audioManager) window.audioManager.playButtonClick();\n            this.setMode(\'drag\');\n        });'
);

gameJsContent = gameJsContent.replace(
    'document.getElementById(\'eraseMode\').addEventListener(\'click\', () => this.setMode(\'erase\'));',
    'document.getElementById(\'eraseMode\').addEventListener(\'click\', () => {\n            if (window.audioManager) window.audioManager.playButtonClick();\n            this.setMode(\'erase\');\n        });'
);

gameJsContent = gameJsContent.replace(
    'document.getElementById(\'checkButton\').addEventListener(\'click\', () => this.checkAnswer());',
    'document.getElementById(\'checkButton\').addEventListener(\'click\', () => {\n            if (window.audioManager) window.audioManager.playButtonClick();\n            this.checkAnswer();\n        });'
);

gameJsContent = gameJsContent.replace(
    'document.getElementById(\'hintButton\').addEventListener(\'click\', () => this.showHint());',
    'document.getElementById(\'hintButton\').addEventListener(\'click\', () => {\n            if (window.audioManager) window.audioManager.playButtonClick();\n            this.showHint();\n        });'
);

gameJsContent = gameJsContent.replace(
    'document.getElementById(\'resetButton\').addEventListener(\'click\', () => this.resetLevel());',
    'document.getElementById(\'resetButton\').addEventListener(\'click\', () => {\n            if (window.audioManager) window.audioManager.playButtonClick();\n            this.resetLevel();\n        });'
);

gameJsContent = gameJsContent.replace(
    'document.getElementById(\'nextLevelBtn\').addEventListener(\'click\', () => this.nextLevel());',
    'document.getElementById(\'nextLevelBtn\').addEventListener(\'click\', () => {\n            if (window.audioManager) window.audioManager.playButtonClick();\n            this.nextLevel();\n        });'
);

gameJsContent = gameJsContent.replace(
    'document.getElementById(\'tryAgainBtn\').addEventListener(\'click\', () => {\n            this.resetLevel();\n            document.getElementById(\'levelCompleteDialog\').style.display = \'none\';\n        });',
    'document.getElementById(\'tryAgainBtn\').addEventListener(\'click\', () => {\n            if (window.audioManager) window.audioManager.playButtonClick();\n            this.resetLevel();\n            document.getElementById(\'levelCompleteDialog\').style.display = \'none\';\n        });'
);

gameJsContent = gameJsContent.replace(
    'document.getElementById(\'restartBtn\').addEventListener(\'click\', () => this.restartGame());',
    'document.getElementById(\'restartBtn\').addEventListener(\'click\', () => {\n            if (window.audioManager) window.audioManager.playButtonClick();\n            this.restartGame();\n        });'
);

// 10. 为成就解锁添加音效
gameJsContent = gameJsContent.replace(
    'showAchievement(achievement) {\n        const popup = document.getElementById(\'achievementPopup\');\n        const text = document.getElementById(\'achievementText\');',
    'showAchievement(achievement) {\n        // 播放成就解锁音效\n        if (window.audioManager) {\n            window.audioManager.playAchievement();\n        }\n        \n        const popup = document.getElementById(\'achievementPopup\');\n        const text = document.getElementById(\'achievementText\');'
);

// 11. 添加音量和静音控制方法
gameJsContent = gameJsContent + `
    // 音频控制方法
    setVolume(level) {
        if (window.audioManager) {
            window.audioManager.setVolume(level);
        }
    }
    
    toggleMute() {
        if (window.audioManager) {
            const isMuted = window.audioManager.toggleMute();
            return isMuted;
        }
        return false;
    }
`;

// 写入修改后的内容
fs.writeFileSync(gameJsPath, gameJsContent);

console.log('已成功将音效集成到游戏中！');
