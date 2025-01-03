import React, {
  useRef,
  useState,
  useEffect,
  useCallback
} from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [showFractal, setShowFractal] = useState(false);

  /**
   * 1) Use useCallback so this function reference remains stable between renders.
   * 2) This prevents the ESLint warning about missing dependencies in useEffect.
   */
  const drawFractal = useCallback(
    (ctx, startX, startY, length, angle, branchWidth) => {
      ctx.lineWidth = branchWidth;
      ctx.beginPath();
      ctx.save();

      // Translate to start position and rotate
      ctx.translate(startX, startY);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -length);
      ctx.strokeStyle = '#ffffff'; // white color for branches
      ctx.stroke();

      // Base case: if branch is too short, stop
      if (length < 10) {
        ctx.restore();
        return;
      }

      // Recursively draw left branch
      drawFractal(
        ctx,
        0,             // new startX
        -length,       // new startY (above the current branch)
        length * 0.7,  // shorten branch
        angle - 20,    // turn left
        branchWidth * 0.7
      );

      // Recursively draw right branch
      drawFractal(
        ctx,
        0,
        -length,
        length * 0.7,
        angle + 20,    // turn right
        branchWidth * 0.7
      );

      ctx.restore();
    },
    []
    // Empty array means "drawFractal" never changes;
    // no external variables are used in the logic.
  );

  useEffect(() => {
    if (showFractal) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Clear before drawing a new fractal
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw fractal from bottom-center of the canvas
      drawFractal(
        ctx,
        canvas.width / 2,
        canvas.height - 20,
        100, // initial branch length
        0,   // initial angle
        10   // branch width
      );
    }
    /**
     * ESLint requires "drawFractal" in dependencies because it is
     * used inside useEffect. "showFractal" is also needed since the effect depends on that state.
     */
  }, [showFractal, drawFractal]);

  const handleClick = () => {
    setShowFractal(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        {/* Original React logo and text */}
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.jsx</code> and save to reload.
        </p>

        {/* Button to trigger fractal drawing */}
        <button onClick={handleClick} className="App-button">
          Click Me
        </button>

        {/* Canvas for the fractal */}
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
