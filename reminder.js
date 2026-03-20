
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
                this.init();
            }

            init() {
                this.loadFromLocalStorage();
                this.setupEventListeners();
                this.updateDisplay();
                this.requestNotificationPermission();
                this.startMotivationalQuotes();
                this.updateProductivityScore();
                this.initVoiceRecognition();
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
                        this.showToast(`Preset set to ${hours}h ${minutes}m ${seconds}s`, 'info');
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
                this.showToast('Timer started!', 'success');
                this.saveToLocalStorage();
            }

            pause() {
                if (this.isRunning && !this.isPaused) {
                    this.isPaused = true;
                    clearInterval(this.timerId);
                    this.timerId = null;
                    document.getElementById('statusText').innerHTML = '⏸ Paused';
                    this.showToast('Timer paused', 'warning');
                }
            }

            resetCycle() {
                this.timeRemaining = this.totalSeconds;
                this.updateDisplay();
                if (!this.isRunning && !this.isPaused) {
                    this.start();
                }
                this.showToast('Cycle reset', 'info');
            }

            stop() {
                if (this.timerId) clearInterval(this.timerId);
                this.isRunning = false;
                this.isPaused = false;
                this.timerId = null;
                this.timeRemaining = this.totalSeconds;
                this.updateDisplay();
                document.getElementById('statusText').innerHTML = '⏹ Stopped';
                this.showToast('Timer stopped', 'info');
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
                this.showDesktopNotification();
                this.showToast(this.reminderMessage, 'reminder');
                this.updateStats();
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
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
                        gain.gain.setValueAtTime(0.3, now);
                        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2);
                        osc.start();
                        osc.stop(now + 2);
                        break;
                    case 'chime':
                        [523, 659, 784].forEach((freq, i) => {
                            const o = this.audioCtx.createOscillator();
                            const g = this.audioCtx.createGain();
                            o.connect(g);
                            g.connect(this.audioCtx.destination);
                            o.frequency.value = freq;
                            g.gain.setValueAtTime(0.2, now + i * 0.2);
                            g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.2 + 1);
                            o.start(now + i * 0.2);
                            o.stop(now + i * 0.2 + 1);
                        });
                        break;
                    case 'digital':
                        osc.frequency.value = 1200;
                        gain.gain.setValueAtTime(0.2, now);
                        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
                        osc.start();
                        osc.stop(now + 0.3);
                        setTimeout(() => {
                            const osc2 = this.audioCtx.createOscillator();
                            const gain2 = this.audioCtx.createGain();
                            osc2.connect(gain2);
                            gain2.connect(this.audioCtx.destination);
                            osc2.frequency.value = 800;
                            gain2.gain.setValueAtTime(0.2, now + 0.4);
                            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
                            osc2.start(now + 0.4);
                            osc2.stop(now + 0.7);
                        }, 100);
                        break;
                    default:
                        osc.frequency.value = 880;
                        gain.gain.setValueAtTime(0.3, now);
                        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
                        osc.start();
                        osc.stop(now + 0.8);
                }
            }

            showDesktopNotification() {
                if (document.getElementById('desktopNotify').checked && Notification.permission === 'granted') {
                    new Notification('⏰ ChronoRemind Alert!', {
                        body: this.reminderMessage,
                        icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230b5e42"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"%3E%3C/path%3E%3C/svg%3E'
                    });
                }
            }

            showToast(message, type = 'info') {
                const toast = document.createElement('div');
                toast.className = 'toast';
                toast.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5rem;">${type === 'reminder' ? '🔔' : type === 'success' ? '✅' : 'ℹ️'}</span>
                        <span>${message}</span>
                    </div>
                `;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }

            addToHistory(message) {
                const historyItem = {
                    time: new Date().toLocaleTimeString(),
                    message: message,
                    duration: this.totalSeconds
                };
                this.history.unshift(historyItem);
                if (this.history.length > 20) this.history.pop();
                this.updateHistoryDisplay();
            }

            updateHistoryDisplay() {
                const historyDiv = document.getElementById('historyList');
                if (this.history.length === 0) {
                    historyDiv.innerHTML = '<div style="text-align: center; color: #a0aec0;">No reminders yet</div>';
                    return;
                }
                
                historyDiv.innerHTML = this.history.map(item => {
                    const hours = Math.floor(item.duration / 3600);
                    const minutes = Math.floor((item.duration % 3600) / 60);
                    const seconds = item.duration % 60;
                    return `
                        <div class="history-item">
                            <div>
                                <strong>${item.time}</strong>
                                <div style="font-size: 0.9rem;">${item.message.substring(0, 50)}</div>
                            </div>
                            <div style="font-size: 0.8rem;">${hours}h ${minutes}m ${seconds}s</div>
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
                document.getElementById('mainTimer').innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

            requestNotificationPermission() {
                if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                    Notification.requestPermission();
                }
            }

            initVoiceRecognition() {
                const voiceBtn = document.getElementById('voiceCommandBtn');
                const voiceStatus = document.getElementById('voiceStatus');
                
                // Check for browser support
                if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                    voiceStatus.innerHTML = '⚠️ Voice recognition not supported in this browser. Try Chrome, Edge, or Safari.';
                    voiceBtn.style.opacity = '0.6';
                    voiceBtn.style.cursor = 'not-allowed';
                    return;
                }
                
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();
                this.recognition.lang = 'en-US';
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.maxAlternatives = 1;
                
                voiceBtn.addEventListener('click', () => {
                    if (this.isListening) {
                        this.recognition.abort();
                        this.isListening = false;
                        voiceBtn.classList.remove('listening');
                        voiceStatus.innerHTML = '🎙️ Voice command stopped';
                        return;
                    }
                    
                    try {
                        this.recognition.start();
                        this.isListening = true;
                        voiceBtn.classList.add('listening');
                        voiceStatus.innerHTML = '🎙️ Listening... Say a command';
                        this.showToast('Listening for voice command...', 'info');
                    } catch (error) {
                        console.error('Recognition error:', error);
                        voiceStatus.innerHTML = '❌ Error starting voice recognition. Please try again.';
                        this.isListening = false;
                        voiceBtn.classList.remove('listening');
                    }
                });
                
                this.recognition.onresult = (event) => {
                    const command = event.results[0][0].transcript.toLowerCase().trim();
                    voiceStatus.innerHTML = `✅ Recognized: "${command}"`;
                    this.showToast(`Voice command: "${command}"`, 'success');
                    this.processVoiceCommand(command);
                    
                    setTimeout(() => {
                        if (voiceStatus.innerHTML.includes('Recognized')) {
                            voiceStatus.innerHTML = '🎙️ Click microphone to give a command';
                        }
                    }, 3000);
                };
                
                this.recognition.onerror = (event) => {
                    console.error('Recognition error:', event.error);
                    let errorMessage = '';
                    switch(event.error) {
                        case 'not-allowed':
                            errorMessage = '❌ Microphone access denied. Please allow microphone permissions.';
                            break;
                        case 'no-speech':
                            errorMessage = '🎙️ No speech detected. Please try again.';
                            break;
                        case 'audio-capture':
                            errorMessage = '❌ No microphone found. Please check your microphone.';
                            break;
                        default:
                            errorMessage = `❌ Voice error: ${event.error}. Please try again.`;
                    }
                    voiceStatus.innerHTML = errorMessage;
                    this.isListening = false;
                    voiceBtn.classList.remove('listening');
                    
                    setTimeout(() => {
                        if (voiceStatus.innerHTML.includes('error') || voiceStatus.innerHTML.includes('No speech')) {
                            voiceStatus.innerHTML = '🎙️ Click microphone to give a command';
                        }
                    }, 4000);
                };
                
                this.recognition.onend = () => {
                    this.isListening = false;
                    voiceBtn.classList.remove('listening');
                    if (voiceStatus.innerHTML.includes('Listening')) {
                        voiceStatus.innerHTML = '🎙️ Click microphone to give a command';
                    }
                };
            }
            
            processVoiceCommand(command) {
                // Start command
                if (command.includes('start') || command === 'start timer' || command.includes('begin')) {
                    this.start();
                    this.showToast('Voice: Timer started!', 'success');
                }
                // Pause command
                else if (command.includes('pause') || command.includes('stop timer') && !command.includes('reset')) {
                    this.pause();
                    this.showToast('Voice: Timer paused', 'warning');
                }
                // Reset command
                else if (command.includes('reset') || command.includes('restart')) {
                    this.resetCycle();
                    this.showToast('Voice: Timer reset', 'info');
                }
                // Stop command (full stop)
                else if (command.includes('stop all') || command === 'stop' || command.includes('halt')) {
                    this.stop();
                    this.showToast('Voice: Timer stopped', 'info');
                }
                // Set time command - handles various formats
                else if (command.includes('set') || command.includes('change to')) {
                    this.parseAndSetTime(command);
                }
                // Help command
                else if (command.includes('help') || command.includes('what can I say')) {
                    this.showToast('Voice commands: start, pause, reset, stop, set [number] minutes/hours', 'info');
                }
                // Status command
                else if (command.includes('status') || command.includes('time left')) {
                    const hours = Math.floor(this.timeRemaining / 3600);
                    const minutes = Math.floor((this.timeRemaining % 3600) / 60);
                    const seconds = this.timeRemaining % 60;
                    this.showToast(`${hours}h ${minutes}m ${seconds}s remaining`, 'info');
                }
                else {
                    this.showToast(`Command "${command}" not recognized. Try: start, pause, reset, stop, or set 5 minutes`, 'warning');
                }
            }
            
            parseAndSetTime(command) {
                // Extract numbers from command
                const numbers = command.match(/\d+/g);
                if (!numbers) {
                    this.showToast('Please specify a time, like "set 5 minutes"', 'warning');
                    return;
                }
                
                let value = parseInt(numbers[0]);
                let unit = 'minutes';
                
                if (command.includes('hour') || command.includes('hr')) {
                    unit = 'hours';
                } else if (command.includes('second')) {
                    unit = 'seconds';
                } else if (command.includes('minute') || command.includes('min')) {
                    unit = 'minutes';
                }
                
                let newTotalSeconds = this.totalSeconds;
                
                switch(unit) {
                    case 'hours':
                        if (value >= 1 && value <= 23) {
                            newTotalSeconds = value * 3600;
                            this.showToast(`Setting timer to ${value} hour(s)`, 'success');
                        } else {
                            this.showToast('Please set hours between 1 and 23', 'warning');
                            return;
                        }
                        break;
                    case 'minutes':
                        if (value >= 1 && value <= 120) {
                            newTotalSeconds = value * 60;
                            this.showToast(`Setting timer to ${value} minute(s)`, 'success');
                        } else {
                            this.showToast('Please set minutes between 1 and 120', 'warning');
                            return;
                        }
                        break;
                    case 'seconds':
                        if (value >= 5 && value <= 3600) {
                            newTotalSeconds = value;
                            this.showToast(`Setting timer to ${value} second(s)`, 'success');
                        } else {
                            this.showToast('Please set seconds between 5 and 3600', 'warning');
                            return;
                        }
                        break;
                }
                
                // Update the sliders
                const hours = Math.floor(newTotalSeconds / 3600);
                const minutes = Math.floor((newTotalSeconds % 3600) / 60);
                const seconds = newTotalSeconds % 60;
                
                document.getElementById('hoursSlider').value = hours;
                document.getElementById('hoursInput').value = hours;
                document.getElementById('minutesSlider').value = minutes;
                document.getElementById('minutesInput').value = minutes;
                document.getElementById('secondsSlider').value = seconds;
                document.getElementById('secondsInput').value = seconds;
                document.getElementById('hoursValue').innerText = hours;
                document.getElementById('minutesValue').innerText = minutes;
                document.getElementById('secondsValue').innerText = seconds;
                
                this.totalSeconds = newTotalSeconds;
                if (!this.isRunning && !this.isPaused) {
                    this.timeRemaining = this.totalSeconds;
                    this.updateDisplay();
                }
            }

            startMotivationalQuotes() {
                this.quotes = [
                    "Consistency beats intensity 🌱",
                    "Small steps every day lead to big results 🚀",
                    "Your only limit is your mind 💪",
                    "Discipline is choosing what you want most over what you want now 🎯",
                    "Progress, not perfection ✨",
                    "The future depends on what you do today 🌟",
                    "Every second counts in the journey of growth ⏰"
                ];
                this.showRandomQuote();
            }

            showRandomQuote() {
                const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
                document.getElementById('quoteDisplay').innerHTML = `"${randomQuote}"`;
            }

            applySuggestion() {
                const suggestions = [
                    { hours: 0, minutes: 5, seconds: 0, msg: "Quick 5-min stretch break 🧘" },
                    { hours: 0, minutes: 15, seconds: 0, msg: "Hydration reminder - drink water 💧" },
                    { hours: 0, minutes: 25, seconds: 0, msg: "Deep breathing exercise 🧠" },
                    { hours: 0, minutes: 45, seconds: 0, msg: "Stand up and walk around 🚶" },
                    { hours: 1, minutes: 0, seconds: 0, msg: "Hourly wellness check 🌿" }
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
                this.showToast(`Applied: ${suggestion.msg}`, 'success');
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
    