// 为四边形的认识游戏添加音效 - 修复版
// 运行此脚本将修改game.js文件，在关键交互点添加音效，但不会干扰现有的事件监听

const fs = require('fs');
const path = require('path');

// 游戏文件路径
const gameJsPath = path.join(__dirname, 'game.js');

// 读取游戏文件
let gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

// 1. 修改构造函数，但不添加点击事件监听器
// 注意：将音频初始化集成到现有代码中，不要添加新的事件监听器
gameJsContent = gameJsContent.replace(
    'constructor() {',
    'constructor() {'
);

// 2. 修改startGame方法，播放背景音乐
gameJsContent = gameJsContent.replace(
    'startGame() {',
    'startGame() {\n        // 开始播放背景音乐并初始化音频系统\n        if (window.audioManager) {\n            window.audioManager.initialize();\n            window.audioManager.playBackgroundMusic();\n        }\n'
);

// 3. 修改handleMouseDown方法，添加放置点、拖拽和擦除音效
// 但保持原有功能不变
gameJsContent = gameJsContent.replace(
    'const snappedPoint = this.snapToGrid(x, y);\n                    this.points.push(snappedPoint);\n                    this.draw();',
    'const snappedPoint = this.snapToGrid(x, y);\n                    this.points.push(snappedPoint);\n                    this.draw();\n                    \n                    // 播放放置点音效\n                    if (window.audioManager) {\n                        window.audioManager.playPlacePoint();\n                    }'
);

gameJsContent = gameJsContent.replace(
    'this.selectedPoint = this.findNearestPoint(x, y);\n                this.isDragging = true;',
    'this.selectedPoint = this.findNearestPoint(x, y);\n                this.isDragging = true;\n                \n                // 播放拖拽音效\n                if (window.audioManager && this.selectedPoint) {\n                    window.audioManager.playDragPoint();\n                }'
);

gameJsContent = gameJsContent.replace(
    'this.points = this.points.filter(p => p !== pointToRemove);\n                    this.draw();',
    'this.points = this.points.filter(p => p !== pointToRemove);\n                    this.draw();\n                    \n                    // 播放擦除音效\n                    if (window.audioManager) {\n                        window.audioManager.playErasePoint();\n                    }'
);

// 5. 修改checkAnswer方法，添加成功或失败音效
gameJsContent = gameJsContent.replace(
    'if (this.currentLevel.validate(this.points)) {',
    'if (this.currentLevel.validate(this.points)) {\n            // 播放成功音效\n            if (window.audioManager) {\n                window.audioManager.playSuccess();\n            }'
);

gameJsContent = gameJsContent.replace(
    'this.showMessage(\'不正确，请重试！\', false);',
    '// 播放失败音效\n                if (window.audioManager) {\n                    window.audioManager.playFail();\n                }\n                this.showMessage(\'不正确，请重试！\', false);'
);

// 6. 修改showSuccess方法，添加关卡完成音效
gameJsContent = gameJsContent.replace(
    'showSuccess() {',
    'showSuccess() {\n        // 播放关卡完成音效\n        if (window.audioManager) {\n            window.audioManager.playLevelComplete();\n        }\n'
);

// 7. 修改gameOver方法，添加游戏结束音效
gameJsContent = gameJsContent.replace(
    'gameOver() {',
    'gameOver() {\n        // 播放游戏结束音效\n        if (window.audioManager) {\n            window.audioManager.playGameOver();\n        }\n'
);

// 8. 修改showHint方法，添加提示音效
gameJsContent = gameJsContent.replace(
    'showHint() {',
    'showHint() {\n        // 播放提示音效\n        if (window.audioManager) {\n            window.audioManager.playHint();\n        }\n'
);

// 9. 在事件处理中添加按钮音效，但要谨慎修改以保持原有功能
const buttonSelectors = [
    'document.getElementById(\'drawMode\').addEventListener(\'click\', () => this.setMode(\'draw\'));',
    'document.getElementById(\'dragMode\').addEventListener(\'click\', () => this.setMode(\'drag\'));',
    'document.getElementById(\'eraseMode\').addEventListener(\'click\', () => this.setMode(\'erase\'));',
    'document.getElementById(\'checkButton\').addEventListener(\'click\', () => this.checkAnswer());',
    'document.getElementById(\'hintButton\').addEventListener(\'click\', () => this.showHint());',
    'document.getElementById(\'resetButton\').addEventListener(\'click\', () => this.resetLevel());',
    'document.getElementById(\'nextLevelBtn\').addEventListener(\'click\', () => this.nextLevel());',
    'document.getElementById(\'restartBtn\').addEventListener(\'click\', () => this.restartGame());'
];

// 以更安全的方式修改按钮事件监听器
buttonSelectors.forEach(selector => {
    const pattern = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const replacement = selector.replace(/\(\) => (this\.[^)]+\(\))/, '() => {\n            if (window.audioManager) window.audioManager.playButtonClick();\n            $1;\n        }');
    gameJsContent = gameJsContent.replace(pattern, replacement);
});

// 特殊处理 tryAgainBtn
gameJsContent = gameJsContent.replace(
    'document.getElementById(\'tryAgainBtn\').addEventListener(\'click\', () => {',
    'document.getElementById(\'tryAgainBtn\').addEventListener(\'click\', () => {\n            if (window.audioManager) window.audioManager.playButtonClick();'
);

// 10. 为成就解锁添加音效
gameJsContent = gameJsContent.replace(
    'showAchievement(achievement) {',
    'showAchievement(achievement) {\n        // 播放成就解锁音效\n        if (window.audioManager) {\n            window.audioManager.playAchievement();\n        }\n'
);

// 11. 添加音量和静音控制方法，但不改变现有方法
if (!gameJsContent.includes('setVolume(level)')) {
    const lastBracket = gameJsContent.lastIndexOf('}');
    const newMethods = `
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
    
    gameJsContent = gameJsContent.slice(0, lastBracket) + newMethods + gameJsContent.slice(lastBracket);
}

// 写入修改后的内容
fs.writeFileSync(gameJsPath, gameJsContent);

console.log('已成功将音效集成到游戏中！点击事件已保持正常功能。');
