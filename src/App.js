import React, { useRef, useState, useEffect } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [drawTrigger, setDrawTrigger] = useState(0);

  // We'll store our branches in this ref so we can modify it across renders
  const branchesRef = useRef([]);

  /**
   * Define a few fractal “styles” to simulate different plants.
   * We'll keep triple-branch angles for that lush look.
   */
  const fractalStyles = [
    {
      name: 'Tree',
      angleLeft: -20,
      angleCenter: 0,
      angleRight: 20,
      scaleMin: 0.6,
      scaleMax: 0.8,
      angleVariation: 10,
      colorMode: 'randomBranch',
    },
    {
      name: 'Bush',
      angleLeft: -15,
      angleCenter: 0,
      angleRight: 15,
      scaleMin: 0.5,
      scaleMax: 0.85,
      angleVariation: 15,
      colorMode: 'depthGradient',
    },
    {
      name: 'Grass',
      angleLeft: -10,
      angleCenter: -2,
      angleRight: 10,
      scaleMin: 0.9,
      scaleMax: 1.0,
      angleVariation: 5,
      colorMode: 'greenHue',
    },
  ];

  // We'll choose a random style each time we draw a new plant
  const chosenStyleRef = useRef(null);

  /**
   * Draws one branch (a single line) on the canvas.
   * Returns the (endX, endY) so we know where the branch finished.
   */
  function drawBranch(ctx, branch) {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = branch.branchWidth;

    // Color selection logic:
    if (branch.style.colorMode === 'randomBranch') {
      // Each branch gets a random color
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    } else if (branch.style.colorMode === 'depthGradient') {
      // Use depth to shift color from green to brown
      const depthFactor = Math.min(branch.depth * 10, 255);
      ctx.strokeStyle = `rgb(${100 + depthFactor}, ${200 - depthFactor}, 50)`;
    } else if (branch.style.colorMode === 'greenHue') {
      // Shades of green with a little randomness
      const greenVar = Math.floor(Math.random() * 50);
      ctx.strokeStyle = `rgb(${50 + greenVar}, ${150 + greenVar}, ${50})`;
    } else {
      // Fallback: white
      ctx.strokeStyle = '#ffffff';
    }

    ctx.moveTo(branch.startX, branch.startY);

    // Convert angle (in degrees) to radians
    const rad = (branch.angle * Math.PI) / 180;

    // Calculate the end coordinates
    const endX = branch.startX + branch.length * Math.sin(rad);
    const endY = branch.startY - branch.length * Math.cos(rad);

    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();

    return { endX, endY };
  }

  /**
   * Draws one branch from the queue per frame,
   * then enqueues three child branches with random offsets if the current branch is long enough.
   */
  function animateStep(ctx) {
    // If no more branches in the queue, we're done animating
    if (branchesRef.current.length === 0) return;

    // Take one branch off the front of the queue
    const branch = branchesRef.current.shift();

    // Draw that branch
    const { endX, endY } = drawBranch(ctx, branch);

    // If it's still long/thick enough, enqueue the child branches
    if (branch.length > 5) {
      const style = branch.style; // same style for children
      const newDepth = branch.depth + 1;

      // Introduce randomness to branch length
      const randomScaleLeft =
        style.scaleMin + Math.random() * (style.scaleMax - style.scaleMin);
      const randomScaleCenter =
        style.scaleMin + Math.random() * (style.scaleMax - style.scaleMin);
      const randomScaleRight =
        style.scaleMin + Math.random() * (style.scaleMax - style.scaleMin);

      const newLengthLeft = branch.length * randomScaleLeft;
      const newLengthCenter = branch.length * randomScaleCenter;
      const newLengthRight = branch.length * randomScaleRight;

      // Slightly thinner for all children
      const newWidth = branch.branchWidth * 0.7;

      // Introduce random angle offsets
      const angleRange = style.angleVariation; // ± angleRange
      const offsetLeft = (Math.random() - 0.5) * 2 * angleRange;
      const offsetCenter = (Math.random() - 0.5) * 2 * angleRange;
      const offsetRight = (Math.random() - 0.5) * 2 * angleRange;

      // Left branch
      branchesRef.current.push({
        style,
        startX: endX,
        startY: endY,
        length: newLengthLeft,
        angle: branch.angle + style.angleLeft + offsetLeft,
        branchWidth: newWidth,
        depth: newDepth,
      });

      // Center branch
      branchesRef.current.push({
        style,
        startX: endX,
        startY: endY,
        length: newLengthCenter,
        angle: branch.angle + (style.angleCenter ?? 0) + offsetCenter,
        branchWidth: newWidth,
        depth: newDepth,
      });

      // Right branch
      branchesRef.current.push({
        style,
        startX: endX,
        startY: endY,
        length: newLengthRight,
        angle: branch.angle + style.angleRight + offsetRight,
        branchWidth: newWidth,
        depth: newDepth,
      });
    }

    // Request another frame to draw the next branch
    requestAnimationFrame(() => animateStep(ctx));
  }

  /**
   * Whenever drawTrigger changes, we pick a new style, clear the canvas,
   * and start the animation with a random trunk length and width.
   */
  useEffect(() => {
    if (drawTrigger > 0) {
      // Choose a random style
      const randomIndex = Math.floor(Math.random() * fractalStyles.length);
      chosenStyleRef.current = fractalStyles[randomIndex];

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Random trunk length and width for variety
      const trunkLength = 80 + Math.random() * 60; // 80–140
      const trunkWidth = 8 + Math.random() * 8;    // 8–16

      // Initialize the queue with one "trunk" branch
      branchesRef.current = [
        {
          style: chosenStyleRef.current,
          startX: canvas.width / 2, // bottom-center of canvas
          startY: canvas.height - 20,
          length: trunkLength,
          angle: 0, // 0 means "straight up"
          branchWidth: trunkWidth,
          depth: 0,
        },
      ];

      // Start the animation loop
      animateStep(ctx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawTrigger]);

  const handleClick = () => {
    // Bump the trigger to re-run effect
    setDrawTrigger((prev) => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Computational Garden</h1>
        <p>Come grow a plant!</p>

        <button onClick={handleClick} className="App-button">
          Grow Plant
        </button>

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
