/**
 * ASCII VIBE CODEX - MotionEngine
 * Terminal-optimized animation and motion graphics system
 */

export class MotionEngine {
  constructor() {
    this.animations = new Map();
    this.frameRate = 24; // 24fps for smooth terminal animation
    this.isRunning = false;
    this.currentFrame = 0;
  }

  /**
   * Registers an animation sequence
   * @param {string} id - Animation identifier
   * @param {Object} config - Animation configuration
   */
  registerAnimation(id, config) {
    const {
      frames,
      duration = 1000,
      loop = false,
      easing = 'linear',
      onComplete = null
    } = config;

    this.animations.set(id, {
      frames,
      duration,
      loop,
      easing,
      onComplete,
      startTime: null,
      isActive: false
    });
  }

  /**
   * Starts an animation
   * @param {string} id - Animation identifier
   */
  startAnimation(id) {
    const animation = this.animations.get(id);
    if (!animation) {
      throw new Error(`Animation ${id} not found`);
    }

    animation.startTime = Date.now();
    animation.isActive = true;

    if (!this.isRunning) {
      this.startRenderLoop();
    }
  }

  /**
   * Stops an animation
   * @param {string} id - Animation identifier
   */
  stopAnimation(id) {
    const animation = this.animations.get(id);
    if (animation) {
      animation.isActive = false;
    }
  }

  /**
   * Main render loop for animations
   */
  startRenderLoop() {
    this.isRunning = true;
    const frameInterval = 1000 / this.frameRate;

    const renderFrame = () => {
      if (!this.isRunning) return;

      let hasActiveAnimations = false;

      for (const [id, animation] of this.animations) {
        if (animation.isActive) {
          hasActiveAnimations = true;
          this.updateAnimation(id, animation);
        }
      }

      if (hasActiveAnimations) {
        setTimeout(renderFrame, frameInterval);
      } else {
        this.isRunning = false;
      }
    };

    renderFrame();
  }

  /**
   * Updates a single animation frame
   */
  updateAnimation(id, animation) {
    const now = Date.now();
    const elapsed = now - animation.startTime;
    const progress = Math.min(elapsed / animation.duration, 1);

    // Apply easing function
    const easedProgress = this.applyEasing(progress, animation.easing);
    
    // Calculate current frame
    const frameIndex = Math.floor(easedProgress * (animation.frames.length - 1));
    const currentFrame = animation.frames[frameIndex];

    // Render frame
    this.renderFrame(currentFrame);

    // Check if animation is complete
    if (progress >= 1) {
      if (animation.loop) {
        animation.startTime = now;
      } else {
        animation.isActive = false;
        if (animation.onComplete) {
          animation.onComplete();
        }
      }
    }
  }

  /**
   * Applies easing function to progress
   */
  applyEasing(progress, easing) {
    switch (easing) {
      case 'easeIn':
        return progress * progress;
      case 'easeOut':
        return 1 - Math.pow(1 - progress, 2);
      case 'easeInOut':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      case 'bounce':
        if (progress < 1/2.75) {
          return 7.5625 * progress * progress;
        } else if (progress < 2/2.75) {
          return 7.5625 * (progress -= 1.5/2.75) * progress + 0.75;
        } else if (progress < 2.5/2.75) {
          return 7.5625 * (progress -= 2.25/2.75) * progress + 0.9375;
        } else {
          return 7.5625 * (progress -= 2.625/2.75) * progress + 0.984375;
        }
      default: // linear
        return progress;
    }
  }

  /**
   * Renders a frame to terminal
   */
  renderFrame(frame) {
    if (typeof frame === 'string') {
      process.stdout.write('\x1b[2J\x1b[H' + frame);
    } else if (Array.isArray(frame)) {
      process.stdout.write('\x1b[2J\x1b[H' + frame.join('\n'));
    }
  }

  /**
   * Creates a typewriter effect animation
   */
  createTypewriterEffect(text, speed = 50) {
    const frames = [];
    for (let i = 0; i <= text.length; i++) {
      frames.push(text.substring(0, i) + (i < text.length ? '█' : ''));
    }

    return {
      frames,
      duration: text.length * speed,
      loop: false,
      easing: 'linear'
    };
  }

  /**
   * Creates a pulse animation for borders
   */
  createPulseEffect(content, chars = ['█', '▓', '▒', '░']) {
    const frames = [];
    
    // Forward pulse
    for (const char of chars) {
      frames.push(content.replace(/[█▓▒░]/g, char));
    }
    
    // Reverse pulse
    for (let i = chars.length - 2; i >= 0; i--) {
      frames.push(content.replace(/[█▓▒░]/g, chars[i]));
    }

    return {
      frames,
      duration: 2000,
      loop: true,
      easing: 'easeInOut'
    };
  }

  /**
   * Creates a sliding animation
   */
  createSlideEffect(content, direction = 'right', distance = 10) {
    const frames = [];
    const lines = content.split('\n');
    
    for (let i = 0; i <= distance; i++) {
      const offset = direction === 'right' ? i : -i;
      const paddedLines = lines.map(line => {
        if (offset > 0) {
          return ' '.repeat(offset) + line;
        } else {
          return line.substring(-offset);
        }
      });
      frames.push(paddedLines.join('\n'));
    }

    return {
      frames,
      duration: 1000,
      loop: false,
      easing: 'easeOut'
    };
  }

  /**
   * Creates a matrix-style digital rain effect
   */
  createMatrixRain(width, height, density = 0.1) {
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    const columns = Array(width).fill(0);
    
    const generateFrame = () => {
      const frame = Array(height).fill().map(() => ' '.repeat(width).split(''));
      
      for (let x = 0; x < width; x++) {
        if (Math.random() < density) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const y = Math.floor(Math.random() * height);
          frame[y][x] = char;
        }
      }
      
      return frame.map(row => row.join('')).join('\n');
    };

    const frames = [];
    for (let i = 0; i < 30; i++) { // 30 frames for smooth effect
      frames.push(generateFrame());
    }

    return {
      frames,
      duration: 3000,
      loop: true,
      easing: 'linear'
    };
  }

  /**
   * Creates a progress bar animation
   */
  createProgressBar(width, progress = 0) {
    const filled = Math.floor((width - 2) * progress);
    const empty = (width - 2) - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${Math.floor(progress * 100)}%`;
  }

  /**
   * Creates an animated progress sequence
   */
  createProgressAnimation(width, duration = 2000) {
    const frames = [];
    const steps = 20;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      frames.push(this.createProgressBar(width, progress));
    }

    return {
      frames,
      duration,
      loop: false,
      easing: 'easeOut'
    };
  }

  /**
   * Stops all animations and clears resources
   */
  stopAll() {
    this.isRunning = false;
    for (const animation of this.animations.values()) {
      animation.isActive = false;
    }
  }
}