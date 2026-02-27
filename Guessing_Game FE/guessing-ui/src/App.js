import React, { useState } from "react";
import "./App.css";

function App() {

  console.log("API_BASE:", process.env.REACT_APP_API_BASE);

  
  const [stage, setStage] = useState("START");
  const [userFirstPlayer, setUserFirstPlayer] = useState(true);

  const [guess, setGuess] = useState("");
  const [userResult, setUserResult] = useState("");
  const [userAttempts, setUserAttempts] = useState(0);

  

  const [aiGuess, setAiGuess] = useState(null);
  const [aiAttempts, setAiAttempts] = useState(0);
  const [aiGreeting, setAiGreeting] = useState("");



  const [winner, setWinner] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const API_BASE = process.env.REACT_APP_API_BASE;

  const isValidGuess = () => {
    const n = parseInt(guess, 10);
    return !isNaN(n) && n >= 1 && n <= 50;
  };

  const userGuess = async () => {
    setError("");
    if (!guess) return;
    if (!isValidGuess()) {
      setError("Please enter a number between 1 and 50.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/user/guess?number=${guess}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Guess failed");
      const data = await res.text();
      setUserResult(data);

      if (data.toLowerCase().includes("correct")) {
        const a = await fetch(`${API_BASE}/api/user/attempts`);
        if (!a.ok) throw new Error("Could not get attempts");
        const att = await a.text();
        setUserAttempts(parseInt(att, 10) || 0);
        if (userFirstPlayer) {
          setStage("AI");
          await startAi();
        } else {
          await getWinner();
          setStage("RESULT");
        }
      }
    } catch (err) {
      setError(err.message || "Could not connect. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };




  const startAi = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/start?max=50`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Could not start AI");
      const data = await res.text();
      setAiGuess(data);
      setAiGreeting(["Hi!", "Hello!", "Hey there!"][Math.floor(Math.random() * 3)]);
    } catch (err) {
      setError(err.message || "Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };


  

  const feedback = async (type) => {
    setError("");
    setLoading(true);
    if (type === "correct") {
      try {
        await fetch(`${API_BASE}/api/ai/feedback?result=correct`, {
          method: "POST",
        });
        const a = await fetch(`${API_BASE}/api/ai/attempts`);
        if (!a.ok) throw new Error("Could not get AI attempts");
        const att = await a.text();
        setAiAttempts(parseInt(att, 10) || 0);
        if (userFirstPlayer) {
          await getWinner();
          setStage("RESULT");
        } else {
          await fetch(`${API_BASE}/api/user/reset`, { method: "POST" });
          setStage("USER");
        }
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE}/api/ai/feedback?result=${type}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Feedback failed");
      const data = await res.text();
      setAiGuess(data);
      setAiGreeting(["Hi!", "Hello!", "Hey there!"][Math.floor(Math.random() * 3)]);
    } catch (err) {
      setError(err.message || "Could not send feedback.");
    } finally {
      setLoading(false);
    }
  };


  

  const getWinner = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/result/winner`);
      if (!res.ok) throw new Error("Could not get result");
      const data = await res.text();
      setWinner(data);
    } catch (err) {
      setWinner("Could not determine winner.");
    }
  };


  

  const startGame = async (userGoesFirst) => {
    setError("");
    setUserFirstPlayer(userGoesFirst);
    setGuess("");
    setUserResult("");
    setUserAttempts(0);
    setAiGuess(null);
    setAiAttempts(0);
    setAiGreeting("");
    setWinner("");
    try {
      await fetch(`${API_BASE}/api/user/reset`, { method: "POST" });
    } catch {
      // Continue even if backend fails
    }
    if (userGoesFirst) {
      setStage("USER");
    } else {
      setStage("AI");
      setLoading(true);
      await startAi();
    }
  };

  const restartGame = async () => {
    setError("");
    try {
      await fetch(`${API_BASE}/api/user/reset`, { method: "POST" });
    } catch {
        
    }
    setStage("START");
    setGuess("");
    setUserResult("");
    setUserAttempts(0);
    setAiGuess(null);
    setAiAttempts(0);
    setAiGreeting("");
    setWinner("");
  };



  return (
    <div className="app-wrap">
      <div className="container">
        <h1> Number Showdown</h1>
        {error && <p className="error-msg">{error}</p>}

      {/* START / WELCOME */}
      {stage === "START" && (
        <>
          <div className="game-info">
            <h2>How to Play</h2>
            <p>You and the computer take turns guessing a number between 1 and 50. Whoever uses fewer attempts wins!</p>
            <ul>
              <li><strong>Your turn:</strong> Guess the computer&apos;s secret number.</li>
              <li><strong>Computer&apos;s turn:</strong> You think of a number. Tell the computer &quot;Higher&quot; or &quot;Lower&quot; until it guesses correctly.</li>
            </ul>
            <p className="choose-prompt">Who plays first?</p>
          </div>
          <div className="start-buttons">
            <button onClick={() => startGame(true)}>
              I Play First 🎮
            </button>
            <button onClick={() => startGame(false)}>
              Computer Plays First 🤖
            </button>
          </div>
        </>
      )}

      {/* USER TURN */}
      {stage === "USER" && (
        <>
          <h2>Your Turn</h2>

          <input
            type="number"
            min={1}
            max={50}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="1 - 50"
            aria-label="Your guess between 1 and 50"
          />

          <button onClick={userGuess} disabled={loading}>
            {loading ? "Checking…" : "Guess"}
          </button>

          <p>{userResult}</p>
        </>
      )}


      {/* AI TURN */}
      {stage === "AI" && (
        <>
          <h2>🤖 Computer Turn</h2>

          {loading && !aiGuess ? (
            <p className="loading-text">AI is thinking…</p>
          ) : (
            <>
              <p className="ai-greeting">{aiGreeting}</p>
              <h3>My Guess: {aiGuess}</h3>
            </>
          )}

          <p className="ai-hint">Tell me if your number is higher or lower</p>

          <div className="button-group">
            <button onClick={() => feedback("higher")} disabled={loading}>
              Higher 🔼
            </button>
            <button onClick={() => feedback("lower")} disabled={loading}>
              Lower 🔽
            </button>
            <button
              className="correct"
              onClick={() => feedback("correct")}
              disabled={loading}
            >
              Correct ✅
            </button>
          </div>
        </>
      )}


      {/* RESULT */}
      {stage === "RESULT" && (
        <>
          <h2>🏆 Result</h2>

          <div className="result-stats">
            <div className="result-stat">
              <span>You</span>
              <strong>{userAttempts}</strong> attempts
            </div>
            <div className="result-stat">
              <span>Computer</span>
              <strong>{aiAttempts}</strong> attempts
            </div>
          </div>

          <p className="winner-text">{winner}</p>

          <button onClick={restartGame} disabled={loading}>
            Play Again 🔄
          </button>
        </>
      )}
      </div>
    </div>
  );
}

export default App;