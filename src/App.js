import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  // Function to handle button click
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        {/* Add a button */}
        <button onClick={handleClick} className="App-button">
          Click Me
        </button>
      </header>
    </div>
  );
}

export default App;
