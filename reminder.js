class DesktopNotificationManager {
    constructor() {
        this.notificationPermission = false;
        this.initNotificationSystem();
    }

    // Initialize notification system
    initNotificationSystem() {
        this.checkNotificationPermission();
        this.setupNotificationListeners();
    }

    // Check current notification permission status
    checkNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.notificationPermission = true;
                this.updateNotificationUI('granted');
            } else if (Notification.permission === 'denied') {
                this.notificationPermission = false;
                this.updateNotificationUI('denied');
            } else {
                this.notificationPermission = false;
                this.updateNotificationUI('default');
            }
        } else {
            this.updateNotificationUI('unsupported');
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            this.showToast('Notifications not supported in this browser');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                this.notificationPermission = true;
                this.updateNotificationUI('granted');
                this.showToast('✅ Notifications enabled! You will now receive desktop alerts.');
                this.sendTestNotification();
                return true;
            } else if (permission === 'denied') {
                this.notificationPermission = false;
                this.updateNotificationUI('denied');
                this.showToast('❌ Notification permission denied. Please enable in browser settings.');
                return false;
            }
        } catch (error) {
            console.error('Notification permission error:', error);
            this.showToast('Error requesting notification permission');
            return false;
        }
    }

    // Send a test notification
    sendTestNotification() {
        if (this.notificationPermission && document.getElementById('desktopNotify')?.checked) {
            new Notification('🔔 ChronoRemind Test Notification', {
                body: 'Desktop notifications are working correctly!',
                icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230b5e42"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"%3E%3C/path%3E%3C/svg%3E',
                badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230b5e42"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"%3E%3C/path%3E%3C/svg%3E',
                silent: false,
                vibrate: [200, 100, 200]
            });
        }
    }

    // Send reminder notification
    sendReminderNotification(title, message, reminderType = 'regular') {
        const notifyEnabled = document.getElementById('desktopNotify')?.checked;
        
        if (this.notificationPermission && notifyEnabled) {
            try {
                const notification = new Notification(title, {
                    body: message,
                    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230b5e42"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"%3E%3C/path%3E%3C/svg%3E',
                    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230b5e42"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"%3E%3C/path%3E%3C/svg%3E',
                    silent: false,
                    vibrate: reminderType === 'urgent' ? [300, 150, 300, 150, 300] : [200, 100, 200],
                    requireInteraction: reminderType === 'urgent',
                    tag: `reminder-${Date.now()}`,
                    renotify: true
                });
                
                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
                
                if (reminderType !== 'urgent') {
                    setTimeout(() => notification.close(), 10000);
                }
                
                return notification;
            } catch (error) {
                console.error('Notification error:', error);
            }
        }
        return null;
    }

    sendTimerCompleteNotification(message) {
        this.sendReminderNotification('⏰ Timer Complete!', message, 'regular');
    }
    
    sendMotivationalNotification(quote) {
        if (Math.random() < 0.3) {
            this.sendReminderNotification('💡 Daily Motivation', quote, 'regular');
        }
    }
    
    sendAchievementNotification(achievement, cycles) {
        this.sendReminderNotification('🏆 Achievement Unlocked!', `${achievement} - ${cycles} cycles completed!`, 'urgent');
    }

    updateNotificationUI(status) {
        const statusDiv = document.getElementById('notificationStatus');
        if (!statusDiv) return;
        
        switch(status) {
            case 'granted':
                statusDiv.innerHTML = '✅ <strong>Notifications Enabled</strong><br>You will receive desktop alerts when reminders trigger.';
                statusDiv.style.background = '#e6f7e6';
                statusDiv.style.borderLeft = '4px solid #48bb78';
                break;
            case 'denied':
                statusDiv.innerHTML = '❌ <strong>Notifications Blocked</strong><br>Please enable notifications in your browser settings to receive alerts.';
                statusDiv.style.background = '#ffe6e6';
                statusDiv.style.borderLeft = '4px solid #f56565';
                break;
            case 'default':
                statusDiv.innerHTML = '🔔 <strong>Notifications Not Set</strong><br>Click "Request Permission" to enable desktop alerts.';
                statusDiv.style.background = '#fff3e0';
                statusDiv.style.borderLeft = '4px solid #ed8936';
                break;
            case 'unsupported':
                statusDiv.innerHTML = '⚠️ <strong>Notifications Not Supported</strong><br>Your browser does not support desktop notifications.';
                statusDiv.style.background = '#f0f0f0';
                statusDiv.style.borderLeft = '4px solid #a0aec0';
                break;
        }
    }

    setupNotificationListeners() {
        const requestBtn = document.getElementById('requestNotifyBtn');
        if (requestBtn) {
            requestBtn.addEventListener('click', () => this.requestNotificationPermission());
        }
        
        const notifyToggle = document.getElementById('desktopNotify');
        if (notifyToggle) {
            notifyToggle.addEventListener('change', (e) => {
                if (e.target.checked && Notification.permission !== 'granted') {
                    this.requestNotificationPermission();
                }
                this.saveNotificationPreference(e.target.checked);
            });
            
            const savedPreference = localStorage.getItem('desktopNotifyEnabled');
            if (savedPreference !== null) {
                notifyToggle.checked = savedPreference === 'true';
            }
        }
    }
    
    saveNotificationPreference(enabled) {
        localStorage.setItem('desktopNotifyEnabled', enabled);
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #0b5e42 0%, #2c5282 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
            font-size: 0.9rem;
            white-space: nowrap;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

class ModernReminderSystem {
    constructor() {
        this.totalSeconds = 600;
        this.timeRemaining = 600;
        this.timerId = null;
        this.isRunning = false;
        this.isPaused = false;
        this.totalReminders = 0;
        this.completedCycles = 0;
        this.totalFocusSeconds = 0;
        this.history = [];
        this.reminderMessage = document.getElementById('reminderMessage').value;
        this.audioCtx = null;
        this.recognition = null;
        this.isListening = false;
        
        // Initialize notification manager
        this.notificationManager = new DesktopNotificationManager();
        
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateDisplay();
        this.initVoiceRecognition();
        this.updateProductivityScore();
        this.quotes = [
            "Consistency beats intensity 🌱",
            "Small steps lead to big results 🚀",
            "Your only limit is your mind 💪",
            "Progress, not perfection ✨",
            "Every second counts ⏰",
            "Stay focused, stay humble 🌿",
            "Make today count 🌟"
        ];
        this.showRandomQuote();
    }

    setupEventListeners() {
        const hoursSlider = document.getElementById('hoursSlider');
        const hoursInput = document.getElementById('hoursInput');
        const hoursValue = document.getElementById('hoursValue');
        const minutesSlider = document.getElementById('minutesSlider');
        const minutesInput = document.getElementById('minutesInput');
        const minutesValue = document.getElementById('minutesValue');
        const secondsSlider = document.getElementById('secondsSlider');
        const secondsInput = document.getElementById('secondsInput');
        const secondsValue = document.getElementById('secondsValue');

        const updateDuration = () => {
            const hours = parseInt(hoursSlider.value);
            const minutes = parseInt(minutesSlider.value);
            const seconds = parseInt(secondsSlider.value);
            
            this.totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
            if (this.totalSeconds === 0) this.totalSeconds = 1;
            
            if (!this.isRunning && !this.isPaused) {
                this.timeRemaining = this.totalSeconds;
                this.updateDisplay();
                this.updateProgressBar();
            }
        };

        const syncSliders = (source, target1, target2, valueElem) => {
            return (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 0;
                target1.value = val;
                target2.value = val;
                if (valueElem) valueElem.innerText = val;
                updateDuration();
            };
        };

        hoursSlider.addEventListener('input', syncSliders(hoursSlider, hoursInput, hoursSlider, hoursValue));
        hoursInput.addEventListener('input', syncSliders(hoursInput, hoursSlider, hoursInput, hoursValue));
        minutesSlider.addEventListener('input', syncSliders(minutesSlider, minutesInput, minutesSlider, minutesValue));
        minutesInput.addEventListener('input', syncSliders(minutesInput, minutesSlider, minutesInput, minutesValue));
        secondsSlider.addEventListener('input', syncSliders(secondsSlider, secondsInput, secondsSlider, secondsValue));
        secondsInput.addEventListener('input', syncSliders(secondsInput, secondsSlider, secondsInput, secondsValue));

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const hours = parseInt(btn.dataset.hours);
                const minutes = parseInt(btn.dataset.minutes);
                const seconds = parseInt(btn.dataset.seconds);
                
                hoursSlider.value = hours;
                hoursInput.value = hours;
                minutesSlider.value = minutes;
                minutesInput.value = minutes;
                secondsSlider.value = seconds;
                secondsInput.value = seconds;
                
                hoursValue.innerText = hours;
                minutesValue.innerText = minutes;
                secondsValue.innerText = seconds;
                
                this.totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                if (!this.isRunning && !this.isPaused) {
                    this.timeRemaining = this.totalSeconds;
                    this.updateDisplay();
                }
                this.showToast(`Set to ${hours}h ${minutes}m ${seconds}s`);
            });
        });

        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetCycle());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('reminderMessage').addEventListener('input', (e) => {
            this.reminderMessage = e.target.value;
            this.saveToLocalStorage();
        });
        document.getElementById('themeSelect').addEventListener('change', (e) => this.changeTheme(e.target.value));
        document.getElementById('desktopNotify').addEventListener('change', (e) => this.saveToLocalStorage());
        document.getElementById('newQuoteBtn').addEventListener('click', () => this.showRandomQuote());
        document.getElementById('applySuggestionBtn').addEventListener('click', () => this.applySuggestion());
    }

    start() {
        if (this.timerId) clearInterval(this.timerId);
        this.isRunning = true;
        this.isPaused = false;
        this.timerId = setInterval(() => this.tick(), 1000);
        document.getElementById('statusText').innerHTML = '▶ Running';
        this.showToast('Timer started!');
        this.saveToLocalStorage();
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            clearInterval(this.timerId);
            this.timerId = null;
            document.getElementById('statusText').innerHTML = '⏸ Paused';
            this.showToast('Timer paused');
        }
    }

    resetCycle() {
        this.timeRemaining = this.totalSeconds;
        this.updateDisplay();
        if (!this.isRunning && !this.isPaused) {
            this.start();
        }
        this.showToast('Cycle reset');
    }

    stop() {
        if (this.timerId) clearInterval(this.timerId);
        this.isRunning = false;
        this.isPaused = false;
        this.timerId = null;
        this.timeRemaining = this.totalSeconds;
        this.updateDisplay();
        document.getElementById('statusText').innerHTML = '⏹ Stopped';
        this.showToast('Timer stopped');
    }

    tick() {
        if (!this.isRunning || this.isPaused) return;
        
        if (this.timeRemaining <= 0) {
            this.triggerReminder();
            this.timeRemaining = this.totalSeconds;
            this.completedCycles++;
            this.totalFocusSeconds += this.totalSeconds;
            this.updateStats();
            this.updateProductivityScore();
            this.saveToLocalStorage();
        } else {
            this.timeRemaining--;
        }
        
        this.updateDisplay();
        this.updateProgressBar();
    }

    triggerReminder() {
        this.totalReminders++;
        this.addToHistory(this.reminderMessage);
        this.playSound();
        
        // Send desktop notification using the notification manager
        this.notificationManager.sendTimerCompleteNotification(this.reminderMessage);
        
        this.showToast(this.reminderMessage);
        this.updateStats();
        
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
        
        // Send motivational notification occasionally
        this.notificationManager.sendMotivationalNotification(this.getRandomQuote());
        
        // Check for achievements
        if (this.completedCycles === 10 || this.completedCycles === 25 || this.completedCycles === 50 || this.completedCycles === 100) {
            this.notificationManager.sendAchievementNotification('Milestone Reached!', this.completedCycles);
        }
    }

    getRandomQuote() {
        const quotes = [
            "Consistency beats intensity!",
            "You're doing great! Keep going!",
            "Every minute counts towards your goals!",
            "Progress is progress, no matter how small!",
            "Stay focused and keep pushing!",
            "You're building habits that last!",
            "Small steps lead to big changes!"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    playSound() {
        const soundType = document.getElementById('soundSelect').value;
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        switch(soundType) {
            case 'bell':
                osc.frequency.value = 440;
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
                osc.start();
                osc.stop(now + 1.5);
                break;
            case 'chime':
                [523, 659, 784].forEach((freq, i) => {
                    const o = this.audioCtx.createOscillator();
                    const g = this.audioCtx.createGain();
                    o.connect(g);
                    g.connect(this.audioCtx.destination);
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0.15, now + i * 0.2);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.2 + 0.8);
                    o.start(now + i * 0.2);
                    o.stop(now + i * 0.2 + 0.8);
                });
                break;
            default:
                osc.frequency.value = 880;
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
                osc.start();
                osc.stop(now + 0.6);
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
    }

    addToHistory(message) {
        const historyItem = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message: message.substring(0, 40),
            duration: this.totalSeconds
        };
        this.history.unshift(historyItem);
        if (this.history.length > 15) this.history.pop();
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyDiv = document.getElementById('historyList');
        if (this.history.length === 0) {
            historyDiv.innerHTML = '<div style="text-align: center; color: #a0aec0; padding: 20px;">No reminders yet</div>';
            return;
        }
        
        historyDiv.innerHTML = this.history.map(item => {
            const mins = Math.floor(item.duration / 60);
            return `
                <div class="history-item">
                    <div>
                        <strong>${item.time}</strong>
                        <div style="font-size: 0.75rem;">${item.message}</div>
                    </div>
                    <div style="font-size: 0.7rem;">${mins}min</div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        document.getElementById('totalReminders').innerText = this.totalReminders;
        document.getElementById('completedCycles').innerText = this.completedCycles;
        const totalHours = Math.floor(this.totalFocusSeconds / 3600);
        const totalMins = Math.floor((this.totalFocusSeconds % 3600) / 60);
        document.getElementById('totalFocusTime').innerText = `${totalHours}h ${totalMins}m`;
    }

    updateProductivityScore() {
        let score = 100;
        if (this.completedCycles > 0) {
            const consistency = Math.min(100, (this.completedCycles / Math.max(1, this.totalReminders)) * 100);
            score = Math.floor(consistency * 0.7 + (this.totalReminders > 0 ? 30 : 0));
        }
        document.getElementById('productivityScore').innerText = score;
    }

    updateDisplay() {
        const hours = Math.floor(this.timeRemaining / 3600);
        const minutes = Math.floor((this.timeRemaining % 3600) / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('mainTimer').innerHTML = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateProgressBar() {
        const progress = ((this.totalSeconds - this.timeRemaining) / this.totalSeconds) * 100;
        document.getElementById('progressFill').style.width = `${Math.max(0, progress)}%`;
    }

    changeTheme(theme) {
        const body = document.body;
        switch(theme) {
            case 'dark':
                body.style.background = '#1a202c';
                break;
            case 'light':
                body.style.background = '#f7fafc';
                break;
            default:
                body.style.background = 'linear-gradient(135deg, #0b3b2f 0%, #1a4d3a 50%, #2c1810 100%)';
        }
        this.saveToLocalStorage();
    }

    initVoiceRecognition() {
        const voiceBtn = document.getElementById('voiceCommandBtn');
        const voiceStatus = document.getElementById('voiceStatus');
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            voiceStatus.innerHTML = '⚠️ Voice not supported';
            voiceBtn.style.opacity = '0.6';
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        voiceBtn.addEventListener('click', () => {
            if (this.isListening) {
                this.recognition.abort();
                this.isListening = false;
                voiceBtn.classList.remove('listening');
                voiceStatus.innerHTML = '🎙️ Tap to start';
                return;
            }
            
            try {
                this.recognition.start();
                this.isListening = true;
                voiceBtn.classList.add('listening');
                voiceStatus.innerHTML = '🎙️ Listening...';
            } catch (error) {
                voiceStatus.innerHTML = '❌ Error, try again';
                this.isListening = false;
            }
        });
        
        this.recognition.onresult = (event) => {
            const command = event.results[0][0].transcript.toLowerCase();
            voiceStatus.innerHTML = `✅ "${command}"`;
            this.processVoiceCommand(command);
            
            setTimeout(() => {
                if (voiceStatus.innerHTML.includes(command)) {
                    voiceStatus.innerHTML = '🎙️ Tap to start';
                }
            }, 2000);
        };
        
        this.recognition.onerror = () => {
            voiceStatus.innerHTML = '❌ Try again';
            this.isListening = false;
            voiceBtn.classList.remove('listening');
            setTimeout(() => {
                if (voiceStatus.innerHTML.includes('Try again')) {
                    voiceStatus.innerHTML = '🎙️ Tap to start';
                }
            }, 2000);
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            voiceBtn.classList.remove('listening');
        };
    }
    
    processVoiceCommand(command) {
        if (command.includes('start')) {
            this.start();
        } else if (command.includes('pause')) {
            this.pause();
        } else if (command.includes('reset')) {
            this.resetCycle();
        } else if (command.includes('stop')) {
            this.stop();
        } else if (command.includes('set')) {
            const numbers = command.match(/\d+/g);
            if (numbers) {
                let value = parseInt(numbers[0]);
                if (command.includes('hour')) {
                    if (value >= 1 && value <= 23) {
                        document.getElementById('hoursSlider').value = value;
                        document.getElementById('hoursInput').value = value;
                        document.getElementById('hoursValue').innerText = value;
                        this.totalSeconds = value * 3600;
                        if (!this.isRunning && !this.isPaused) {
                            this.timeRemaining = this.totalSeconds;
                            this.updateDisplay();
                        }
                        this.showToast(`Set to ${value} hour(s)`);
                    }
                } else if (command.includes('minute')) {
                    if (value >= 1 && value <= 120) {
                        document.getElementById('minutesSlider').value = value;
                        document.getElementById('minutesInput').value = value;
                        document.getElementById('minutesValue').innerText = value;
                        const hours = parseInt(document.getElementById('hoursSlider').value);
                        const seconds = parseInt(document.getElementById('secondsSlider').value);
                        this.totalSeconds = (hours * 3600) + (value * 60) + seconds;
                        if (!this.isRunning && !this.isPaused) {
                            this.timeRemaining = this.totalSeconds;
                            this.updateDisplay();
                        }
                        this.showToast(`Set to ${value} minute(s)`);
                    }
                }
            }
        } else if (command.includes('status')) {
            const hours = Math.floor(this.timeRemaining / 3600);
            const minutes = Math.floor((this.timeRemaining % 3600) / 60);
            const seconds = this.timeRemaining % 60;
            this.showToast(`${hours}h ${minutes}m ${seconds}s left`);
        }
    }

    showRandomQuote() {
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        document.getElementById('quoteDisplay').innerHTML = `"${randomQuote}"`;
    }

    applySuggestion() {
        const suggestions = [
            { hours: 0, minutes: 5, seconds: 0, msg: "Quick 5-min stretch break 🧘" },
            { hours: 0, minutes: 15, seconds: 0, msg: "Hydration reminder 💧" },
            { hours: 0, minutes: 25, seconds: 0, msg: "Deep breathing 🧠" },
            { hours: 0, minutes: 45, seconds: 0, msg: "Walk around 🚶" },
            { hours: 1, minutes: 0, seconds: 0, msg: "Hourly check 🌿" }
        ];
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        
        document.getElementById('hoursSlider').value = suggestion.hours;
        document.getElementById('hoursInput').value = suggestion.hours;
        document.getElementById('minutesSlider').value = suggestion.minutes;
        document.getElementById('minutesInput').value = suggestion.minutes;
        document.getElementById('secondsSlider').value = suggestion.seconds;
        document.getElementById('secondsInput').value = suggestion.seconds;
        document.getElementById('hoursValue').innerText = suggestion.hours;
        document.getElementById('minutesValue').innerText = suggestion.minutes;
        document.getElementById('secondsValue').innerText = suggestion.seconds;
        
        this.totalSeconds = (suggestion.hours * 3600) + (suggestion.minutes * 60) + suggestion.seconds;
        if (!this.isRunning && !this.isPaused) {
            this.timeRemaining = this.totalSeconds;
            this.updateDisplay();
        }
        document.getElementById('suggestionDisplay').innerHTML = suggestion.msg;
        this.showToast(suggestion.msg);
    }

    saveToLocalStorage() {
        const data = {
            totalReminders: this.totalReminders,
            completedCycles: this.completedCycles,
            totalFocusSeconds: this.totalFocusSeconds,
            history: this.history,
            theme: document.getElementById('themeSelect').value,
            desktopNotify: document.getElementById('desktopNotify').checked
        };
        localStorage.setItem('reminderData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('reminderData');
        if (data) {
            const parsed = JSON.parse(data);
            this.totalReminders = parsed.totalReminders || 0;
            this.completedCycles = parsed.completedCycles || 0;
            this.totalFocusSeconds = parsed.totalFocusSeconds || 0;
            this.history = parsed.history || [];
            document.getElementById('themeSelect').value = parsed.theme || 'gradient';
            document.getElementById('desktopNotify').checked = parsed.desktopNotify !== false;
            this.changeTheme(parsed.theme || 'gradient');
            this.updateHistoryDisplay();
            this.updateStats();
        }
    }
}

// Initialize the app
const app = new ModernReminderSystem();