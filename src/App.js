import React, { useRef, useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [showFractal, setShowFractal] = useState(false);

  // Recursive function to draw a simple fractal tree
  const drawFractal = (ctx, startX, startY, length, angle, branchWidth) => {
    ctx.lineWidth = branchWidth;
    ctx.beginPath();
    ctx.save();

    // Move to the start position
    ctx.translate(startX, startY);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length);
    ctx.strokeStyle = '#ffffff'; // White color for branches
    ctx.stroke();

    // Base case: stop if branch is too short
    if (length < 10) {
      ctx.restore();
      return;
    }

    // Draw left branch
    drawFractal(ctx, 0, -length, length * 0.7, angle - 20, branchWidth * 0.7);
    // Draw right branch
    drawFractal(ctx, 0, -length, length * 0.7, angle + 20, branchWidth * 0.7);

    ctx.restore();
  };

  // When showFractal is set to true, draw the fractal on the canvas
  useEffect(() => {
    if (showFractal) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Clear the canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw fractal from the bottom center of canvas
      drawFractal(ctx, canvas.width / 2, canvas.height - 20, 100, 0, 10);
    }
  }, [showFractal]);

  // Handle the click event to show the fractal
  const handleClick = () => {
    setShowFractal(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* Original React logo & text */}
        <img src={logo} className="App-logo" alt="logo" />

        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>

        {/* Button triggers fractal drawing */}
        <button onClick={handleClick} className="App-button">
          Click Me
        </button>

        {/* Canvas for drawing the fractal */}
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          style={{ border: '1px solid #ccc', marginTop: '20px' }}
        />
      </header>
    </div>
  );
}

export default App;
