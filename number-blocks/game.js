// ===========================
// Game State Manager
// ===========================

class GameState {
    constructor(username) {
        this.currentUser = username || 'Nima';
        this.currentScreen = 'home-screen';
        this.currentTopic = null;
        this.currentLevel = null;
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.questionResults = [];
        this.settings = {
            sound: true,
            music: true,
            animations: true,
            highContrast: false,
            reduceMotion: false,
            avatar: '😊'
        };
        this.progress = {
            totalStars: 0,
            streak: 0,
            lastPlayed: null,
            topics: {}
        };
        this.loadProgress();
        this.updateStreak();
    }

    loadProgress() {
        const saved = localStorage.getItem(`numberBlocks_${this.currentUser}_progress`);
        if (saved) {
            const data = JSON.parse(saved);
            this.progress = { ...this.progress, ...data };
        } else {
            // Migrate old data for Nima if it exists
            if (this.currentUser === 'Nima') {
                const oldSaved = localStorage.getItem('numberBlocksProgress');
                if (oldSaved) {
                    const data = JSON.parse(oldSaved);
                    this.progress = { ...this.progress, ...data };
                    this.saveProgress();
                }
            }
        }

        const savedSettings = localStorage.getItem(`numberBlocks_${this.currentUser}_settings`);
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        } else {
            if (this.currentUser === 'Nima') {
                const oldSettings = localStorage.getItem('numberBlocksSettings');
                if (oldSettings) {
                    this.settings = { ...this.settings, ...JSON.parse(oldSettings) };
                    this.saveProgress();
                }
            }
        }
    }

    saveProgress() {
        localStorage.setItem(`numberBlocks_${this.currentUser}_progress`, JSON.stringify(this.progress));
        localStorage.setItem(`numberBlocks_${this.currentUser}_settings`, JSON.stringify(this.settings));
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastPlayed = this.progress.lastPlayed;

        if (lastPlayed === today) {
            // Already played today
            return;
        }

        if (lastPlayed) {
            const lastDate = new Date(lastPlayed);
            const todayDate = new Date(today);
            const diffTime = todayDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                this.progress.streak += 1;
            } else if (diffDays > 1) {
                // Streak broken
                this.progress.streak = 1;
            }
        } else {
            // First time playing
            this.progress.streak = 1;
        }

        this.progress.lastPlayed = today;
        this.saveProgress();
    }

    getTopicProgress(topicId) {
        if (!this.progress.topics[topicId]) {
            this.progress.topics[topicId] = {
                levelsCompleted: [],
                stars: {},
                totalStars: 0,
                errors: [],
                attempts: 0
            };
        }
        return this.progress.topics[topicId];
    }

    updateTopicProgress(topicId, level, stars, errors) {
        const topicProgress = this.getTopicProgress(topicId);

        if (!topicProgress.levelsCompleted.includes(level)) {
            topicProgress.levelsCompleted.push(level);
        }

        const previousStars = topicProgress.stars[level] || 0;
        topicProgress.stars[level] = Math.max(previousStars, stars);

        if (errors && errors.length > 0) {
            topicProgress.errors.push(...errors);
        }

        topicProgress.attempts += 1;

        // Recalculate total stars
        topicProgress.totalStars = Object.values(topicProgress.stars).reduce((sum, s) => sum + s, 0);

        // Update global total stars
        this.progress.totalStars = Object.values(this.progress.topics)
            .reduce((sum, topic) => sum + topic.totalStars, 0);

        this.saveProgress();
    }

    isLevelUnlocked(topicId, level) {
        if (level === 1) return true;
        const topicProgress = this.getTopicProgress(topicId);
        return topicProgress.levelsCompleted.includes(level - 1);
    }

    isTopicUnlocked(topicId) {
        // For now, all topics are unlocked
        // Can add unlock logic based on prerequisites
        return true;
    }

    getWeakAreas() {
        const weakAreas = [];

        for (const [topicId, topicProgress] of Object.entries(this.progress.topics)) {
            if (topicProgress.attempts === 0) continue;

            const totalQuestions = topicProgress.attempts * 5; // Assuming 5 questions per attempt
            const accuracy = 1 - (topicProgress.errors.length / totalQuestions);

            if (accuracy < 0.7 && topicProgress.attempts > 0) {
                weakAreas.push({
                    topicId,
                    accuracy: Math.round(accuracy * 100),
                    errors: topicProgress.errors.length
                });
            }
        }

        return weakAreas.sort((a, b) => a.accuracy - b.accuracy);
    }

    resetProgress() {
        this.progress = {
            totalStars: 0,
            streak: 0,
            lastPlayed: null,
            topics: {}
        };
        this.saveProgress();
    }
}

// ===========================
// Topics Configuration
// ===========================

const TOPICS = {
    addition: {
        id: 'addition',
        name: 'Addition',
        icon: '➕',
        visualIcon: '🟦 + 🟦 = 🟦🟦',
        description: 'Add numbers together',
        levels: 15,
        unlocked: true,
        color: '#667eea'
    },
    subtraction: {
        id: 'subtraction',
        name: 'Subtraction',
        icon: '➖',
        visualIcon: '🟦🟦🟦 - 🟦 = 🟦🟦',
        description: 'Take numbers away',
        levels: 15,
        unlocked: true,
        color: '#f5576c'
    },
    multiplication: {
        id: 'multiplication',
        name: 'Multiplication',
        icon: '✖️',
        visualIcon: '🟦🟦 × 3',
        description: 'Groups of numbers',
        levels: 11,
        unlocked: true,
        color: '#51cf66'
    },
    patterns: {
        id: 'patterns',
        name: 'Number Patterns',
        icon: '🔄',
        visualIcon: '1️⃣ 2️⃣ 3️⃣ ?',
        description: 'Complete the sequence',
        levels: 10,
        unlocked: true,
        color: '#9775fa'
    },
    comparing: {
        id: 'comparing',
        name: 'Comparing Numbers',
        icon: '⚖️',
        visualIcon: '5 > 3',
        description: 'Greater or less than',
        levels: 8,
        unlocked: true,
        color: '#4dabf7'
    },
    clock: {
        id: 'clock',
        name: 'Telling Time',
        icon: '🕐',
        visualIcon: '🕐 🕧 🕞',
        description: 'Read clocks and calculate time',
        levels: 10,
        unlocked: true,
        color: '#38d9a9'
    },
    money: {
        id: 'money',
        name: 'Money Math',
        icon: '💰',
        visualIcon: '🪙 🪙 🪙',
        description: 'Count coins and make change',
        levels: 10,
        unlocked: true,
        color: '#f59f00'
    }
};

// ===========================
// Number Block Class
// ===========================

class NumberBlock {
    constructor(number, x, y, workspace) {
        this.number = number;
        this.x = x;
        this.y = y;
        this.workspace = workspace;
        this.element = null;
        this.isDragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.create();
    }

    create() {
        this.element = document.createElement('div');
        this.element.className = 'number-block';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';

        const container = document.createElement('div');
        container.className = 'block-container';

        for (let i = 0; i < this.number; i++) {
            const segment = document.createElement('div');
            segment.className = `block-segment block-color-${this.number}`;

            if (i === this.number - 1) {
                segment.classList.add('top');
                const face = document.createElement('div');
                face.className = 'block-face';
                face.textContent = '😊';
                segment.appendChild(face);
            }

            const numberLabel = document.createElement('div');
            numberLabel.className = 'block-number';
            numberLabel.textContent = i + 1;
            segment.appendChild(numberLabel);

            container.appendChild(segment);
        }

        this.element.appendChild(container);
        this.attachEventListeners();
        this.workspace.appendChild(this.element);
    }

    attachEventListeners() {
        // Mouse events
        this.element.addEventListener('mousedown', this.onDragStart.bind(this));
        document.addEventListener('mousemove', this.onDrag.bind(this));
        document.addEventListener('mouseup', this.onDragEnd.bind(this));

        // Touch events
        this.element.addEventListener('touchstart', this.onDragStart.bind(this));
        document.addEventListener('touchmove', this.onDrag.bind(this));
        document.addEventListener('touchend', this.onDragEnd.bind(this));
    }

    onDragStart(e) {
        e.preventDefault();
        this.isDragging = true;
        this.element.classList.add('dragging');

        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

        const rect = this.element.getBoundingClientRect();
        this.offsetX = clientX - rect.left;
        this.offsetY = clientY - rect.top;
    }

    onDrag(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

        const workspaceRect = this.workspace.getBoundingClientRect();

        this.x = clientX - workspaceRect.left - this.offsetX;
        this.y = clientY - workspaceRect.top - this.offsetY;

        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    onDragEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.element.classList.remove('dragging');
    }

    getPosition() {
        return { x: this.x, y: this.y };
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
    }

    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    animateMerge(targetBlock, callback) {
        const targetPos = targetBlock.getPosition();
        this.element.style.transition = 'all 0.5s ease';
        this.element.style.left = targetPos.x + 'px';
        this.element.style.top = targetPos.y + 'px';
        this.element.style.opacity = '0';

        setTimeout(() => {
            this.remove();
            if (callback) callback();
        }, 500);
    }
}

// ===========================
// Question Generator
// ===========================

class QuestionGenerator {
    static generate(topicId, level, count = 10) {
        const questions = [];
        const usedTexts = new Set();
        const maxAttempts = count * 10;
        let attempts = 0;

        while (questions.length < count && attempts < maxAttempts) {
            attempts++;
            let question;

            switch (topicId) {
                case 'addition':
                    question = this.generateAddition(level);
                    break;
                case 'subtraction':
                    question = this.generateSubtraction(level);
                    break;
                case 'multiplication':
                    question = this.generateMultiplication(level);
                    break;
                case 'patterns':
                    question = this.generatePattern(level);
                    break;
                case 'comparing':
                    question = this.generateComparing(level);
                    break;
                case 'clock':
                    question = this.generateClock(level);
                    break;
                case 'money':
                    question = this.generateMoney(level);
                    break;
                default:
                    question = this.generateAddition(level);
            }

            // Only add if we haven't seen this question before (use text + answer for uniqueness)
            const key = question.text + '|' + question.answer;
            if (!usedTexts.has(key)) {
                usedTexts.add(key);
                questions.push(question);
            }
        }

        return questions;
    }

    static generateAddition(level) {
        let a, b, c, answer, text;

        if (level <= 2) {
            // Single digits, sum <= 10
            a = this.random(1, 5);
            b = this.random(1, 5);
        } else if (level <= 4) {
            // Single digits, sum up to 18
            a = this.random(1, 9);
            b = this.random(1, 9);
        } else if (level <= 5) {
            // Three small numbers
            a = this.random(1, 5);
            b = this.random(1, 5);
            c = this.random(1, 5);
            answer = a + b + c;
            text = `${a} + ${b} + ${c} = ?`;
            return {
                text: text,
                answer: answer,
                options: this.generateOptions(answer, 4),
                visual: { type: 'blocks', values: [a, b, c] },
                operation: 'addition',
                operands: [a, b, c]
            };
        } else if (level <= 7) {
            // One double-digit + single digit
            a = this.random(10, 30);
            b = this.random(1, 9);
        } else if (level <= 8) {
            // Three numbers, mix of single and double
            a = this.random(5, 15);
            b = this.random(3, 10);
            c = this.random(2, 8);
            answer = a + b + c;
            text = `${a} + ${b} + ${c} = ?`;
            return {
                text: text,
                answer: answer,
                options: this.generateOptions(answer, 4),
                visual: { type: 'blocks', values: [a, b, c] },
                operation: 'addition',
                operands: [a, b, c]
            };
        } else if (level <= 10) {
            // Two double-digit numbers, sum <= 50
            a = this.random(10, 30);
            b = this.random(10, 20);
        } else if (level <= 12) {
            // Larger double-digit numbers, sum <= 100
            a = this.random(20, 60);
            b = this.random(10, 40);
        } else if (level <= 14) {
            // Triple-digit addition
            a = this.random(100, 500);
            b = this.random(50, 300);
        } else {
            // Triple-digit addition, larger
            a = this.random(200, 700);
            b = this.random(100, 400);
        }

        answer = a + b;
        text = `${a} + ${b} = ?`;

        // Randomly make ~30% of questions missing-number style
        if (Math.random() < 0.3) {
            if (Math.random() < 0.5) {
                text = `? + ${b} = ${answer}`;
                return {
                    text: text,
                    answer: a,
                    options: this.generateOptions(a, 4),
                    visual: { type: 'blocks', values: [a, b] },
                    operation: 'addition',
                    operands: [a, b],
                    missingAddend: true
                };
            } else {
                text = `${a} + ? = ${answer}`;
                return {
                    text: text,
                    answer: b,
                    options: this.generateOptions(b, 4),
                    visual: { type: 'blocks', values: [a, b] },
                    operation: 'addition',
                    operands: [a, b],
                    missingAddend: true
                };
            }
        }

        return {
            text: text,
            answer: answer,
            options: this.generateOptions(answer, 4),
            visual: { type: 'blocks', values: [a, b] },
            operation: 'addition',
            operands: [a, b]
        };
    }

    static generateSubtraction(level) {
        let a, b, c, answer, text;

        if (level <= 2) {
            // Single digits, result >= 1
            a = this.random(3, 9);
            b = this.random(1, a - 1);
        } else if (level <= 4) {
            // Double-digit minus single-digit
            a = this.random(10, 20);
            b = this.random(1, 9);
        } else if (level <= 5) {
            // Three numbers: a - b - c (all small, result >= 1)
            a = this.random(10, 18);
            b = this.random(1, 5);
            c = this.random(1, Math.min(5, a - b - 1));
            answer = a - b - c;
            text = `${a} - ${b} - ${c} = ?`;
            return {
                text: text,
                answer: answer,
                options: this.generateOptions(answer, 4),
                visual: { type: 'blocks', values: [a, b, c] },
                operation: 'subtraction',
                operands: [a, b, c]
            };
        } else if (level <= 7) {
            // Double-digit minus double-digit
            a = this.random(20, 50);
            b = this.random(10, a - 1);
        } else if (level <= 8) {
            // Three numbers with larger values, result >= 1
            a = this.random(30, 60);
            b = this.random(5, 15);
            c = this.random(3, Math.min(12, a - b - 1));
            answer = a - b - c;
            text = `${a} - ${b} - ${c} = ?`;
            return {
                text: text,
                answer: answer,
                options: this.generateOptions(answer, 4),
                visual: { type: 'blocks', values: [a, b, c] },
                operation: 'subtraction',
                operands: [a, b, c]
            };
        } else if (level <= 10) {
            // Larger numbers
            a = this.random(50, 100);
            b = this.random(10, a - 1);
        } else if (level <= 12) {
            // Triple-digit minus double-digit
            a = this.random(100, 300);
            b = this.random(20, 99);
        } else {
            // Triple-digit subtraction
            a = this.random(200, 500);
            b = this.random(50, a - 1);
        }

        answer = a - b;
        text = `${a} - ${b} = ?`;

        // Randomly make ~30% of questions missing-number style
        if (Math.random() < 0.3) {
            if (Math.random() < 0.5) {
                // ? - b = answer
                text = `? - ${b} = ${answer}`;
                return {
                    text: text,
                    answer: a,
                    options: this.generateOptions(a, 4),
                    visual: { type: 'blocks', values: [a, b] },
                    operation: 'subtraction',
                    operands: [a, b],
                    missingOperand: true
                };
            } else {
                // a - ? = answer
                text = `${a} - ? = ${answer}`;
                return {
                    text: text,
                    answer: b,
                    options: this.generateOptions(b, 4),
                    visual: { type: 'blocks', values: [a, b] },
                    operation: 'subtraction',
                    operands: [a, b],
                    missingOperand: true
                };
            }
        }

        return {
            text: text,
            answer: answer,
            options: this.generateOptions(answer, 4),
            visual: { type: 'blocks', values: [a, b] },
            operation: 'subtraction',
            operands: [a, b]
        };
    }

    static generateMultiplication(level) {
        let a, b, answer, text;

        // Each level focuses on a times table
        // Level 1 = 2×, Level 2 = 3×, ... Level 9 = 10×, Levels 10-11 = mixed
        if (level <= 9) {
            a = level + 1; // table number: 2, 3, 4, ... 10
            b = this.random(1, 10);
        } else {
            // Mixed tables
            a = this.random(2, 10);
            b = this.random(2, 10);
        }

        answer = a * b;
        text = `${a} × ${b} = ?`;

        return {
            text: text,
            answer: answer,
            options: this.generateOptions(answer, 4),
            visual: { type: 'groups', values: [a, b] },
            operation: 'multiplication',
            operands: [a, b]
        };
    }

    static generatePattern(level) {
        let sequence, answer;

        if (level <= 2) {
            // Simple addition patterns, small steps (+1 to +3)
            const start = this.random(1, 10);
            const step = this.random(1, 3);
            sequence = [start, start + step, start + step * 2, start + step * 3];
            answer = start + step * 4;
        } else if (level <= 4) {
            // Addition patterns, larger steps (+4 to +10)
            const start = this.random(1, 20);
            const step = this.random(4, 10);
            sequence = [start, start + step, start + step * 2, start + step * 3];
            answer = start + step * 4;
        } else if (level <= 5) {
            // Subtraction patterns (counting down)
            const step = this.random(2, 5);
            const start = this.random(step * 5, step * 5 + 20);
            sequence = [start, start - step, start - step * 2, start - step * 3];
            answer = start - step * 4;
        } else if (level <= 6) {
            // Subtraction patterns, larger steps
            const step = this.random(5, 12);
            const start = this.random(step * 5, step * 5 + 30);
            sequence = [start, start - step, start - step * 2, start - step * 3];
            answer = start - step * 4;
        } else if (level <= 7) {
            // Multiplication patterns (×2, ×3)
            const multiplier = this.random(2, 3);
            const start = this.random(1, 4);
            sequence = [start, start * multiplier, start * multiplier ** 2, start * multiplier ** 3];
            answer = start * multiplier ** 4;
        } else if (level <= 8) {
            // Square numbers pattern
            const offset = this.random(0, 2);
            sequence = [(1 + offset) ** 2, (2 + offset) ** 2, (3 + offset) ** 2, (4 + offset) ** 2];
            answer = (5 + offset) ** 2;
        } else if (level <= 9) {
            // Decreasing step pattern: steps shrink by 1 each time (e.g. +5, +4, +3, +2, +1)
            const start = this.random(1, 10);
            const firstStep = this.random(4, 7);
            let s1 = start + firstStep;
            let s2 = s1 + (firstStep - 1);
            let s3 = s2 + (firstStep - 2);
            let s4 = s3 + (firstStep - 3);
            sequence = [start, s1, s2, s3, s4];
            answer = s4 + (firstStep - 4);
        } else {
            // Mixed challenging: triangular, doubling, alternating, or powers
            const type = this.random(1, 4);
            if (type === 1) {
                // Triangular: differences increase by 1 each time
                const base = this.random(1, 5);
                sequence = [base, base + 2, base + 5, base + 9, base + 14];
                answer = base + 20;
            } else if (type === 2) {
                // Double each time
                const start = this.random(2, 5);
                sequence = [start, start * 2, start * 4, start * 8];
                answer = start * 16;
            } else if (type === 3) {
                // Alternating pattern (add two different values alternately)
                const start = this.random(1, 10);
                const stepA = this.random(2, 5);
                const stepB = this.random(1, 3);
                sequence = [start, start + stepA, start + stepA + stepB, start + stepA * 2 + stepB, start + stepA * 2 + stepB * 2];
                answer = start + stepA * 3 + stepB * 2;
            } else {
                // Powers of a number
                const base = this.random(2, 3);
                sequence = [base, base ** 2, base ** 3, base ** 4];
                answer = base ** 5;
            }
        }

        return {
            text: `What comes next? ${sequence.join(', ')}, ?`,
            answer: answer,
            options: this.generateOptions(answer, 4),
            visual: { type: 'pattern', values: sequence },
            operation: 'pattern',
            operands: sequence
        };
    }

    static generateComparing(level) {
        const a = this.random(1, level <= 4 ? 20 : 50);
        const b = this.random(1, level <= 4 ? 20 : 50);

        let answer, symbol;
        if (a > b) {
            answer = '>';
            symbol = '>';
        } else if (a < b) {
            answer = '<';
            symbol = '<';
        } else {
            // Regenerate if equal
            return this.generateComparing(level);
        }

        return {
            text: `${a} ___ ${b}`,
            answer: answer,
            options: ['>', '<', '='],
            visual: { type: 'compare', values: [a, b] },
            operation: 'comparing',
            operands: [a, b]
        };
    }

    static generateClock(level) {
        let hour, minute, text, answer, options;

        if (level <= 1) {
            // Exact hours
            hour = this.random(1, 12);
            minute = 0;
            text = 'What time does this clock show?';
            answer = `${hour}:00`;
            options = this.generateTimeOptions(hour, minute, 'hour');
        } else if (level <= 2) {
            // Half hours
            hour = this.random(1, 12);
            minute = [0, 30][this.random(0, 1)];
            text = 'What time does this clock show?';
            answer = `${hour}:${minute === 0 ? '00' : '30'}`;
            options = this.generateTimeOptions(hour, minute, 'half');
        } else if (level <= 4) {
            // Quarter hours
            hour = this.random(1, 12);
            minute = [0, 15, 30, 45][this.random(0, 3)];
            text = 'What time does this clock show?';
            answer = `${hour}:${String(minute).padStart(2, '0')}`;
            options = this.generateTimeOptions(hour, minute, 'quarter');
        } else if (level <= 6) {
            // 5-minute intervals
            hour = this.random(1, 12);
            minute = this.random(0, 11) * 5;
            text = 'What time does this clock show?';
            answer = `${hour}:${String(minute).padStart(2, '0')}`;
            options = this.generateTimeOptions(hour, minute, 'five');
        } else if (level <= 8) {
            // Time addition with simple amounts
            hour = this.random(1, 12);
            minute = this.random(0, 3) * 15;
            const addHours = this.random(1, 3);
            const addMinutes = [0, 15, 30][this.random(0, 2)];
            let newHour = hour + addHours;
            let newMinute = minute + addMinutes;
            if (newMinute >= 60) {
                newMinute -= 60;
                newHour += 1;
            }
            if (newHour > 12) newHour -= 12;

            let timeAdd = '';
            if (addHours > 0 && addMinutes > 0) {
                timeAdd = `${addHours} hour${addHours > 1 ? 's' : ''} and ${addMinutes} minutes`;
            } else if (addHours > 0) {
                timeAdd = `${addHours} hour${addHours > 1 ? 's' : ''}`;
            } else {
                timeAdd = `${addMinutes} minutes`;
            }

            text = `What time is ${timeAdd} after this time?`;
            answer = `${newHour}:${String(newMinute).padStart(2, '0')}`;
            options = this.generateTimeOptions(newHour, newMinute, 'five');
        } else {
            // Time subtraction / "how much time between"
            hour = this.random(3, 12);
            minute = this.random(0, 3) * 15;
            const subHours = this.random(1, 2);
            const subMinutes = [0, 15, 30][this.random(0, 2)];
            let newHour = hour - subHours;
            let newMinute = minute - subMinutes;
            if (newMinute < 0) {
                newMinute += 60;
                newHour -= 1;
            }
            if (newHour <= 0) newHour += 12;

            let timeSub = '';
            if (subHours > 0 && subMinutes > 0) {
                timeSub = `${subHours} hour${subHours > 1 ? 's' : ''} and ${subMinutes} minutes`;
            } else if (subHours > 0) {
                timeSub = `${subHours} hour${subHours > 1 ? 's' : ''}`;
            } else {
                timeSub = `${subMinutes} minutes`;
            }

            text = `What time is ${timeSub} before this time?`;
            answer = `${newHour}:${String(newMinute).padStart(2, '0')}`;
            options = this.generateTimeOptions(newHour, newMinute, 'five');
        }

        return {
            text: text,
            answer: answer,
            options: options,
            visual: { type: 'clock', hour: hour, minute: minute },
            operation: 'clock',
            operands: [hour, minute]
        };
    }

    static generateTimeOptions(hour, minute, precision) {
        const correct = `${hour}:${String(minute).padStart(2, '0')}`;
        const options = [correct];

        while (options.length < 4) {
            let fakeHour, fakeMinute;
            if (precision === 'hour') {
                fakeHour = this.random(1, 12);
                fakeMinute = 0;
            } else if (precision === 'half') {
                fakeHour = this.random(1, 12);
                fakeMinute = [0, 30][this.random(0, 1)];
            } else if (precision === 'quarter') {
                fakeHour = this.random(1, 12);
                fakeMinute = [0, 15, 30, 45][this.random(0, 3)];
            } else {
                fakeHour = this.random(1, 12);
                fakeMinute = this.random(0, 11) * 5;
            }
            const fake = `${fakeHour}:${String(fakeMinute).padStart(2, '0')}`;
            if (!options.includes(fake)) {
                options.push(fake);
            }
        }

        return options.sort(() => Math.random() - 0.5);
    }

    static generateMoney(level) {
        let coins, answer, text, answerText;

        // Coin values: penny=1, nickel=5, dime=10, quarter=25
        if (level <= 1) {
            // Mix of pennies and nickels
            const type = Math.random();
            if (type < 0.4) {
                const count = this.random(3, 9);
                coins = Array(count).fill('penny');
                answer = count;
            } else {
                const nickels = this.random(1, 3);
                const pennies = this.random(1, 4);
                coins = Array(nickels).fill('nickel').concat(Array(pennies).fill('penny'));
                answer = nickels * 5 + pennies;
            }
            text = 'How many cents?';
        } else if (level <= 3) {
            // Dimes, nickels, and pennies
            const dimes = this.random(1, 3);
            const nickels = this.random(0, 2);
            const pennies = this.random(0, 4);
            coins = Array(dimes).fill('dime')
                .concat(Array(nickels).fill('nickel'))
                .concat(Array(pennies).fill('penny'));
            answer = dimes * 10 + nickels * 5 + pennies;
            text = 'How many cents?';
        } else if (level <= 5) {
            // All coins including quarters
            const quarters = this.random(1, 3);
            const dimes = this.random(0, 3);
            const nickels = this.random(0, 2);
            const pennies = this.random(0, 4);
            coins = Array(quarters).fill('quarter')
                .concat(Array(dimes).fill('dime'))
                .concat(Array(nickels).fill('nickel'))
                .concat(Array(pennies).fill('penny'));
            answer = quarters * 25 + dimes * 10 + nickels * 5 + pennies;
            text = 'How many cents in total?';
        } else if (level <= 7) {
            // Dollar amounts: coins that add up to $1+
            const dollars = this.random(1, 2);
            const quarters = this.random(0, 3);
            const dimes = this.random(0, 3);
            const nickels = this.random(0, 2);
            const pennies = this.random(0, 4);
            coins = Array(dollars).fill('dollar')
                .concat(Array(quarters).fill('quarter'))
                .concat(Array(dimes).fill('dime'))
                .concat(Array(nickels).fill('nickel'))
                .concat(Array(pennies).fill('penny'));
            const totalCents = dollars * 100 + quarters * 25 + dimes * 10 + nickels * 5 + pennies;
            const dollarPart = Math.floor(totalCents / 100);
            const centPart = totalCents % 100;
            answer = totalCents;
            answerText = `$${dollarPart}.${String(centPart).padStart(2, '0')}`;
            text = 'How much money is this?';

            return {
                text: text,
                answer: answerText,
                options: this.generateDollarOptions(dollarPart, centPart),
                visual: { type: 'money', coins: coins },
                operation: 'money',
                operands: coins
            };
        } else if (level <= 9) {
            // Making change from $1 or $2
            const quarters = this.random(1, 3);
            const dimes = this.random(0, 3);
            const nickels = this.random(0, 2);
            const pennies = this.random(0, 4);
            coins = Array(quarters).fill('quarter')
                .concat(Array(dimes).fill('dime'))
                .concat(Array(nickels).fill('nickel'))
                .concat(Array(pennies).fill('penny'));
            const total = quarters * 25 + dimes * 10 + nickels * 5 + pennies;
            const payAmount = total < 100 ? 100 : 200;
            answer = payAmount - total;
            text = `You pay $${payAmount / 100}. How many cents change?`;
        } else {
            // Making change with dollar amounts
            const dollars = this.random(1, 2);
            const quarters = this.random(1, 3);
            const dimes = this.random(0, 2);
            const pennies = this.random(0, 4);
            coins = Array(dollars).fill('dollar')
                .concat(Array(quarters).fill('quarter'))
                .concat(Array(dimes).fill('dime'))
                .concat(Array(pennies).fill('penny'));
            const totalCents = dollars * 100 + quarters * 25 + dimes * 10 + pennies;
            const payDollars = Math.ceil(totalCents / 100) + 1;
            answer = payDollars * 100 - totalCents;
            text = `You pay $${payDollars}. How many cents change?`;
        }

        return {
            text: text,
            answer: answer,
            options: this.generateOptions(answer, 4),
            visual: { type: 'money', coins: coins },
            operation: 'money',
            operands: coins
        };
    }

    static generateDollarOptions(dollarPart, centPart) {
        const correct = `$${dollarPart}.${String(centPart).padStart(2, '0')}`;
        const options = [correct];

        while (options.length < 4) {
            const fakeDollar = dollarPart + this.random(-1, 1);
            const fakeCent = Math.max(0, Math.min(99, centPart + this.random(-20, 20)));
            const fake = `$${Math.max(0, fakeDollar)}.${String(fakeCent).padStart(2, '0')}`;
            if (!options.includes(fake) && fakeDollar >= 0) {
                options.push(fake);
            }
        }

        return options.sort(() => Math.random() - 0.5);
    }

    static generateOptions(answer, count) {
        const options = [answer];

        while (options.length < count) {
            let option;
            if (typeof answer === 'string') {
                // For text answers, use predefined options
                return ['Odd', 'Even'];
            } else {
                // Scale distractor range with answer size
                const range = Math.max(5, Math.ceil(Math.abs(answer) * 0.2));
                option = answer + this.random(-range, range);
                if (option > 0 && option !== answer && !options.includes(option)) {
                    options.push(option);
                }
            }
        }

        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
    }

    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// ===========================
// UI Manager
// ===========================

class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.confettiCanvas = document.getElementById('confetti-canvas');
        this.confettiCtx = this.confettiCanvas.getContext('2d');
        this.confettiParticles = [];
        this.isAnimatingConfetti = false;
        this.setupCanvas();
        this.attachEventListeners();
    }

    setupCanvas() {
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            this.confettiCanvas.width = window.innerWidth;
            this.confettiCanvas.height = window.innerHeight;
        });
    }

    attachEventListeners() {
        console.log('Attaching event listeners...');

        // Home screen
        const startBtn = document.getElementById('start-learning-btn');

        startBtn.addEventListener('click', () => {
            this.showScreen('topic-screen');
            this.renderTopics();
        });

        document.getElementById('start-games-btn').addEventListener('click', () => {
            this.showScreen('game-select-screen');
        });

        // Game selection screen
        document.getElementById('game-select-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        document.getElementById('maze-mode-btn').addEventListener('click', () => {
            this.showScreen('maze-screen');
            this.initMaze();
        });

        document.getElementById('builder-mode-btn').addEventListener('click', () => {
            this.showScreen('builder-screen');
            this.initBuilder();
        });

        document.getElementById('view-progress-btn').addEventListener('click', () => {
            this.showScreen('progress-screen');
            this.renderProgress();
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showScreen('settings-screen');
            this.renderSettings();
        });

        // Maze buttons
        document.getElementById('maze-back-btn').addEventListener('click', () => {
            this.showScreen('game-select-screen');
        });

        document.getElementById('maze-new-btn').addEventListener('click', () => {
            this.initMaze();
        });

        // Builder buttons
        document.getElementById('builder-back-btn').addEventListener('click', () => {
            this.showScreen('game-select-screen');
        });

        document.getElementById('builder-undo-btn').addEventListener('click', () => {
            this.builderUndo();
        });

        document.getElementById('builder-reset-btn').addEventListener('click', () => {
            this.builderReset();
        });

        document.getElementById('builder-new-btn').addEventListener('click', () => {
            this.initBuilder();
        });

        // Treasure Hunt buttons
        document.getElementById('treasure-mode-btn').addEventListener('click', () => {
            this.showScreen('treasure-screen');
            this.initTreasure();
        });

        document.getElementById('treasure-back-btn').addEventListener('click', () => {
            this.showScreen('game-select-screen');
        });

        document.getElementById('treasure-new-btn').addEventListener('click', () => {
            this.initTreasure();
        });

        // Equation Balance buttons
        document.getElementById('balance-mode-btn').addEventListener('click', () => {
            this.showScreen('balance-screen');
            this.initBalance();
        });

        document.getElementById('balance-back-btn').addEventListener('click', () => {
            this.showScreen('game-select-screen');
        });

        document.getElementById('balance-reset-btn').addEventListener('click', () => {
            this.resetBalancePuzzle();
        });

        document.getElementById('balance-skip-btn').addEventListener('click', () => {
            this.initBalance();
        });

        // Back buttons
        document.getElementById('topic-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        document.getElementById('level-back-btn').addEventListener('click', () => {
            this.showScreen('topic-screen');
        });

        document.getElementById('practice-back-btn').addEventListener('click', () => {
            this.showScreen('level-screen');
        });

        document.getElementById('progress-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        document.getElementById('settings-back-btn').addEventListener('click', () => {
            this.showScreen('home-screen');
        });

        // Settings
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.gameState.settings.sound = e.target.checked;
            this.gameState.saveProgress();
        });

        document.getElementById('music-toggle').addEventListener('change', (e) => {
            this.gameState.settings.music = e.target.checked;
            this.gameState.saveProgress();
        });

        document.getElementById('animations-toggle').addEventListener('change', (e) => {
            this.gameState.settings.animations = e.target.checked;
            this.gameState.saveProgress();
        });

        document.getElementById('high-contrast-toggle').addEventListener('change', (e) => {
            this.gameState.settings.highContrast = e.target.checked;
            document.body.classList.toggle('high-contrast', e.target.checked);
            this.gameState.saveProgress();
        });

        document.getElementById('reduce-motion-toggle').addEventListener('change', (e) => {
            this.gameState.settings.reduceMotion = e.target.checked;
            document.body.classList.toggle('reduce-motion', e.target.checked);
            this.gameState.saveProgress();
        });

        document.getElementById('reset-progress-btn').addEventListener('click', () => {
            this.showModal(
                'Reset Progress',
                'Are you sure you want to reset all your progress? This cannot be undone!',
                () => {
                    this.gameState.resetProgress();
                    this.updateHomeScreen();
                    this.showScreen('home-screen');
                }
            );
        });

        // Results screen
        document.getElementById('continue-btn').addEventListener('click', () => {
            this.showScreen('level-screen');
            this.renderLevels(this.gameState.currentTopic);
        });

        document.getElementById('retry-btn').addEventListener('click', () => {
            this.startPractice(this.gameState.currentTopic, this.gameState.currentLevel);
        });

        document.getElementById('results-back-btn').addEventListener('click', () => {
            this.showScreen('topic-screen');
        });
    }

    showScreen(screenId) {
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.remove('active');
        });

        const targetScreen = document.getElementById(screenId);
        targetScreen.classList.add('active');

        // Always scroll to top when switching screens
        window.scrollTo(0, 0);

        this.gameState.currentScreen = screenId;

        if (screenId === 'home-screen') {
            this.updateHomeScreen();
        }
    }

    updateHomeScreen() {
        document.getElementById('player-level').textContent =
            Math.floor(this.gameState.progress.totalStars / 10) + 1;
        document.getElementById('total-stars').textContent =
            this.gameState.progress.totalStars;
        document.getElementById('streak-days').textContent =
            this.gameState.progress.streak;

        // Update avatar
        const avatar = document.getElementById('home-avatar');
        avatar.style.setProperty('--avatar-emoji', `'${this.gameState.settings.avatar}'`);
    }

    renderTopics() {
        const grid = document.getElementById('topic-grid');
        grid.innerHTML = '';

        for (const topic of Object.values(TOPICS)) {
            const card = document.createElement('div');
            card.className = 'topic-card';

            const isUnlocked = this.gameState.isTopicUnlocked(topic.id);
            if (!isUnlocked) {
                card.classList.add('locked');
            }

            const topicProgress = this.gameState.getTopicProgress(topic.id);
            const progress = (topicProgress.levelsCompleted.length / topic.levels) * 100;

            card.innerHTML = `
                <span class="topic-icon">${topic.icon}</span>
                <div class="topic-name">${topic.name}</div>
                <div class="topic-description">${topic.description}</div>
                <div class="topic-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="topic-stars">
                    ${this.renderStars(topicProgress.totalStars)}
                </div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    this.gameState.currentTopic = topic.id;
                    this.showScreen('level-screen');
                    this.renderLevels(topic.id);
                });
            }

            grid.appendChild(card);
        }
    }

    renderLevels(topicId) {
        const topic = TOPICS[topicId];
        const grid = document.getElementById('level-grid');
        const title = document.getElementById('level-screen-title');

        title.textContent = topic.name;
        grid.innerHTML = '';

        const topicProgress = this.gameState.getTopicProgress(topicId);

        for (let level = 1; level <= topic.levels; level++) {
            const card = document.createElement('div');
            card.className = 'level-card';

            const isUnlocked = this.gameState.isLevelUnlocked(topicId, level);
            if (!isUnlocked) {
                card.classList.add('locked');
            }

            const stars = topicProgress.stars[level] || 0;

            card.innerHTML = `
                <div class="level-number">${level}</div>
                <div class="level-stars">
                    ${this.renderStars(stars)}
                </div>
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    this.gameState.currentLevel = level;
                    // Go directly to practice mode (quiz)
                    this.startPractice(topicId, level);
                });
            }

            grid.appendChild(card);
        }
    }

    renderStars(count) {
        let html = '';
        for (let i = 0; i < 3; i++) {
            html += `<span class="star${i < count ? ' earned' : ''}">★</span>`;
        }
        return html;
    }

    startPractice(topicId, level) {
        console.log('Starting practice:', topicId, 'level', level);

        const topic = TOPICS[topicId];
        this.gameState.currentTopic = topicId;
        this.gameState.currentLevel = level;
        this.gameState.currentQuestionIndex = 0;
        this.gameState.correctAnswers = 0;
        this.gameState.questionResults = [];
        this.gameState.questions = QuestionGenerator.generate(topicId, level, 10);
        this.gameState.totalQuestions = this.gameState.questions.length;

        // Reset flags
        this.answerSubmitted = false;
        this.questionAdvanced = false;

        console.log('Generated', this.gameState.totalQuestions, 'questions');

        this.showScreen('practice-screen');
        this.renderPracticeQuestion();
    }

    renderPracticeQuestion() {
        console.log('Rendering practice question:', this.gameState.currentQuestionIndex + 1);

        // Reset flags
        this.answerSubmitted = false;
        this.questionAdvanced = false;

        // Clear any auto-advance timeout
        if (this.autoAdvanceTimeout) {
            clearTimeout(this.autoAdvanceTimeout);
        }

        const question = this.gameState.questions[this.gameState.currentQuestionIndex];

        document.getElementById('practice-topic-name').textContent =
            TOPICS[this.gameState.currentTopic].name;
        document.getElementById('practice-level-name').textContent =
            `Level ${this.gameState.currentLevel}`;
        document.getElementById('current-question-num').textContent =
            this.gameState.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent =
            this.gameState.totalQuestions;

        document.getElementById('question-text').textContent = question.text;

        // Setup read question button
        const readBtn = document.getElementById('read-question-btn');
        if (readBtn) {
            // Remove old listener
            const newReadBtn = readBtn.cloneNode(true);
            readBtn.parentNode.replaceChild(newReadBtn, readBtn);

            newReadBtn.addEventListener('click', () => {
                this.speakQuestion(question);
            });
        }

        // Render visual
        this.renderQuestionVisual(question);

        // Render answers
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';

        question.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.checkAnswer(option, question.answer, btn));
            answersContainer.appendChild(btn);
        });

        // Hide feedback
        document.getElementById('feedback-box').style.display = 'none';

        // Auto-read question on first load if sound is enabled
        if (this.gameState.settings.sound && this.gameState.currentQuestionIndex === 0) {
            setTimeout(() => {
                this.speakQuestion(question);
            }, 500);
        }
    }

    speakQuestion(question) {
        if (!this.gameState.settings.sound) return;

        // Use Web Speech API if available
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech

            const utterance = new SpeechSynthesisUtterance();

            // Create a child-friendly spoken version
            let spokenText = '';

            if (question.operation === 'addition') {
                spokenText = `${question.operands[0]} plus ${question.operands[1]} equals what?`;
            } else if (question.operation === 'subtraction') {
                spokenText = `${question.operands[0]} minus ${question.operands[1]} equals what?`;
            } else if (question.operation === 'multiplication') {
                spokenText = `${question.operands[0]} times ${question.operands[1]} equals what?`;
            } else if (question.operation === 'division') {
                spokenText = `${question.operands[0]} divided by ${question.operands[1]} equals what?`;
            } else if (question.operation === 'oddEven') {
                spokenText = question.text;
            } else if (question.operation === 'pattern') {
                spokenText = `What comes next in the pattern?`;
            } else if (question.operation === 'counting') {
                spokenText = `How many stars are there?`;
            } else if (question.operation === 'comparing') {
                spokenText = `Is ${question.operands[0]} greater than, less than, or equal to ${question.operands[1]}?`;
            } else {
                spokenText = question.text;
            }

            utterance.text = spokenText;
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1.1; // Slightly higher pitch for friendliness
            utterance.volume = 0.8;

            window.speechSynthesis.speak(utterance);
        } else {
            // Fallback to sound effect
            this.playSound('correct');
        }
    }

    renderQuestionVisual(question) {
        const visual = document.getElementById('question-visual');
        visual.innerHTML = '';
        visual.style.fontSize = '40px';
        visual.style.minHeight = '150px';
        visual.style.display = 'flex';
        visual.style.alignItems = 'center';
        visual.style.justifyContent = 'center';

        if (question.visual.type === 'blocks') {
            // Only show blocks if all values are <= 10
            const allSmall = question.visual.values.every(v => v <= 10);
            if (allSmall) {
                question.visual.values.forEach((value, index) => {
                    const miniBlock = this.createMiniBlock(value);
                    visual.appendChild(miniBlock);

                    // Add operation symbol between blocks
                    if (index < question.visual.values.length - 1) {
                        const symbol = document.createElement('span');
                        symbol.style.fontSize = '48px';
                        symbol.style.margin = '0 20px';
                        symbol.style.fontWeight = 'bold';

                        if (question.operation === 'addition') {
                            symbol.textContent = '➕';
                            symbol.style.color = '#667eea';
                        } else if (question.operation === 'subtraction') {
                            symbol.textContent = '➖';
                            symbol.style.color = '#f5576c';
                        }

                        visual.appendChild(symbol);
                    }
                });
            } else {
                visual.style.display = 'none';
            }
        } else if (question.visual.type === 'groups') {
            // No visuals for multiplication
            visual.style.display = 'none';
        } else if (question.visual.type === 'compare') {
            // Show two numbers side by side with visual blocks
            const [num1, num2] = question.visual.values;

            const block1 = this.createMiniBlock(num1);
            block1.style.margin = '0 30px';
            visual.appendChild(block1);

            const vs = document.createElement('div');
            vs.textContent = '?';
            vs.style.fontSize = '64px';
            vs.style.fontWeight = 'bold';
            vs.style.color = '#4dabf7';
            visual.appendChild(vs);

            const block2 = this.createMiniBlock(num2);
            block2.style.margin = '0 30px';
            visual.appendChild(block2);
        } else if (question.visual.type === 'pattern') {
            const sequence = question.visual.values;

            sequence.forEach((num, index) => {
                const numBox = document.createElement('div');
                numBox.style.display = 'inline-block';
                numBox.style.width = '80px';
                numBox.style.height = '80px';
                numBox.style.lineHeight = '80px';
                numBox.style.textAlign = 'center';
                numBox.style.fontSize = '48px';
                numBox.style.fontWeight = 'bold';
                numBox.style.margin = '10px';
                numBox.style.borderRadius = '15px';
                numBox.style.backgroundColor = '#9775fa';
                numBox.style.color = 'white';
                numBox.style.boxShadow = '0 5px 15px rgba(151, 117, 250, 0.3)';
                numBox.textContent = num;
                visual.appendChild(numBox);

                if (index < sequence.length - 1) {
                    const arrow = document.createElement('span');
                    arrow.textContent = '→';
                    arrow.style.fontSize = '36px';
                    arrow.style.margin = '0 5px';
                    arrow.style.color = '#9775fa';
                    visual.appendChild(arrow);
                }
            });

            // Add the question mark box
            const questionBox = document.createElement('div');
            questionBox.style.display = 'inline-block';
            questionBox.style.width = '80px';
            questionBox.style.height = '80px';
            questionBox.style.lineHeight = '80px';
            questionBox.style.textAlign = 'center';
            questionBox.style.fontSize = '64px';
            questionBox.style.margin = '10px';
            questionBox.style.borderRadius = '15px';
            questionBox.style.border = '4px dashed #9775fa';
            questionBox.style.backgroundColor = 'rgba(151, 117, 250, 0.1)';
            questionBox.textContent = '?';
            visual.appendChild(questionBox);
        } else if (question.visual.type === 'clock') {
            const { hour, minute } = question.visual;
            const svg = this.createClockSVG(hour, minute);
            visual.innerHTML = svg;
        } else if (question.visual.type === 'money') {
            const { coins } = question.visual;
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.flexWrap = 'wrap';
            container.style.gap = '10px';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';

            coins.forEach(coin => {
                const coinEl = document.createElement('div');
                coinEl.innerHTML = this.createCoinSVG(coin);
                container.appendChild(coinEl);
            });

            visual.appendChild(container);
        }
    }

    createClockSVG(hour, minute) {
        const size = 200;
        const cx = size / 2;
        const cy = size / 2;
        const radius = 85;

        // Calculate hand angles
        const minuteAngle = (minute / 60) * 360 - 90;
        const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30 - 90;

        const minuteX = cx + 65 * Math.cos(minuteAngle * Math.PI / 180);
        const minuteY = cy + 65 * Math.sin(minuteAngle * Math.PI / 180);
        const hourX = cx + 45 * Math.cos(hourAngle * Math.PI / 180);
        const hourY = cy + 45 * Math.sin(hourAngle * Math.PI / 180);

        let numbers = '';
        for (let i = 1; i <= 12; i++) {
            const angle = (i / 12) * 360 - 90;
            const nx = cx + 70 * Math.cos(angle * Math.PI / 180);
            const ny = cy + 70 * Math.sin(angle * Math.PI / 180);
            numbers += `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="bold" fill="#333">${i}</text>`;
        }

        let ticks = '';
        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * 360 - 90;
            const isMajor = i % 5 === 0;
            const innerR = isMajor ? 78 : 82;
            const outerR = 85;
            const x1 = cx + innerR * Math.cos(angle * Math.PI / 180);
            const y1 = cy + innerR * Math.sin(angle * Math.PI / 180);
            const x2 = cx + outerR * Math.cos(angle * Math.PI / 180);
            const y2 = cy + outerR * Math.sin(angle * Math.PI / 180);
            ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isMajor ? '#333' : '#999'}" stroke-width="${isMajor ? 2 : 1}"/>`;
        }

        return `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <!-- Clock face -->
                <circle cx="${cx}" cy="${cy}" r="${radius}" fill="white" stroke="#333" stroke-width="3"/>
                ${ticks}
                ${numbers}
                <!-- Hour hand -->
                <line x1="${cx}" y1="${cy}" x2="${hourX}" y2="${hourY}" stroke="#333" stroke-width="4" stroke-linecap="round"/>
                <!-- Minute hand -->
                <line x1="${cx}" y1="${cy}" x2="${minuteX}" y2="${minuteY}" stroke="#667eea" stroke-width="3" stroke-linecap="round"/>
                <!-- Center dot -->
                <circle cx="${cx}" cy="${cy}" r="4" fill="#333"/>
            </svg>
        `;
    }

    createCoinSVG(coinType) {
        const configs = {
            penny: { size: 38, color: '#b87333', border: '#8b5a2b', text: '1¢', label: '' },
            nickel: { size: 42, color: '#a8a8a8', border: '#777', text: '5¢', label: '' },
            dime: { size: 34, color: '#c0c0c0', border: '#888', text: '10¢', label: '' },
            quarter: { size: 48, color: '#d4d4d4', border: '#999', text: '25¢', label: '' },
            dollar: { size: 54, color: '#daa520', border: '#b8860b', text: '$1', label: '' }
        };

        const c = configs[coinType];
        const cx = c.size / 2;
        const cy = c.size / 2;
        const r = c.size / 2 - 2;

        return `
            <svg width="${c.size}" height="${c.size}" viewBox="0 0 ${c.size} ${c.size}">
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="${c.color}" stroke="${c.border}" stroke-width="2"/>
                <circle cx="${cx}" cy="${cy}" r="${r - 4}" fill="none" stroke="${c.border}" stroke-width="0.5" opacity="0.5"/>
                <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="${c.size * 0.3}" font-weight="bold" fill="#fff" stroke="#0003" stroke-width="0.5">${c.text}</text>
            </svg>
        `;
    }

    createMiniBlock(number) {
        const block = document.createElement('div');
        block.style.display = 'inline-block';
        block.style.margin = '10px';
        block.style.position = 'relative';

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column-reverse';
        container.style.alignItems = 'center';
        container.style.filter = 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.2))';

        const displayNum = Math.min(number, 10);

        for (let i = 0; i < displayNum; i++) {
            const segment = document.createElement('div');
            segment.style.width = '50px';
            segment.style.height = '50px';
            segment.style.border = '3px solid rgba(0, 0, 0, 0.2)';
            segment.style.borderRadius = '8px';
            segment.style.margin = '2px 0';
            segment.className = `block-color-${number}`;
            segment.style.display = 'flex';
            segment.style.alignItems = 'center';
            segment.style.justifyContent = 'center';
            segment.style.fontSize = '20px';
            segment.style.fontWeight = 'bold';
            segment.style.color = 'rgba(255, 255, 255, 0.9)';
            segment.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.3)';

            // Show number on top segment only
            if (i === displayNum - 1) {
                segment.textContent = number;
                segment.style.fontSize = '28px';
            }

            container.appendChild(segment);
        }

        if (number > 10) {
            const badge = document.createElement('div');
            badge.textContent = `×${number}`;
            badge.style.position = 'absolute';
            badge.style.top = '-10px';
            badge.style.right = '-10px';
            badge.style.background = '#ffd700';
            badge.style.color = '#333';
            badge.style.padding = '5px 10px';
            badge.style.borderRadius = '20px';
            badge.style.fontSize = '18px';
            badge.style.fontWeight = 'bold';
            badge.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
            badge.style.border = '2px solid white';
            block.appendChild(badge);
        }

        block.appendChild(container);
        return block;
    }

    checkAnswer(selected, correct, button) {
        // Prevent multiple clicks
        if (this.answerSubmitted) {
            console.log('Answer already submitted, ignoring click');
            return;
        }
        this.answerSubmitted = true;

        console.log('Checking answer:', selected, 'vs', correct);

        const isCorrect = selected === correct;
        const currentQuestion = this.gameState.questions[this.gameState.currentQuestionIndex];

        // Track result
        this.gameState.questionResults.push({
            question: currentQuestion.text,
            correct: isCorrect,
            userAnswer: selected,
            correctAnswer: correct
        });

        if (isCorrect) {
            button.classList.add('correct');
            this.gameState.correctAnswers++;

            // More varied encouragement messages
            const encouragements = [
                'Awesome! 🎉',
                'Perfect! ⭐',
                'You got it! 🌟',
                'Excellent work! 👏',
                'Super job! 🎊',
                'Brilliant! ✨',
                'Fantastic! 🏆',
                'Amazing! 💫'
            ];
            const message = encouragements[Math.floor(Math.random() * encouragements.length)];

            this.showFeedback(message, true);
            this.playSound('correct');

            // Mini confetti for correct answer
            if (this.gameState.settings.animations) {
                this.launchMiniConfetti();
            }
        } else {
            button.classList.add('incorrect');

            // Gentler, more encouraging incorrect messages
            const encouragements = [
                `Nice try! The answer is ${correct}`,
                `Almost! It's actually ${correct}`,
                `Good effort! The answer is ${correct}`,
                `Keep going! The answer is ${correct}`,
                `Not quite, but you're learning! It's ${correct}`
            ];
            const message = encouragements[Math.floor(Math.random() * encouragements.length)];

            this.showFeedback(message, false);
            this.playSound('incorrect');
        }

        // Disable all answer buttons immediately
        const allButtons = document.querySelectorAll('.answer-btn');
        console.log('Disabling', allButtons.length, 'buttons');
        allButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.6';
        });

        // Function to move to next question
        const moveToNext = () => {
            if (this.questionAdvanced) {
                console.log('Already advanced, ignoring');
                return;
            }
            this.questionAdvanced = true;

            console.log('Moving to next question');
            this.gameState.currentQuestionIndex++;
            if (this.gameState.currentQuestionIndex < this.gameState.totalQuestions) {
                console.log('Rendering next question:', this.gameState.currentQuestionIndex + 1);
                this.renderPracticeQuestion();
            } else {
                console.log('All questions completed, showing results');
                this.showResults();
            }
        };

        // Store the moveToNext function so feedback box can call it
        this.currentMoveToNext = moveToNext;

        // Make feedback box clickable to advance immediately
        setTimeout(() => {
            const feedbackBox = document.getElementById('feedback-box');
            if (feedbackBox) {
                console.log('Setting up feedback box click handler');
                feedbackBox.style.cursor = 'pointer';

                // Remove old listener by cloning
                const newFeedbackBox = feedbackBox.cloneNode(true);
                feedbackBox.parentNode.replaceChild(newFeedbackBox, feedbackBox);

                newFeedbackBox.addEventListener('click', () => {
                    console.log('Feedback box clicked!');
                    moveToNext();
                });
            } else {
                console.error('Feedback box not found!');
            }
        }, 100);

        // Also auto-advance after delay (in case they don't click)
        console.log('Setting timeout to auto-advance after 5 seconds...');
        this.autoAdvanceTimeout = setTimeout(() => {
            console.log('Auto-advance timeout fired');
            moveToNext();
        }, 5000);
    }

    showFeedback(message, isCorrect) {
        const feedbackBox = document.getElementById('feedback-box');
        const feedbackMessage = document.getElementById('feedback-message');

        feedbackBox.className = 'feedback-box ' + (isCorrect ? 'correct' : 'incorrect');
        feedbackMessage.innerHTML = `
            ${message}
            <div style="margin-top: 15px; font-size: 18px; opacity: 0.9;">
                👆 Click here to continue
            </div>
        `;
        feedbackBox.style.display = 'block';
    }

    showResults() {
        this.showScreen('results-screen');

        const accuracy = this.gameState.correctAnswers / this.gameState.totalQuestions;
        let stars = 0;
        if (accuracy >= 0.9) stars = 3;
        else if (accuracy >= 0.7) stars = 2;
        else if (accuracy >= 0.5) stars = 1;

        // Update progress
        this.gameState.updateTopicProgress(
            this.gameState.currentTopic,
            this.gameState.currentLevel,
            stars,
            []
        );

        // Display results
        document.getElementById('correct-answers').textContent = this.gameState.correctAnswers;
        document.getElementById('total-answered').textContent = this.gameState.totalQuestions;
        document.getElementById('accuracy-percent').textContent = Math.round(accuracy * 100) + '%';

        // Update results title with encouraging message
        const resultsTitle = document.querySelector('.results-title');
        if (stars === 3) {
            resultsTitle.textContent = 'Perfect! Amazing Work! 🌟';
        } else if (stars === 2) {
            resultsTitle.textContent = 'Great Job! Well Done! ⭐';
        } else if (stars === 1) {
            resultsTitle.textContent = 'Good Try! Keep Practicing! 💫';
        } else {
            resultsTitle.textContent = 'Keep Learning! You Can Do It! 💪';
        }

        // Display stars with staggered animation
        const starsContainer = document.getElementById('stars-earned');
        const starElements = starsContainer.querySelectorAll('.star');
        starElements.forEach((star, index) => {
            star.classList.remove('earned');
            if (index < stars) {
                setTimeout(() => {
                    star.classList.add('earned');
                    if (this.gameState.settings.sound) {
                        this.playSound('star');
                    }
                }, (index + 1) * 400);
            }
        });

        // Check if next level unlocked
        const nextLevel = this.gameState.currentLevel + 1;
        const topicLevels = TOPICS[this.gameState.currentTopic].levels;

        if (nextLevel <= topicLevels && stars > 0) {
            setTimeout(() => {
                document.getElementById('unlocked-message').style.display = 'block';
                document.getElementById('unlock-text').textContent = `Level ${nextLevel} Unlocked! 🎉`;
            }, stars * 400 + 200);
        } else {
            document.getElementById('unlocked-message').style.display = 'none';
        }

        // Show confetti for good performance
        if (stars >= 2) {
            setTimeout(() => {
                this.launchConfetti();
            }, stars * 400 + 400);
        }

        this.playSound('complete');
    }

    renderProgress() {
        document.getElementById('progress-total-stars').textContent =
            this.gameState.progress.totalStars;

        const topicsCompleted = Object.values(this.gameState.progress.topics)
            .filter(t => t.levelsCompleted.length > 0).length;
        document.getElementById('progress-topics-completed').textContent = topicsCompleted;

        document.getElementById('progress-streak').textContent =
            this.gameState.progress.streak;

        // Render topic progress bars
        const progressTopics = document.getElementById('progress-topics');
        progressTopics.innerHTML = '<h3>Topic Progress</h3>';

        for (const topic of Object.values(TOPICS)) {
            const topicProgress = this.gameState.getTopicProgress(topic.id);
            const progress = (topicProgress.levelsCompleted.length / topic.levels) * 100;

            const item = document.createElement('div');
            item.className = 'topic-progress-item';
            item.innerHTML = `
                <div class="topic-progress-header">
                    <span class="topic-progress-name">${topic.icon} ${topic.name}</span>
                    <span class="topic-progress-percent">${Math.round(progress)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            `;
            progressTopics.appendChild(item);
        }

        // Render weak areas
        const weakAreas = this.gameState.getWeakAreas();
        const weakAreasList = document.getElementById('weak-areas-list');
        weakAreasList.innerHTML = '';

        if (weakAreas.length === 0) {
            weakAreasList.innerHTML = '<p>Great job! No weak areas detected. Keep practicing!</p>';
        } else {
            weakAreas.forEach(area => {
                const topic = TOPICS[area.topicId];
                const item = document.createElement('div');
                item.className = 'weak-area-item';
                item.innerHTML = `
                    <div>
                        <div class="weak-area-name">${topic.icon} ${topic.name}</div>
                        <div style="font-size: 14px; color: #666;">Accuracy: ${area.accuracy}%</div>
                    </div>
                    <button class="weak-area-action">Practice</button>
                `;

                item.querySelector('.weak-area-action').addEventListener('click', () => {
                    this.gameState.currentTopic = area.topicId;
                    this.showScreen('level-screen');
                    this.renderLevels(area.topicId);
                });

                weakAreasList.appendChild(item);
            });
        }

        // Render achievements
        this.renderAchievements();
    }

    renderAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        achievementsGrid.innerHTML = '';

        const achievements = [
            { icon: '🌟', name: 'First Star', earned: this.gameState.progress.totalStars >= 1 },
            { icon: '⭐', name: '10 Stars', earned: this.gameState.progress.totalStars >= 10 },
            { icon: '🌠', name: '50 Stars', earned: this.gameState.progress.totalStars >= 50 },
            { icon: '🔥', name: '3 Day Streak', earned: this.gameState.progress.streak >= 3 },
            { icon: '💯', name: 'Perfect Score', earned: this.hasAchievement('perfect') },
            { icon: '🎓', name: 'Master', earned: this.gameState.progress.totalStars >= 100 }
        ];

        achievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = 'achievement-badge' + (achievement.earned ? ' earned' : '');
            badge.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
            `;
            achievementsGrid.appendChild(badge);
        });
    }

    hasAchievement(type) {
        // Check if player has achieved a perfect score (3 stars) on any level
        for (const topicProgress of Object.values(this.gameState.progress.topics)) {
            for (const stars of Object.values(topicProgress.stars)) {
                if (stars === 3) return true;
            }
        }
        return false;
    }

    renderSettings() {
        // Update checkboxes
        document.getElementById('sound-toggle').checked = this.gameState.settings.sound;
        document.getElementById('music-toggle').checked = this.gameState.settings.music;
        document.getElementById('animations-toggle').checked = this.gameState.settings.animations;
        document.getElementById('high-contrast-toggle').checked = this.gameState.settings.highContrast;
        document.getElementById('reduce-motion-toggle').checked = this.gameState.settings.reduceMotion;

        // Render avatar selector
        const avatarSelector = document.getElementById('avatar-selector');
        avatarSelector.innerHTML = '';

        const avatars = ['😊', '😄', '🤓', '😎', '🥳', '🤩', '😺', '🐶', '🦁', '🐼', '🐸', '🦊'];

        avatars.forEach(emoji => {
            const option = document.createElement('div');
            option.className = 'avatar-option';
            if (emoji === this.gameState.settings.avatar) {
                option.classList.add('selected');
            }
            option.textContent = emoji;
            option.style.background = 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';

            option.addEventListener('click', () => {
                this.gameState.settings.avatar = emoji;
                this.gameState.saveProgress();
                document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });

            avatarSelector.appendChild(option);
        });
    }

    showModal(title, message, onConfirm) {
        const modal = document.getElementById('modal-overlay');
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;

        modal.classList.add('active');

        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');

        const confirm = () => {
            modal.classList.remove('active');
            if (onConfirm) onConfirm();
            cleanup();
        };

        const cancel = () => {
            modal.classList.remove('active');
            cleanup();
        };

        const cleanup = () => {
            confirmBtn.removeEventListener('click', confirm);
            cancelBtn.removeEventListener('click', cancel);
        };

        confirmBtn.addEventListener('click', confirm);
        cancelBtn.addEventListener('click', cancel);
    }

    // ===========================
    // Number Maze Game
    // ===========================

    initMaze() {
        this.mazeDifficulty = (this.mazeDifficulty || 0);
        this.mazeSteps = 0;
        this.mazeCompleted = false;

        document.getElementById('maze-level-badge').textContent = `Maze ${this.mazeDifficulty + 1}`;
        document.getElementById('maze-steps').textContent = 'Steps: 0';
        document.getElementById('maze-question-panel').style.display = 'none';
        document.getElementById('maze-feedback').style.display = 'none';

        this.generateMaze();
        this.renderMaze();
    }

    generateMaze() {
        // Grid size scales with difficulty
        const size = Math.min(5 + Math.floor(this.mazeDifficulty / 2), 8);
        this.mazeSize = size;

        // Generate a path from top-left to bottom-right using random walk
        this.mazePath = this.generateMazePath(size);
        this.mazeGrid = [];

        // Create grid with questions on path cells and walls elsewhere
        for (let r = 0; r < size; r++) {
            this.mazeGrid[r] = [];
            for (let c = 0; c < size; c++) {
                const isPath = this.mazePath.some(p => p.r === r && p.c === c);
                const isStart = r === 0 && c === 0;
                const isEnd = r === size - 1 && c === size - 1;

                if (isStart) {
                    this.mazeGrid[r][c] = { type: 'start', revealed: true };
                } else if (isEnd) {
                    this.mazeGrid[r][c] = { type: 'end', revealed: true };
                } else if (isPath) {
                    const level = Math.min(Math.floor(this.mazeDifficulty / 2) + 1, 5);
                    const question = this.generateMazeQuestion(level);
                    this.mazeGrid[r][c] = { type: 'path', revealed: false, question: question, solved: false };
                } else {
                    this.mazeGrid[r][c] = { type: 'wall', revealed: false };
                }
            }
        }

        // Player starts at top-left
        this.mazePlayerPos = { r: 0, c: 0 };
        this.revealAdjacentCells(0, 0);
    }

    generateMazePath(size) {
        // Generate a guaranteed path from (0,0) to (size-1, size-1)
        const path = [{ r: 0, c: 0 }];
        let r = 0, c = 0;

        while (r !== size - 1 || c !== size - 1) {
            const canDown = r < size - 1;
            const canRight = c < size - 1;

            if (canDown && canRight) {
                // Randomly go down or right, with slight bias toward needed direction
                if (Math.random() < 0.5) {
                    r++;
                } else {
                    c++;
                }
            } else if (canDown) {
                r++;
            } else {
                c++;
            }
            path.push({ r, c });
        }

        // Add some branches (dead ends) for variety
        const branches = Math.floor(size / 2) + this.mazeDifficulty;
        for (let i = 0; i < branches; i++) {
            const branchStart = path[Math.floor(Math.random() * (path.length - 1))];
            let br = branchStart.r;
            let bc = branchStart.c;
            const branchLength = this.random(1, 3);

            for (let j = 0; j < branchLength; j++) {
                const dirs = [];
                if (br > 0) dirs.push({ r: br - 1, c: bc });
                if (br < size - 1) dirs.push({ r: br + 1, c: bc });
                if (bc > 0) dirs.push({ r: br, c: bc - 1 });
                if (bc < size - 1) dirs.push({ r: br, c: bc + 1 });

                const validDirs = dirs.filter(d =>
                    !path.some(p => p.r === d.r && p.c === d.c)
                );

                if (validDirs.length === 0) break;

                const next = validDirs[Math.floor(Math.random() * validDirs.length)];
                path.push(next);
                br = next.r;
                bc = next.c;
            }
        }

        return path;
    }

    generateMazeQuestion(level) {
        // Pick a random topic from available ones
        const topics = ['addition', 'subtraction', 'multiplication'];
        const topic = topics[Math.floor(Math.random() * topics.length)];

        switch (topic) {
            case 'addition':
                return QuestionGenerator.generateAddition(level);
            case 'subtraction':
                return QuestionGenerator.generateSubtraction(level);
            case 'multiplication':
                return QuestionGenerator.generateMultiplication(level);
            default:
                return QuestionGenerator.generateAddition(level);
        }
    }

    renderMaze() {
        const grid = document.getElementById('maze-grid');
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${this.mazeSize}, 1fr)`;

        for (let r = 0; r < this.mazeSize; r++) {
            for (let c = 0; c < this.mazeSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                const data = this.mazeGrid[r][c];

                if (data.type === 'start') {
                    cell.classList.add('maze-start');
                    cell.textContent = '🏠';
                } else if (data.type === 'end') {
                    if (data.revealed) {
                        cell.classList.add('maze-end');
                        cell.textContent = '🏆';
                    } else {
                        cell.classList.add('maze-hidden');
                        cell.textContent = '?';
                    }
                } else if (data.type === 'wall') {
                    if (data.revealed) {
                        cell.classList.add('maze-wall');
                        cell.textContent = '🧱';
                    } else {
                        cell.classList.add('maze-hidden');
                        cell.textContent = '?';
                    }
                } else if (data.type === 'path') {
                    if (data.solved) {
                        cell.classList.add('maze-solved');
                        cell.textContent = '✓';
                    } else if (data.revealed) {
                        cell.classList.add('maze-path');
                        cell.textContent = '❓';
                        cell.addEventListener('click', () => this.onMazeCellClick(r, c));
                    } else {
                        cell.classList.add('maze-hidden');
                        cell.textContent = '?';
                    }
                }

                // Highlight player position
                if (this.mazePlayerPos.r === r && this.mazePlayerPos.c === c) {
                    cell.classList.add('maze-player');
                    if (data.type !== 'start') cell.textContent = '🧒';
                    else cell.textContent = '🧒';
                }

                grid.appendChild(cell);
            }
        }
    }

    revealAdjacentCells(r, c) {
        const dirs = [
            { r: r - 1, c }, { r: r + 1, c },
            { r, c: c - 1 }, { r, c: c + 1 }
        ];

        dirs.forEach(d => {
            if (d.r >= 0 && d.r < this.mazeSize && d.c >= 0 && d.c < this.mazeSize) {
                this.mazeGrid[d.r][d.c].revealed = true;
            }
        });
    }

    onMazeCellClick(r, c) {
        // Can only move to adjacent cells
        const pr = this.mazePlayerPos.r;
        const pc = this.mazePlayerPos.c;
        const isAdjacent = (Math.abs(r - pr) + Math.abs(c - pc)) === 1;

        if (!isAdjacent) return;

        const cell = this.mazeGrid[r][c];
        if (cell.type !== 'path' || cell.solved) return;

        // Show question
        this.currentMazeTarget = { r, c };
        this.showMazeQuestion(cell.question);
    }

    showMazeQuestion(question) {
        const panel = document.getElementById('maze-question-panel');
        const textEl = document.getElementById('maze-question-text');
        const answersEl = document.getElementById('maze-answers');
        const feedbackEl = document.getElementById('maze-feedback');

        panel.style.display = 'block';
        feedbackEl.style.display = 'none';
        textEl.textContent = question.text;
        answersEl.innerHTML = '';

        question.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'maze-answer-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.checkMazeAnswer(option, question.answer, btn));
            answersEl.appendChild(btn);
        });
    }

    checkMazeAnswer(selected, correct, button) {
        const feedbackEl = document.getElementById('maze-feedback');
        const answersEl = document.getElementById('maze-answers');
        const { r, c } = this.currentMazeTarget;

        // Disable all buttons
        answersEl.querySelectorAll('.maze-answer-btn').forEach(btn => {
            btn.disabled = true;
        });

        if (String(selected) === String(correct)) {
            button.classList.add('correct');
            feedbackEl.textContent = '✅ Correct! Move forward!';
            feedbackEl.className = 'maze-feedback correct';
            feedbackEl.style.display = 'block';
            this.playSound('correct');

            // Move player
            this.mazeGrid[r][c].solved = true;
            this.mazePlayerPos = { r, c };
            this.mazeSteps++;
            document.getElementById('maze-steps').textContent = `Steps: ${this.mazeSteps}`;

            this.revealAdjacentCells(r, c);

            setTimeout(() => {
                document.getElementById('maze-question-panel').style.display = 'none';

                // Check if reached end
                const endAdjacent = [
                    { r: r - 1, c }, { r: r + 1, c },
                    { r, c: c - 1 }, { r, c: c + 1 }
                ].some(d => d.r === this.mazeSize - 1 && d.c === this.mazeSize - 1);

                if (endAdjacent) {
                    this.mazeGrid[this.mazeSize - 1][this.mazeSize - 1].revealed = true;
                    this.mazePlayerPos = { r: this.mazeSize - 1, c: this.mazeSize - 1 };
                    this.mazeCompleted = true;
                    this.mazeDifficulty++;
                    this.renderMaze();
                    this.playSound('complete');
                    this.launchConfetti();

                    setTimeout(() => {
                        const feedbackEl = document.getElementById('maze-feedback');
                        feedbackEl.textContent = `🎉 Maze complete in ${this.mazeSteps} steps! Click "New Maze" for a harder one!`;
                        feedbackEl.className = 'maze-feedback correct';
                        feedbackEl.style.display = 'block';
                        document.getElementById('maze-question-panel').style.display = 'block';
                        document.getElementById('maze-question-text').textContent = '';
                        document.getElementById('maze-answers').innerHTML = '';
                    }, 500);
                } else {
                    this.renderMaze();
                }
            }, 800);
        } else {
            button.classList.add('incorrect');
            feedbackEl.textContent = `❌ That's not right. The answer was ${correct}. Try another path!`;
            feedbackEl.className = 'maze-feedback incorrect';
            feedbackEl.style.display = 'block';
            this.playSound('incorrect');

            // Mark cell as a wall (wrong answer = blocked path)
            this.mazeGrid[r][c].type = 'wall';

            setTimeout(() => {
                document.getElementById('maze-question-panel').style.display = 'none';
                this.renderMaze();
            }, 1500);
        }
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    launchConfetti() {
        if (!this.gameState.settings.animations) return;

        const particleCount = 150;

        for (let i = 0; i < particleCount; i++) {
            this.confettiParticles.push({
                x: Math.random() * this.confettiCanvas.width,
                y: -10,
                velocityX: (Math.random() - 0.5) * 6,
                velocityY: Math.random() * 4 + 3,
                color: this.randomColor(),
                size: Math.random() * 10 + 5,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 15,
                shape: Math.random() > 0.5 ? 'square' : 'circle'
            });
        }

        this.animateConfetti();
    }

    launchMiniConfetti() {
        if (!this.gameState.settings.animations) return;

        const particleCount = 30;
        const centerX = this.confettiCanvas.width / 2;

        for (let i = 0; i < particleCount; i++) {
            this.confettiParticles.push({
                x: centerX + (Math.random() - 0.5) * 200,
                y: this.confettiCanvas.height / 3,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: Math.random() * -5 - 2,
                color: this.randomColor(),
                size: Math.random() * 6 + 3,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 15,
                shape: 'circle'
            });
        }

        if (this.confettiParticles.length > 0 && !this.isAnimatingConfetti) {
            this.isAnimatingConfetti = true;
            this.animateConfetti();
        }
    }

    animateConfetti() {
        this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

        for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
            const p = this.confettiParticles[i];

            p.x += p.velocityX;
            p.y += p.velocityY;
            p.rotation += p.rotationSpeed;
            p.velocityY += 0.15; // Gravity
            p.velocityX *= 0.99; // Air resistance

            this.confettiCtx.save();
            this.confettiCtx.translate(p.x, p.y);
            this.confettiCtx.rotate(p.rotation * Math.PI / 180);
            this.confettiCtx.fillStyle = p.color;

            if (p.shape === 'circle') {
                this.confettiCtx.beginPath();
                this.confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.confettiCtx.fill();
            } else {
                this.confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }

            this.confettiCtx.restore();

            if (p.y > this.confettiCanvas.height + 50) {
                this.confettiParticles.splice(i, 1);
            }
        }

        if (this.confettiParticles.length > 0) {
            requestAnimationFrame(() => this.animateConfetti());
        } else {
            this.isAnimatingConfetti = false;
        }
    }

    randomColor() {
        const colors = ['#ff6b6b', '#ffa500', '#ffd700', '#51cf66', '#4dabf7', '#5c7cfa', '#9775fa', '#ff6ed7'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    playSound(type) {
        if (!this.gameState.settings.sound) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';

        // Start the oscillator first (required before stop can be called)
        oscillator.start(audioContext.currentTime);

        if (type === 'correct') {
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            oscillator.stop(audioContext.currentTime + 0.4);
        } else if (type === 'incorrect') {
            oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime); // G4
            oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.15); // E4
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'star') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime); // C6
            oscillator.frequency.exponentialRampToValueAtTime(2093.00, audioContext.currentTime + 0.2); // C7
            gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'complete') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3); // C6
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
            oscillator.stop(audioContext.currentTime + 0.6);
        } else if (type === 'click') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // High pitch click
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    }

    // ===========================
    // Number Builder Game
    // ===========================

    initBuilder() {
        this.builderLevel = this.builderLevel || 0;
        this.builderMoves = 0;
        this.builderHistory = [];
        this.builderSelected = []; // indices of selected tiles
        this.builderOp = null;

        const puzzle = this.generateBuilderPuzzle(this.builderLevel);
        this.builderTarget = puzzle.target;
        this.builderTiles = [...puzzle.numbers];
        this.builderOriginalTiles = [...puzzle.numbers];

        document.getElementById('builder-level-badge').textContent = `Level ${this.builderLevel + 1}`;
        document.getElementById('builder-moves').textContent = 'Moves: 0';
        document.getElementById('builder-target-number').textContent = this.builderTarget;
        document.getElementById('builder-feedback').style.display = 'none';
        document.getElementById('builder-expression').textContent = '';

        this.renderBuilderTiles();
        this.setupBuilderOps();
    }

    generateBuilderPuzzle(level) {
        // Generate a puzzle that is guaranteed solvable
        // Strategy: pick numbers and work backwards from target
        if (level < 3) {
            // Easy: 3 small numbers, target 5-15, only + needed
            const a = this.random(1, 5);
            const b = this.random(1, 5);
            const c = this.random(1, 5);
            const target = a + b + c;
            return { target, numbers: this.shuffle([a, b, c]) };
        } else if (level < 6) {
            // Medium: 4 numbers, target 10-30, + and -
            const a = this.random(2, 8);
            const b = this.random(2, 8);
            const c = this.random(1, 5);
            const sum = a + b;
            const target = sum - c;
            return { target, numbers: this.shuffle([a, b, c, this.random(1, 3)]) };
        } else if (level < 9) {
            // Harder: 4 numbers, multiplication involved
            const a = this.random(2, 6);
            const b = this.random(2, 5);
            const product = a * b;
            const c = this.random(1, 10);
            const target = product + c;
            return { target, numbers: this.shuffle([a, b, c, this.random(1, 5)]) };
        } else {
            // Hard: 5 numbers, larger target, all ops
            const a = this.random(3, 9);
            const b = this.random(2, 6);
            const c = this.random(2, 8);
            const product = a * b;
            const target = product + c;
            return { target, numbers: this.shuffle([a, b, c, this.random(1, 5), this.random(1, 4)]) };
        }
    }

    shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    renderBuilderTiles() {
        const container = document.getElementById('builder-tiles');
        container.innerHTML = '';

        this.builderTiles.forEach((num, idx) => {
            if (num === null) return; // consumed tile
            const tile = document.createElement('button');
            tile.className = 'builder-tile';
            tile.textContent = num;
            tile.dataset.index = idx;

            if (this.builderSelected.includes(idx)) {
                tile.classList.add('selected');
            }

            tile.addEventListener('click', () => this.selectBuilderTile(idx));
            container.appendChild(tile);
        });
    }

    setupBuilderOps() {
        const opBtns = document.querySelectorAll('.op-btn');
        opBtns.forEach(btn => {
            // Remove old listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => this.selectBuilderOp(newBtn.dataset.op));
        });
    }

    selectBuilderTile(idx) {
        if (this.builderSelected.length === 0) {
            this.builderSelected = [idx];
            this.updateBuilderExpression();
            this.renderBuilderTiles();
        } else if (this.builderSelected.length === 1) {
            if (this.builderSelected[0] === idx) {
                // Deselect
                this.builderSelected = [];
                this.builderOp = null;
                this.updateBuilderExpression();
                this.renderBuilderTiles();
            } else if (this.builderOp) {
                // We have first number, op, now second number — compute!
                this.builderSelected.push(idx);
                this.computeBuilder();
            } else {
                // Replace first selection
                this.builderSelected = [idx];
                this.updateBuilderExpression();
                this.renderBuilderTiles();
            }
        }
    }

    selectBuilderOp(op) {
        if (this.builderSelected.length === 1) {
            this.builderOp = op;
            this.updateBuilderExpression();
            // Highlight the active op button
            document.querySelectorAll('.op-btn').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.op === op);
            });
        }
    }

    updateBuilderExpression() {
        const expr = document.getElementById('builder-expression');
        if (this.builderSelected.length === 0) {
            expr.textContent = 'Pick a number';
        } else if (this.builderSelected.length === 1) {
            const num = this.builderTiles[this.builderSelected[0]];
            if (this.builderOp) {
                expr.textContent = `${num} ${this.builderOp} ?`;
            } else {
                expr.textContent = `${num} ▸ pick an operation`;
            }
        }
    }

    computeBuilder() {
        const idx1 = this.builderSelected[0];
        const idx2 = this.builderSelected[1];
        const a = this.builderTiles[idx1];
        const b = this.builderTiles[idx2];
        let result;

        switch (this.builderOp) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '×': result = a * b; break;
        }

        // Save state for undo
        this.builderHistory.push({
            tiles: [...this.builderTiles],
            moves: this.builderMoves
        });

        // Replace first tile with result, remove second
        this.builderTiles[idx1] = result;
        this.builderTiles[idx2] = null;
        this.builderMoves++;
        this.builderSelected = [];
        this.builderOp = null;

        document.getElementById('builder-moves').textContent = `Moves: ${this.builderMoves}`;
        document.getElementById('builder-expression').textContent = '';
        document.querySelectorAll('.op-btn').forEach(btn => btn.classList.remove('selected'));

        // Check win
        const remaining = this.builderTiles.filter(n => n !== null);
        if (remaining.includes(this.builderTarget)) {
            this.builderWin();
        } else if (remaining.length === 1) {
            // Only one left and it's not the target
            this.builderFail();
        } else {
            this.renderBuilderTiles();
        }
    }

    builderWin() {
        const feedback = document.getElementById('builder-feedback');
        feedback.style.display = 'block';
        feedback.className = 'builder-feedback success';
        feedback.textContent = `🎉 You built ${this.builderTarget}! Great job!`;
        this.playSound('success');

        // Auto advance after delay
        setTimeout(() => {
            this.builderLevel++;
            this.initBuilder();
        }, 2000);
    }

    builderFail() {
        const feedback = document.getElementById('builder-feedback');
        feedback.style.display = 'block';
        feedback.className = 'builder-feedback fail';
        feedback.textContent = `Not quite! Try undoing or resetting.`;
        this.renderBuilderTiles();
    }

    builderUndo() {
        if (this.builderHistory.length === 0) return;
        const prev = this.builderHistory.pop();
        this.builderTiles = prev.tiles;
        this.builderMoves = prev.moves;
        this.builderSelected = [];
        this.builderOp = null;

        document.getElementById('builder-moves').textContent = `Moves: ${this.builderMoves}`;
        document.getElementById('builder-expression').textContent = '';
        document.getElementById('builder-feedback').style.display = 'none';
        document.querySelectorAll('.op-btn').forEach(btn => btn.classList.remove('selected'));
        this.renderBuilderTiles();
    }

    builderReset() {
        this.builderTiles = [...this.builderOriginalTiles];
        this.builderHistory = [];
        this.builderMoves = 0;
        this.builderSelected = [];
        this.builderOp = null;

        document.getElementById('builder-moves').textContent = 'Moves: 0';
        document.getElementById('builder-expression').textContent = '';
        document.getElementById('builder-feedback').style.display = 'none';
        document.querySelectorAll('.op-btn').forEach(btn => btn.classList.remove('selected'));
        this.renderBuilderTiles();
    }

    // ===========================
    // Treasure Hunt Game
    // ===========================

    initTreasure() {
        this.treasureLevel = this.treasureLevel || 0;
        const config = this.getTreasureConfig(this.treasureLevel);

        this.treasureGrid = [];
        this.treasureSize = config.size;
        this.treasureCount = config.treasures;
        this.treasureDigs = config.digs;
        this.treasureFound = 0;
        this.treasureGameOver = false;
        this.treasureSelectedCell = null;

        // Build grid
        for (let r = 0; r < config.size; r++) {
            this.treasureGrid[r] = [];
            for (let c = 0; c < config.size; c++) {
                this.treasureGrid[r][c] = { hasTreasure: false, revealed: false, flagged: false };
            }
        }

        // Place treasures randomly
        let placed = 0;
        while (placed < config.treasures) {
            const r = Math.floor(Math.random() * config.size);
            const c = Math.floor(Math.random() * config.size);
            if (!this.treasureGrid[r][c].hasTreasure) {
                this.treasureGrid[r][c].hasTreasure = true;
                placed++;
            }
        }

        // Calculate adjacency hints
        for (let r = 0; r < config.size; r++) {
            for (let c = 0; c < config.size; c++) {
                this.treasureGrid[r][c].adjacent = this.countAdjacentTreasures(r, c);
            }
        }

        // Update UI
        document.getElementById('treasure-level-badge').textContent = `Level ${this.treasureLevel + 1}`;
        document.getElementById('treasure-found').textContent = `💎 0/${this.treasureCount}`;
        document.getElementById('treasure-digs').textContent = `⛏ ${this.treasureDigs} digs left`;
        document.getElementById('treasure-question-panel').style.display = 'none';
        document.getElementById('treasure-feedback').style.display = 'none';

        this.renderTreasureGrid();
    }

    getTreasureConfig(level) {
        if (level < 3) return { size: 4, treasures: 3, digs: 10, difficulty: 0 };
        if (level < 6) return { size: 5, treasures: 4, digs: 12, difficulty: 1 };
        if (level < 9) return { size: 5, treasures: 5, digs: 11, difficulty: 2 };
        return { size: 6, treasures: 6, digs: 13, difficulty: 3 };
    }

    countAdjacentTreasures(row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < this.treasureSize && nc >= 0 && nc < this.treasureSize) {
                    if (this.treasureGrid[nr][nc].hasTreasure) count++;
                }
            }
        }
        return count;
    }

    renderTreasureGrid() {
        const container = document.getElementById('treasure-grid');
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${this.treasureSize}, 1fr)`;

        for (let r = 0; r < this.treasureSize; r++) {
            for (let c = 0; c < this.treasureSize; c++) {
                const cell = document.createElement('button');
                cell.className = 'treasure-cell';
                const data = this.treasureGrid[r][c];

                if (data.revealed) {
                    cell.classList.add('revealed');
                    if (data.hasTreasure) {
                        cell.textContent = '💎';
                        cell.classList.add('has-treasure');
                    } else if (data.adjacent > 0) {
                        cell.textContent = data.adjacent;
                        cell.classList.add(`hint-${data.adjacent}`);
                    } else {
                        cell.textContent = '';
                    }
                } else {
                    cell.textContent = '?';
                    if (!this.treasureGameOver) {
                        cell.addEventListener('click', () => this.digTreasureCell(r, c));
                    }
                }

                container.appendChild(cell);
            }
        }
    }

    digTreasureCell(row, col) {
        if (this.treasureGameOver) return;
        if (this.treasureGrid[row][col].revealed) return;

        this.treasureSelectedCell = { row, col };
        this.showTreasureQuestion();
    }

    showTreasureQuestion() {
        const config = this.getTreasureConfig(this.treasureLevel);
        const difficulty = config.difficulty;

        // Generate a math question based on difficulty
        let a, b, op, answer, text;

        if (difficulty === 0) {
            a = this.random(1, 9);
            b = this.random(1, 9);
            op = '+';
            answer = a + b;
            text = `${a} + ${b} = ?`;
        } else if (difficulty === 1) {
            if (Math.random() < 0.5) {
                a = this.random(5, 20);
                b = this.random(1, a - 1);
                op = '-';
                answer = a - b;
                text = `${a} − ${b} = ?`;
            } else {
                a = this.random(10, 30);
                b = this.random(5, 20);
                op = '+';
                answer = a + b;
                text = `${a} + ${b} = ?`;
            }
        } else if (difficulty === 2) {
            a = this.random(2, 9);
            b = this.random(2, 9);
            op = '×';
            answer = a * b;
            text = `${a} × ${b} = ?`;
        } else {
            const ops = ['+', '-', '×'];
            op = ops[Math.floor(Math.random() * ops.length)];
            if (op === '+') {
                a = this.random(15, 50);
                b = this.random(10, 40);
                answer = a + b;
                text = `${a} + ${b} = ?`;
            } else if (op === '-') {
                a = this.random(20, 60);
                b = this.random(5, a - 1);
                answer = a - b;
                text = `${a} − ${b} = ?`;
            } else {
                a = this.random(3, 12);
                b = this.random(3, 9);
                answer = a * b;
                text = `${a} × ${b} = ?`;
            }
        }

        this.treasureCurrentAnswer = answer;

        // Show question panel
        document.getElementById('treasure-question-panel').style.display = 'block';
        document.getElementById('treasure-question-text').textContent = text;

        // Generate answer options
        const options = this.generateTreasureOptions(answer);
        const answersDiv = document.getElementById('treasure-answers');
        answersDiv.innerHTML = '';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'treasure-answer-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => this.checkTreasureAnswer(opt));
            answersDiv.appendChild(btn);
        });
    }

    generateTreasureOptions(correct) {
        const range = Math.max(3, Math.ceil(correct * 0.2));
        const options = new Set([correct]);
        while (options.size < 4) {
            const offset = this.random(1, range) * (Math.random() < 0.5 ? 1 : -1);
            const opt = correct + offset;
            if (opt > 0) options.add(opt);
        }
        return this.shuffle([...options]);
    }

    checkTreasureAnswer(selected) {
        const panel = document.getElementById('treasure-question-panel');

        if (selected === this.treasureCurrentAnswer) {
            // Correct — reveal the cell
            panel.style.display = 'none';
            const { row, col } = this.treasureSelectedCell;
            this.revealTreasureCell(row, col);
        } else {
            // Wrong — lose a dig, don't reveal
            panel.style.display = 'none';
            this.treasureDigs--;
            document.getElementById('treasure-digs').textContent = `⛏ ${this.treasureDigs} digs left`;
            this.playSound('wrong');

            const feedback = document.getElementById('treasure-feedback');
            feedback.style.display = 'block';
            feedback.className = 'treasure-feedback wrong';
            feedback.textContent = `Wrong answer! Lost a dig. (Answer was ${this.treasureCurrentAnswer})`;
            setTimeout(() => { feedback.style.display = 'none'; }, 2000);

            if (this.treasureDigs <= 0) {
                this.treasureLose();
            }
        }
    }

    revealTreasureCell(row, col) {
        const cell = this.treasureGrid[row][col];
        cell.revealed = true;
        this.treasureDigs--;

        document.getElementById('treasure-digs').textContent = `⛏ ${this.treasureDigs} digs left`;

        if (cell.hasTreasure) {
            this.treasureFound++;
            document.getElementById('treasure-found').textContent = `💎 ${this.treasureFound}/${this.treasureCount}`;
            this.playSound('success');

            if (this.treasureFound >= this.treasureCount) {
                this.treasureWin();
                return;
            }
        } else {
            this.playSound('click');
            // Auto-reveal adjacent empty cells (like minesweeper)
            if (cell.adjacent === 0) {
                this.autoRevealTreasure(row, col);
            }
        }

        if (this.treasureDigs <= 0 && this.treasureFound < this.treasureCount) {
            this.treasureLose();
            return;
        }

        this.renderTreasureGrid();
    }

    autoRevealTreasure(row, col) {
        // Flood-fill reveal cells with 0 adjacent treasures
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < this.treasureSize && nc >= 0 && nc < this.treasureSize) {
                    const neighbor = this.treasureGrid[nr][nc];
                    if (!neighbor.revealed && !neighbor.hasTreasure) {
                        neighbor.revealed = true;
                        if (neighbor.adjacent === 0) {
                            this.autoRevealTreasure(nr, nc);
                        }
                    }
                }
            }
        }
    }

    treasureWin() {
        this.treasureGameOver = true;
        const feedback = document.getElementById('treasure-feedback');
        feedback.style.display = 'block';
        feedback.className = 'treasure-feedback success';
        feedback.textContent = `🎉 All treasures found! Amazing!`;
        this.playSound('success');

        // Reveal entire grid
        for (let r = 0; r < this.treasureSize; r++) {
            for (let c = 0; c < this.treasureSize; c++) {
                this.treasureGrid[r][c].revealed = true;
            }
        }
        this.renderTreasureGrid();

        setTimeout(() => {
            this.treasureLevel++;
            this.initTreasure();
        }, 2500);
    }

    treasureLose() {
        this.treasureGameOver = true;
        const feedback = document.getElementById('treasure-feedback');
        feedback.style.display = 'block';
        feedback.className = 'treasure-feedback fail';
        feedback.textContent = `Out of digs! Found ${this.treasureFound}/${this.treasureCount} treasures.`;

        // Reveal unfound treasures
        for (let r = 0; r < this.treasureSize; r++) {
            for (let c = 0; c < this.treasureSize; c++) {
                if (this.treasureGrid[r][c].hasTreasure) {
                    this.treasureGrid[r][c].revealed = true;
                }
            }
        }
        this.renderTreasureGrid();
    }

    // ===========================
    // Equation Balance Game
    // ===========================

    initBalance() {
        this.balanceLevel = this.balanceLevel || 0;
        this.balanceScore = this.balanceScore || 0;

        const puzzle = this.generateBalancePuzzle(this.balanceLevel);
        this.balancePuzzle = puzzle;
        this.balanceLeftPlaced = [];
        this.balanceRightPlaced = [];
        this.balanceChoicesRemaining = [...puzzle.choices];

        document.getElementById('balance-level-badge').textContent = `Level ${this.balanceLevel + 1}`;
        document.getElementById('balance-score').textContent = `Score: ${this.balanceScore}`;
        document.getElementById('balance-feedback').style.display = 'none';
        document.getElementById('balance-instruction').textContent = puzzle.instruction;

        this.renderBalance();
    }

    generateBalancePuzzle(level) {
        if (level < 3) {
            // Simple: one side has a number, place one number on the other
            // e.g., Left: [5], Right: [?], choices: [3, 5, 7, 2]
            const target = this.random(3, 10);
            const choices = this.generateBalanceChoices(target, 1);
            return {
                instruction: 'Place a number on the right to balance!',
                leftFixed: [target],
                rightFixed: [],
                blanksLeft: 0,
                blanksRight: 1,
                target: target,
                choices: choices
            };
        } else if (level < 6) {
            // Left has two numbers, right needs one to match sum
            // e.g., Left: [3, 4], Right: [?], choices: [5, 7, 6, 9]
            const a = this.random(2, 8);
            const b = this.random(2, 8);
            const target = a + b;
            const choices = this.generateBalanceChoices(target, 1);
            return {
                instruction: 'What equals the left side?',
                leftFixed: [a, b],
                rightFixed: [],
                blanksLeft: 0,
                blanksRight: 1,
                target: target,
                choices: choices
            };
        } else if (level < 9) {
            // Both sides have numbers, find what's missing
            // e.g., Left: [3, ?], Right: [8], choices: [5, 4, 6, 3]
            const total = this.random(8, 18);
            const leftKnown = this.random(2, total - 2);
            const missing = total - leftKnown;
            const choices = this.generateBalanceChoices(missing, 1);
            return {
                instruction: 'What makes both sides equal?',
                leftFixed: [leftKnown],
                rightFixed: [total],
                blanksLeft: 1,
                blanksRight: 0,
                target: total,
                choices: choices
            };
        } else if (level < 12) {
            // Right side has sum, left needs two numbers
            // e.g., Left: [?, ?], Right: [12], pick two that add to 12
            const target = this.random(10, 20);
            const a = this.random(2, target - 2);
            const b = target - a;
            // Include correct pair plus distractors
            const pool = new Set([a, b]);
            while (pool.size < 6) {
                pool.add(this.random(1, target));
            }
            return {
                instruction: 'Pick two numbers that add up to the right side!',
                leftFixed: [],
                rightFixed: [target],
                blanksLeft: 2,
                blanksRight: 0,
                target: target,
                choices: this.shuffle([...pool])
            };
        } else {
            // Multiplication balance: a × ? = target
            const a = this.random(2, 9);
            const b = this.random(2, 9);
            const target = a * b;
            const choices = this.generateBalanceChoices(b, 1);
            return {
                instruction: `${a} × ? = balance the right side!`,
                leftFixed: [`${a} ×`],
                rightFixed: [target],
                blanksLeft: 1,
                blanksRight: 0,
                target: target,
                choices: choices,
                isMultiply: true,
                multiplier: a
            };
        }
    }

    generateBalanceChoices(correct, count) {
        const choices = new Set([correct]);
        const range = Math.max(3, Math.ceil(correct * 0.3));
        while (choices.size < 5) {
            const offset = this.random(1, range) * (Math.random() < 0.5 ? 1 : -1);
            const val = correct + offset;
            if (val > 0) choices.add(val);
        }
        return this.shuffle([...choices]);
    }

    renderBalance() {
        const puzzle = this.balancePuzzle;

        // Render left side
        const leftItems = document.getElementById('balance-left-items');
        leftItems.innerHTML = '';
        puzzle.leftFixed.forEach(n => {
            const chip = document.createElement('span');
            chip.className = 'balance-chip fixed';
            chip.textContent = n;
            leftItems.appendChild(chip);
        });
        this.balanceLeftPlaced.forEach((n, i) => {
            const chip = document.createElement('span');
            chip.className = 'balance-chip placed';
            chip.textContent = n;
            chip.addEventListener('click', () => this.removeBalanceChip('left', i));
            leftItems.appendChild(chip);
        });
        for (let i = 0; i < puzzle.blanksLeft - this.balanceLeftPlaced.length; i++) {
            const chip = document.createElement('span');
            chip.className = 'balance-chip blank';
            chip.textContent = '?';
            leftItems.appendChild(chip);
        }

        // Render right side
        const rightItems = document.getElementById('balance-right-items');
        rightItems.innerHTML = '';
        puzzle.rightFixed.forEach(n => {
            const chip = document.createElement('span');
            chip.className = 'balance-chip fixed';
            chip.textContent = n;
            rightItems.appendChild(chip);
        });
        this.balanceRightPlaced.forEach((n, i) => {
            const chip = document.createElement('span');
            chip.className = 'balance-chip placed';
            chip.textContent = n;
            chip.addEventListener('click', () => this.removeBalanceChip('right', i));
            rightItems.appendChild(chip);
        });
        for (let i = 0; i < puzzle.blanksRight - this.balanceRightPlaced.length; i++) {
            const chip = document.createElement('span');
            chip.className = 'balance-chip blank';
            chip.textContent = '?';
            rightItems.appendChild(chip);
        }

        // Render choices
        const choicesDiv = document.getElementById('balance-choice-btns');
        choicesDiv.innerHTML = '';
        this.balanceChoicesRemaining.forEach((n, i) => {
            const btn = document.createElement('button');
            btn.className = 'balance-choice-btn';
            btn.textContent = n;
            btn.addEventListener('click', () => this.placeBalanceChoice(i));
            choicesDiv.appendChild(btn);
        });

        // Render scale SVG
        this.renderBalanceScale();
    }

    renderBalanceScale() {
        const puzzle = this.balancePuzzle;
        let leftSum = 0;
        let rightSum = 0;

        // Calculate left sum
        puzzle.leftFixed.forEach(n => {
            if (typeof n === 'number') leftSum += n;
        });
        this.balanceLeftPlaced.forEach(n => leftSum += n);

        // For multiply puzzles
        if (puzzle.isMultiply && this.balanceLeftPlaced.length > 0) {
            leftSum = puzzle.multiplier * this.balanceLeftPlaced[0];
        }

        // Calculate right sum
        puzzle.rightFixed.forEach(n => {
            if (typeof n === 'number') rightSum += n;
        });
        this.balanceRightPlaced.forEach(n => rightSum += n);

        // Determine tilt: -1 left heavy, 0 balanced, 1 right heavy
        let tilt = 0;
        if (leftSum > rightSum) tilt = -1;
        else if (rightSum > leftSum) tilt = 1;

        const tiltAngle = tilt * 12;
        const scaleDiv = document.getElementById('balance-scale');
        scaleDiv.innerHTML = `
            <svg viewBox="0 0 300 160" class="balance-svg">
                <!-- Base/fulcrum -->
                <polygon points="150,155 135,130 165,130" fill="#8B7355" stroke="#5D4E37" stroke-width="2"/>
                <!-- Beam -->
                <g transform="rotate(${tiltAngle}, 150, 130)">
                    <rect x="30" y="126" width="240" height="8" rx="4" fill="#6c5ce7" stroke="#4a3db0" stroke-width="1.5"/>
                    <!-- Left pan -->
                    <line x1="60" y1="134" x2="60" y2="150" stroke="#888" stroke-width="2"/>
                    <rect x="30" y="150" width="60" height="6" rx="3" fill="#a29bfe"/>
                    <!-- Right pan -->
                    <line x1="240" y1="134" x2="240" y2="150" stroke="#888" stroke-width="2"/>
                    <rect x="210" y="150" width="60" height="6" rx="3" fill="#a29bfe"/>
                    <!-- Left weight display -->
                    <text x="60" y="120" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">${leftSum || ''}</text>
                    <!-- Right weight display -->
                    <text x="240" y="120" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">${rightSum || ''}</text>
                </g>
                <!-- Fulcrum dot -->
                <circle cx="150" cy="130" r="6" fill="#5D4E37"/>
            </svg>
        `;
    }

    placeBalanceChoice(choiceIdx) {
        const puzzle = this.balancePuzzle;
        const value = this.balanceChoicesRemaining[choiceIdx];

        // Determine where to place
        if (puzzle.blanksLeft > this.balanceLeftPlaced.length) {
            this.balanceLeftPlaced.push(value);
        } else if (puzzle.blanksRight > this.balanceRightPlaced.length) {
            this.balanceRightPlaced.push(value);
        } else {
            return; // no blanks left
        }

        // Remove from choices
        this.balanceChoicesRemaining.splice(choiceIdx, 1);

        this.renderBalance();

        // Check if all blanks filled
        const leftFilled = this.balanceLeftPlaced.length >= puzzle.blanksLeft;
        const rightFilled = this.balanceRightPlaced.length >= puzzle.blanksRight;

        if (leftFilled && rightFilled) {
            this.checkBalance();
        }
    }

    removeBalanceChip(side, idx) {
        let value;
        if (side === 'left') {
            value = this.balanceLeftPlaced.splice(idx, 1)[0];
        } else {
            value = this.balanceRightPlaced.splice(idx, 1)[0];
        }
        this.balanceChoicesRemaining.push(value);
        document.getElementById('balance-feedback').style.display = 'none';
        this.renderBalance();
    }

    checkBalance() {
        const puzzle = this.balancePuzzle;
        let leftSum = 0;
        let rightSum = 0;

        if (puzzle.isMultiply) {
            leftSum = puzzle.multiplier * this.balanceLeftPlaced[0];
        } else {
            puzzle.leftFixed.forEach(n => { if (typeof n === 'number') leftSum += n; });
            this.balanceLeftPlaced.forEach(n => leftSum += n);
        }

        puzzle.rightFixed.forEach(n => { if (typeof n === 'number') rightSum += n; });
        this.balanceRightPlaced.forEach(n => rightSum += n);

        const feedback = document.getElementById('balance-feedback');
        feedback.style.display = 'block';

        if (leftSum === rightSum) {
            feedback.className = 'balance-feedback success';
            feedback.textContent = '⚖️ Perfectly balanced! Great job!';
            this.balanceScore++;
            this.playSound('success');

            setTimeout(() => {
                this.balanceLevel++;
                this.initBalance();
            }, 2000);
        } else {
            feedback.className = 'balance-feedback fail';
            const diff = leftSum - rightSum;
            if (diff > 0) {
                feedback.textContent = `Left side is heavier (${leftSum} vs ${rightSum}). Tap a placed number to remove it.`;
            } else {
                feedback.textContent = `Right side is heavier (${rightSum} vs ${leftSum}). Tap a placed number to remove it.`;
            }
        }
    }

    resetBalancePuzzle() {
        // Return placed numbers to choices
        this.balanceChoicesRemaining.push(...this.balanceLeftPlaced, ...this.balanceRightPlaced);
        this.balanceLeftPlaced = [];
        this.balanceRightPlaced = [];
        document.getElementById('balance-feedback').style.display = 'none';
        this.renderBalance();
    }
}

// ===========================
// Initialize Game
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    const loadingScreen = document.getElementById('initial-loading');

    // Hide loading screen
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }, 100);

    // User selection
    const userButtons = document.querySelectorAll('.user-btn');
    userButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const username = btn.dataset.user;
            console.log('User selected:', username);

            try {
                const gameState = new GameState(username);
                console.log('GameState created for:', username);

                const uiManager = new UIManager(gameState);
                console.log('UIManager created');

                // Switch to home screen
                uiManager.showScreen('home-screen');
                uiManager.updateHomeScreen();

                // Apply saved settings
                if (gameState.settings.highContrast) {
                    document.body.classList.add('high-contrast');
                }
                if (gameState.settings.reduceMotion) {
                    document.body.classList.add('reduce-motion');
                }

                console.log('Number Blocks - Game Loaded for', username);
            } catch (error) {
                console.error('Error initializing game:', error);
                alert('Error loading game: ' + error.message);
            }
        });
    });
});
