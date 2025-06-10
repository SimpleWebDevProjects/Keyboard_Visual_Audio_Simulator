document.addEventListener('DOMContentLoaded', () => {
    const visualizer = document.getElementById('visualizer');
    const keys = document.querySelectorAll('.key');
    const infoBtn = document.getElementById('infoBtn');
    const clearBtn = document.getElementById('clearBtn');
    const infoPanel = document.getElementById('infoPanel');
    const closeInfo = document.getElementById('closeInfo');

    let audioContext;
    let oscillators = {};
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

    // Initialize Audio Context
    function initAudio() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio API is not supported in this browser');
        }
    }

    // Play a tone for a specific key
    function playTone(key) {
        if (!audioContext) initAudio();

        // Stop any existing oscillator for this key
        if (oscillators[key]) {
            oscillators[key].stop();
            delete oscillators[key];
        }

        // Create oscillator and gain node
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Calculate frequency based on key position
        const baseFreq = 220; // A3
        const keyIndex = Array.from(keys).findIndex(k => k.dataset.key === key);
        const frequency = baseFreq * Math.pow(2, keyIndex / 12);

        // Configure oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Configure gain (volume)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

        // Connect and play
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();

        // Store oscillator for later stopping
        oscillators[key] = oscillator;

        // Return frequency for visual mapping
        return frequency;
    }

    // Create a visual shape for a key press
    function createShape(key, frequency) {
        const shapeTypes = ['circle', 'square', 'triangle'];
        const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

        // Determine color based on frequency
        const colorIndex = Math.floor(frequency / 100) % colors.length;
        const color = colors[colorIndex];

        // Create shape element
        const shape = document.createElement('div');
        shape.className = `shape ${shapeType}`;

        // Set size based on frequency (higher frequency = smaller size)
        const size = Math.max(30, 200 - (frequency / 5));
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.backgroundColor = color;

        // Set random position
        const x = Math.random() * (window.innerWidth - size);
        const y = Math.random() * (window.innerHeight - size);
        shape.style.left = `${x}px`;
        shape.style.top = `${y}px`;

        // Random animation duration
        const duration = 15 + Math.random() * 15;
        shape.style.animationDuration = `${duration}s`;

        // Add to visualizer
        visualizer.appendChild(shape);

        // Create ripple effect
        createRipple(x + size/2, y + size/2, color);

        // Remove shape after animation completes
        setTimeout(() => {
            shape.style.opacity = '0';
            setTimeout(() => shape.remove(), 2000);
        }, 10000);
    }

    // Create ripple effect
    function createRipple(x, y, color) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.borderColor = color;
        visualizer.appendChild(ripple);

        setTimeout(() => ripple.remove(), 1500);
    }

    // Handle key press
    function handleKeyPress(key) {
        // Highlight key
        const keyElement = Array.from(keys).find(k => k.dataset.key === key);
        if (keyElement) {
            keyElement.classList.add('active');
            setTimeout(() => keyElement.classList.remove('active'), 300);
        }

        // Play tone and get frequency
        const frequency = playTone(key);

        // Create visual representation
        createShape(key, frequency);
    }

    // Event Listeners
    keys.forEach(key => {
        key.addEventListener('click', () => {
            handleKeyPress(key.dataset.key);
        });
    });

    document.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
            e.preventDefault();
            handleKeyPress(key);
        }
    });

    // Clear canvas
    clearBtn.addEventListener('click', () => {
        visualizer.innerHTML = '';
    });

    // Show/hide info panel
    infoBtn.addEventListener('click', () => {
        infoPanel.style.display = 'block';
    });

    closeInfo.addEventListener('click', () => {
        infoPanel.style.display = 'none';
    });

    // Initialize
    initAudio();

    // Create ambient shapes
    function createAmbientShapes() {
        if (Math.random() > 0.7) {
            const key = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            const frequency = 200 + Math.random() * 600;
            createShape(key, frequency);
        }
        setTimeout(createAmbientShapes, 3000);
    }

    createAmbientShapes();
});
