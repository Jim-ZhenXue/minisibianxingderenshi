// 为四边形的认识游戏添加音效的最小侵入性修复脚本
// 这个脚本采用最简单的方法添加音效，确保不会干扰游戏的正常功能

const fs = require('fs');
const path = require('path');

// 游戏文件路径
const gameJsPath = path.join(__dirname, 'game.js');

// 读取游戏文件
let gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

// 1. 在合适的地方初始化音频系统
// 这里选择在游戏已经完全加载后的一个安全位置
gameJsContent = gameJsContent.replace(
    `window.onload = function() {
    new GeometryKingdom();`,
    `window.onload = function() {
    // 创建游戏实例前先确保音频系统准备就绪但不立即初始化
    if (window.audioManager) {
        console.log("音频系统就绪");
    }
    new GeometryKingdom();`
);

// 2. 在handleMouseDown开始处添加音频初始化调用
// 这确保只有在用户首次点击时才初始化音频系统
gameJsContent = gameJsContent.replace(
    `handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();`,
    `handleMouseDown(e) {
        // 首次点击时初始化音频系统
        if (window.audioManager && !window.audioManager.initialized) {
            window.audioManager.initialize();
        }
        
        const rect = this.canvas.getBoundingClientRect();`
);

// 3. 为鼠标点击事件添加音效 - 注意这是在函数内部后期而非开头
gameJsContent = gameJsContent.replace(
    `switch(this.gameState.mode) {
            case 'draw':
                if (this.points.length < 4) {
                    const snappedPoint = this.snapToGrid(x, y);
                    this.points.push(snappedPoint);
                    this.draw();`,
    `switch(this.gameState.mode) {
            case 'draw':
                if (this.points.length < 4) {
                    const snappedPoint = this.snapToGrid(x, y);
                    this.points.push(snappedPoint);
                    this.draw();
                    
                    // 播放放置点音效
                    if (window.audioManager && window.audioManager.initialized) {
                        window.audioManager.playPlacePoint();
                    }`
);

// 4. 为其他关键事件添加音效，但采用最小侵入方式
// 添加成功音效
gameJsContent = gameJsContent.replace(
    `showSuccess() {`,
    `showSuccess() {
        // 播放成功音效
        if (window.audioManager && window.audioManager.initialized) {
            window.audioManager.playSuccess();
        }`
);

// 添加按钮点击音效
gameJsContent = gameJsContent.replace(
    `checkAnswer() {`,
    `checkAnswer() {
        // 播放按钮点击音效
        if (window.audioManager && window.audioManager.initialized) {
            window.audioManager.playButtonClick();
        }`
);

// 写入修改后的内容
fs.writeFileSync(gameJsPath, gameJsContent);

console.log('已成功添加最小侵入性音效集成，游戏功能应该正常！');
