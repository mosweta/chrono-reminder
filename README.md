# ⏰ ChronoRemind - Smart Voice-Enabled Reminder System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/mosweta-school/chrono-reminder.git)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Speech API](https://img.shields.io/badge/Web%20Speech-API-blue)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A sophisticated, modular reminder application that transforms simple timer functionality into a comprehensive productivity tool with voice commands, real-time analytics, smart suggestions, and personalized experiences. Built with clean, separated HTML, CSS, and JavaScript files for optimal maintainability and performance.

![ChronoRemind Demo Banner](https://via.placeholder.com/1200x400/0b5e42/ffffff?text=ChronoRemind+Smart+Reminder+System)

## 📑 Table of Contents
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage Guide](#-usage-guide)
- [Voice Commands](#-voice-commands)
- [Customization](#-customization)
- [Technical Architecture](#-technical-architecture)
- [Browser Support](#-browser-support)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## ✨ Features

### 🎯 Core Timer Functionality
- **Precise Time Control**: Hours, minutes, and seconds with individual sliders and number inputs
- **Visual Countdown**: Large, easy-to-read timer display with animated progress bar
- **Auto-reset Cycle**: Automatically resets after each reminder for continuous use
- **Smart Controls**: Start, pause, reset, and stop with keyboard and mouse support
- **Quick Presets**: One-click intervals (5min, 15min, 25min, 45min, 1hour)

### 🎤 Voice Commands
- **Hands-free Control**: Start, pause, reset, or stop the timer with your voice
- **Voice Time Setting**: "Set 5 minutes", "Set 1 hour", "Set 30 seconds"
- **Status Inquiry**: Ask "status" to hear remaining time
- **Help Command**: Say "help" to get voice command suggestions
- **Real-time Feedback**: Visual indicators and toast notifications
- **Error Handling**: Graceful fallbacks with clear error messages

### 📊 Smart Analytics Dashboard
- **Total Reminders**: Track all completed reminders
- **Completed Cycles**: Monitor your consistency
- **Total Focus Time**: Cumulative focus hours and minutes
- **Productivity Score**: AI-powered score based on your consistency
- **Reminder History**: Detailed log with timestamps and durations

### 🔊 Multiple Alert Sounds
- **Classic Beep**: Traditional timer alert
- **Gentle Bell**: Soothing notification
- **Melodic Chime**: Musical alert sequence
- **Digital Alert**: Modern notification sound
- **Nature Sound**: Calming environmental tones

### 🔔 Advanced Notifications
- **Desktop Notifications**: System-level alerts even in background
- **Device Vibration**: Haptic feedback on mobile devices
- **Custom Messages**: Personalized reminder text for each alert

### 🎨 Modern UI/UX
- **Glass-morphism Design**: Elegant semi-transparent cards with backdrop blur
- **Gradient Themes**: Green, blue, and maroon color scheme
- **Animated Elements**: Smooth transitions and progress animations
- **Responsive Layout**: Perfect on desktop, tablet, and mobile
- **Dark/Light/Gradient Modes**: Customizable visual themes

### 🧠 Smart Features
- **Motivational Quotes**: Daily inspiration to keep you going
- **Smart Suggestions**: Context-aware time recommendations based on usage patterns
- **Data Persistence**: Local storage for history and preferences
- **Productivity Analytics**: Visual insights into your habits

## 📁 Project Structure
chronoremind/
│
├── index.html # Main HTML structure
├── css/
│ └── style.css # All styles, animations, and responsive design
├── js/
│ └── reminder.js # Core application logic and voice recognition
├── assets/ # Optional assets folder
│ ├── sounds/ # Custom sound files (for future expansion)
│ ├── icons/ # Icon assets (for future expansion)
│ └── images/ # Image assets (for future expansion)
├── README.md # Comprehensive documentation
├── LICENSE # MIT License

### File Details

#### `index.html`
- Semantic HTML5 structure with ARIA labels for accessibility
- All DOM elements with unique IDs for JavaScript interaction
- References to external CSS and JS files
- Mobile-responsive viewport settings
- Modern HTML5 features and best practices

#### `css/style.css`
- Modular CSS organization with comments
- CSS Grid and Flexbox layouts for responsive design
- Keyframe animations for smooth transitions
- Responsive breakpoints (mobile, tablet, desktop)
- Glass-morphism effects with backdrop-filter
- Custom scrollbar styling for modern browsers
- Dark/light theme support via CSS variables
- Print-friendly styles

#### `js/reminder.js`
- ES6+ class-based architecture
- Event-driven programming pattern
- Web Speech API integration with error handling
- Web Audio API for sound synthesis
- LocalStorage for data persistence
- Modular method organization with clear separation of concerns
- Comprehensive error handling and validation
- Performance optimizations for smooth animations

## 🚀 Installation

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Local web server for development

### Method 1: Direct Download
```bash
# Clone the repository
git clone https://github.com/mosweta-school/chrono-reminder.git

# Navigate to project directory
cd chrono-reminder

# Open the application
open index.html  # On macOS
start index.html # On Windows
xdg-open index.html # On Linux