import React from "react";
import "./App.css";
import Join from './Components/Join'
import './Components/Join.css'

function App() {
  return (
    <div>
     
      <h1> Welcome to BaldursVTT</h1>
      <div className="buttons">
        <button>Create Room</button>
        
        <Join />
        
      </div>
    </div>
  );
}

export default App;
