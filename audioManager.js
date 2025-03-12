/**
 * 四边形的认识 - 音效管理系统
 * 使用 Web Audio API 直接生成音效，无需外部音频文件
 */
class AudioManager {
    constructor() {
        this.isMuted = false;
        this.volume = 0.5; // 默认音量
        this.initialized = false;
        this.bgmPlaying = false;
        this.audioContext = null;
        this.gainNode = null;
        this.bgmGainNode = null;
        this.bgmOscillators = [];
        
        // 不在构造函数中初始化AudioContext，等待用户交互
    }

    /**
     * 初始化音频上下文 - 必须在用户交互后调用
     */
    initialize() {
        if (this.initialized) return;
        
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // 创建主音量控制
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.volume;
            this.gainNode.connect(this.audioContext.destination);
            
            // 创建背景音乐音量控制
            this.bgmGainNode = this.audioContext.createGain();
            this.bgmGainNode.gain.value = this.volume * 0.3; // 背景音乐音量较低
            this.bgmGainNode.connect(this.audioContext.destination);
            
            console.log('音频上下文初始化成功');
            this.initialized = true;
            return true;
        } catch (e) {
            console.error('无法初始化音频上下文:', e);
            return false;
        }
    }
    
    /**
     * 初始化音频系统
     * 在用户首次交互后调用，以解决浏览器自动播放限制
     */
    initAudioSystem() {
        if (this.initialized) return;
        
        this.initialize();
        
        // 如果还是没有成功初始化，尝试在用户交互时初始化
        if (!this.initialized && this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                console.log('音频上下文已恢复');
                this.initialized = true;
            }).catch(err => {
                console.error('无法恢复音频上下文:', err);
            });
        }
    }
    
    /**
     * 生成简单的点击音效
     */
    playClick() {
        if (!this.initialized || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        
        const clickGain = this.audioContext.createGain();
        clickGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(clickGain);
        clickGain.connect(this.gainNode);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    /**
     * 生成放置点的音效
     */
    playPlacePoint() {
        if (!this.initialized || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
        
        const clickGain = this.audioContext.createGain();
        clickGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(clickGain);
        clickGain.connect(this.gainNode);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    /**
     * 生成拖拽点的音效
     */
    playDragPoint() {
        if (!this.initialized || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        
        const clickGain = this.audioContext.createGain();
        clickGain.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
        
        oscillator.connect(clickGain);
        clickGain.connect(this.gainNode);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
    
    /**
     * 生成擦除点的音效
     */
    playErasePoint() {
        if (!this.initialized || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);
        
        const clickGain = this.audioContext.createGain();
        clickGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
        
        oscillator.connect(clickGain);
        clickGain.connect(this.gainNode);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.15);
    }
    
    /**
     * 生成成功音效
     */
    playSuccess() {
        if (!this.initialized || this.isMuted) return;
        
        // 播放上升的音阶
        for (let i = 0; i < 3; i++) {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            
            // 创建一个基本频率并根据索引升高
            const baseFreq = 400;
            const freq = baseFreq + (i * 200);
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.15);
            
            const noteGain = this.audioContext.createGain();
            noteGain.gain.setValueAtTime(0.001, this.audioContext.currentTime + i * 0.15);
            noteGain.gain.exponentialRampToValueAtTime(this.volume, this.audioContext.currentTime + i * 0.15 + 0.01);
            noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + i * 0.15 + 0.25);
            
            oscillator.connect(noteGain);
            noteGain.connect(this.gainNode);
            
            oscillator.start(this.audioContext.currentTime + i * 0.15);
            oscillator.stop(this.audioContext.currentTime + i * 0.15 + 0.25);
        }
    }
    
    /**
     * 生成失败音效
     */
    playFail() {
        if (!this.initialized || this.isMuted) return;
        
        // 播放下降的音阶
        for (let i = 0; i < 2; i++) {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sawtooth';
            
            // 从高音开始，然后下降
            const baseFreq = 400;
            const freq = baseFreq - (i * 150);
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.2);
            
            const noteGain = this.audioContext.createGain();
            noteGain.gain.setValueAtTime(0.001, this.audioContext.currentTime + i * 0.2);
            noteGain.gain.exponentialRampToValueAtTime(this.volume * 0.8, this.audioContext.currentTime + i * 0.2 + 0.01);
            noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + i * 0.2 + 0.3);
            
            oscillator.connect(noteGain);
            noteGain.connect(this.gainNode);
            
            oscillator.start(this.audioContext.currentTime + i * 0.2);
            oscillator.stop(this.audioContext.currentTime + i * 0.2 + 0.3);
        }
    }
    
    /**
     * 生成提示音效
     */
    playHint() {
        if (!this.initialized || this.isMuted) return;
        
        // 播放两个音符的序列
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(700, this.audioContext.currentTime + 0.2);
        
        const noteGain = this.audioContext.createGain();
        noteGain.gain.setValueAtTime(0.001, this.audioContext.currentTime);
        noteGain.gain.exponentialRampToValueAtTime(this.volume * 0.7, this.audioContext.currentTime + 0.01);
        noteGain.gain.exponentialRampToValueAtTime(this.volume * 0.5, this.audioContext.currentTime + 0.2);
        noteGain.gain.exponentialRampToValueAtTime(this.volume * 0.7, this.audioContext.currentTime + 0.21);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
        
        oscillator.connect(noteGain);
        noteGain.connect(this.gainNode);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }
    
    /**
     * 生成过关庆祝音效
     */
    playLevelComplete() {
        if (!this.initialized || this.isMuted) return;
        
        // 播放欢快的上升音阶
        const notes = [400, 500, 600, 700, 800, 900];
        
        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = i % 2 === 0 ? 'sine' : 'triangle';
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.12);
            
            const noteGain = this.audioContext.createGain();
            noteGain.gain.setValueAtTime(0.001, this.audioContext.currentTime + i * 0.12);
            noteGain.gain.exponentialRampToValueAtTime(this.volume, this.audioContext.currentTime + i * 0.12 + 0.01);
            noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + i * 0.12 + 0.2);
            
            oscillator.connect(noteGain);
            noteGain.connect(this.gainNode);
            
            oscillator.start(this.audioContext.currentTime + i * 0.12);
            oscillator.stop(this.audioContext.currentTime + i * 0.12 + 0.2);
        });
    }
    
    /**
     * 生成游戏结束音效
     */
    playGameOver() {
        if (!this.initialized || this.isMuted) return;
        
        // 播放下降的音阶，表示游戏结束
        const notes = [400, 350, 300, 250, 200, 150];
        
        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.15);
            
            const noteGain = this.audioContext.createGain();
            noteGain.gain.setValueAtTime(0.001, this.audioContext.currentTime + i * 0.15);
            noteGain.gain.exponentialRampToValueAtTime(i < 3 ? this.volume : this.volume * 0.7, this.audioContext.currentTime + i * 0.15 + 0.01);
            noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + i * 0.15 + 0.25);
            
            oscillator.connect(noteGain);
            noteGain.connect(this.gainNode);
            
            oscillator.start(this.audioContext.currentTime + i * 0.15);
            oscillator.stop(this.audioContext.currentTime + i * 0.15 + 0.25);
        });
    }
    
    /**
     * 播放成就解锁音效
     */
    playAchievement() {
        if (!this.initialized || this.isMuted) return;
        
        // 播放一系列音符，表示成就解锁
        const notes = [600, 700, 800, 900, 800, 900];
        
        notes.forEach((freq, i) => {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = i % 2 === 0 ? 'sine' : 'triangle';
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.1);
            
            const noteGain = this.audioContext.createGain();
            noteGain.gain.setValueAtTime(0.001, this.audioContext.currentTime + i * 0.1);
            noteGain.gain.exponentialRampToValueAtTime(this.volume * 0.8, this.audioContext.currentTime + i * 0.1 + 0.01);
            noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + i * 0.1 + 0.15);
            
            oscillator.connect(noteGain);
            noteGain.connect(this.gainNode);
            
            oscillator.start(this.audioContext.currentTime + i * 0.1);
            oscillator.stop(this.audioContext.currentTime + i * 0.1 + 0.15);
        });
    }
    
    /**
     * 播放按钮点击音效
     */
    playButtonClick() {
        if (!this.initialized || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        
        const clickGain = this.audioContext.createGain();
        clickGain.gain.setValueAtTime(this.volume * 0.6, this.audioContext.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(clickGain);
        clickGain.connect(this.gainNode);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    /**
     * 播放背景音乐
     */
    playBackgroundMusic() {
        if (!this.initialized || this.isMuted || this.bgmPlaying) return;
        
        // 停止任何已经播放的背景音乐
        this.stopBackgroundMusic();
        
        // 创建简单的背景音乐
        this.bgmPlaying = true;
        this.generateBackgroundMelody();
    }
    
    /**
     * 生成简单的背景旋律
     */
    generateBackgroundMelody() {
        if (!this.initialized || this.isMuted) return;
        
        // 定义一个简单的音符序列
        const baseNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
        const melodyPattern = [0, 2, 4, 3, 2, 0, 4, 2];
        
        // 创建循环播放的背景音乐
        const playNote = (index) => {
            if (!this.bgmPlaying) return;
            
            const noteIndex = melodyPattern[index % melodyPattern.length];
            const freq = baseNotes[noteIndex];
            
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            const noteGain = this.audioContext.createGain();
            noteGain.gain.setValueAtTime(0.001, this.audioContext.currentTime);
            noteGain.gain.exponentialRampToValueAtTime(this.volume * 0.2, this.audioContext.currentTime + 0.05);
            noteGain.gain.exponentialRampToValueAtTime(this.volume * 0.15, this.audioContext.currentTime + 0.4);
            noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
            
            oscillator.connect(noteGain);
            noteGain.connect(this.bgmGainNode);
            
            // 存储振荡器以便稍后清理
            this.bgmOscillators.push(oscillator);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.8);
            
            // 播放下一个音符
            if (this.bgmPlaying) {
                setTimeout(() => {
                    playNote((index + 1) % melodyPattern.length);
                }, 1000);
            }
        };
        
        // 开始播放第一个音符
        playNote(0);
    }
    
    /**
     * 停止背景音乐
     */
    stopBackgroundMusic() {
        this.bgmPlaying = false;
        
        // 停止所有背景音乐振荡器
        this.bgmOscillators.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {
                // 忽略已经停止的振荡器错误
            }
        });
        
        this.bgmOscillators = [];
    }
    
    /**
     * 设置所有音效的音量
     * @param {number} level - 音量级别 (0 到 1)
     */
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
        
        if (this.initialized) {
            this.gainNode.gain.value = this.volume;
            this.bgmGainNode.gain.value = this.volume * 0.3;
        }
    }
    
    /**
     * 切换静音状态
     * @returns {boolean} - 返回当前的静音状态
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // 静音时暂停所有声音
            if (this.initialized) {
                this.gainNode.gain.value = 0;
                this.bgmGainNode.gain.value = 0;
            }
        } else {
            // 取消静音时恢复音量
            if (this.initialized) {
                this.gainNode.gain.value = this.volume;
                this.bgmGainNode.gain.value = this.volume * 0.3;
            }
        }
        
        return this.isMuted;
    }
}

// 导出单例实例，但不立即初始化
window.audioManager = new AudioManager();
