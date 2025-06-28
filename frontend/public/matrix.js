// Matrix Rain Animation
class MatrixRain {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?`~01";
    this.matrix = [];
    this.animationId = null;
  }

  init() {
    this.canvas = document.getElementById('matrix-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
    this.createMatrix();
    this.animate();
    
    window.addEventListener('resize', () => this.handleResize());
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  createMatrix() {
    const columns = Math.floor(this.canvas.width / 20);
    this.matrix = [];
    
    for (let i = 0; i < columns; i++) {
      this.matrix[i] = {
        y: Math.random() * this.canvas.height,
        speed: Math.random() * 3 + 1,
        chars: []
      };
      
      // Create character trail
      for (let j = 0; j < 20; j++) {
        this.matrix[i].chars.push({
          char: this.getRandomChar(),
          opacity: 1 - (j * 0.05)
        });
      }
    }
  }

  getRandomChar() {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  animate() {
    // Clear canvas with fade effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw matrix rain
    for (let i = 0; i < this.matrix.length; i++) {
      const column = this.matrix[i];
      
      for (let j = 0; j < column.chars.length; j++) {
        const char = column.chars[j];
        const x = i * 20;
        const y = column.y - (j * 20);
        
        // Set character color and opacity
        if (j === 0) {
          // Head of the trail - bright green
          this.ctx.fillStyle = '#ffffff';
          this.ctx.shadowColor = '#00ff41';
          this.ctx.shadowBlur = 10;
        } else if (j < 3) {
          // Near head - bright green
          this.ctx.fillStyle = '#00ff41';
          this.ctx.shadowBlur = 5;
        } else {
          // Trail - fading green
          this.ctx.fillStyle = `rgba(0, 255, 65, ${char.opacity})`;
          this.ctx.shadowBlur = 0;
        }
        
        this.ctx.font = '16px monospace';
        this.ctx.fillText(char.char, x, y);
        
        // Randomly change characters
        if (Math.random() < 0.02) {
          char.char = this.getRandomChar();
        }
      }
      
      // Move column down
      column.y += column.speed;
      
      // Reset column when it goes off screen
      if (column.y > this.canvas.height + 200) {
        column.y = -200;
        column.speed = Math.random() * 3 + 1;
      }
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    this.setupCanvas();
    this.createMatrix();
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const matrix = new MatrixRain();
  matrix.init();
});

// Also try to initialize immediately in case DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const matrix = new MatrixRain();
    matrix.init();
  });
} else {
  const matrix = new MatrixRain();
  matrix.init();
}
