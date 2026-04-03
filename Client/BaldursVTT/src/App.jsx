import React from "react";
import "./App.css";
import Join from './Components/Join'
import './Components/Join.css'
import './index.css'

function App() {
  return (
    <div className="root">
      <div className="glow"></div>
      <div className="main">
        <div className="header">
          <span className="swords">⚔</span>
          <h1 className="title">BALDURSVTT</h1>
          <p className="subtitle">A virtual tabletop for the tales worth telling</p>
          <div className="title-rule">
            <span className="rule-line"></span>
            <span className="rule-diamond">◆</span>
            <span className="rule-line"></span>
          </div>
        </div>
        <div className="cards">
          <div className="card">
            <span className="shape">✦</span>
            <h2 className="card-title">BEGIN A SESSION</h2>
            <p className="card-text">Open a new room and invite your adventurers with a shared code.</p>
            <button className="button-create">CREATE ROOM</button>
          </div>
          <div className="divider">
            <span className="divider-line"></span>
            <span className="divider-text">OR</span>
            <span className="divider-line"></span>
          </div>
          <div className="card">
            <span className="shape">⬡</span>
            <h2 className="card-title">JOIN A SESSION</h2>
            <p className="card-text">Have a room code? Enter it below to step into the world.</p>
            <Join/>
          </div>
        </div>
        <p className="endline">Crafted for stories that deserve a proper stage.</p>
      </div>
    </div>
  );
}

export default App;
