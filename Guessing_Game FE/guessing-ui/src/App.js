import React, { useState } from "react";
import "./App.css";

function App() {
  const [stage, setStage] = useState("START"); // START | PLAY | RESULT | GOODBYE
  const [guess, setGuess] = useState("");
  const [userResult, setUserResult] = useState("");

  const [aiGuess, setAiGuess] = useState(null);
  const [aiGreeting, setAiGreeting] = useState("");

  const [winner, setWinner] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Race mode state
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("USER_GUESS"); // USER_GUESS | AI_GUESS
  const [userDone, setUserDone] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiStarted, setAiStarted] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

  const isValidGuess = () => {
    const n = parseInt(guess, 10);
    return !isNaN(n) && n >= 1 && n <= 100;
  };
  const userGuess = async () => {
    setError("");
    // User can act only in their phase and while no one has finished.
    if (!guess || userDone || aiDone || phase !== "USER_GUESS") return;
    if (!isValidGuess()) {
      setError("Please enter a number between 1 and 100.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/user/guess?number=${guess}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Guess failed");
      const data = (await res.text()).trim();
      setUserResult(data);

      const isCorrect = data.toLowerCase().includes("correct!");
      if (isCorrect) {
        setUserDone(true);

        setWinner("🏆 You guessed the computer's number first!");
        setStage("RESULT");
        return;
      }

      // Not correct: move to AI's guess in this round
      setPhase("AI_GUESS");
      if (!aiStarted) {
        await startAi();
        setAiStarted(true);
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
      const res = await fetch(`${API_BASE}/api/ai/start?max=100`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Could not start AI");
      const data = (await res.text()).trim();
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
    if (phase !== "AI_GUESS" || userDone || aiDone) {
      setLoading(false);
      return;
    }
    if (type === "correct") {
      try {
        await fetch(`${API_BASE}/api/ai/feedback?result=correct`, {
          method: "POST",
        });
        setAiDone(true);
        // Computer finishes on this round -> computer wins race
        setWinner("🤖 Computer guessed your number first!");
        setStage("RESULT");
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
      const data = (await res.text()).trim();
      setAiGuess(data);
      setAiGreeting(["Hi!", "Hello!", "Hey there!"][Math.floor(Math.random() * 3)]);
    } catch (err) {
      setError(err.message || "Could not send feedback.");
    } finally {
      setLoading(false);
    }

    // Higher / lower given: end this round, go back to user for next round
    setRound((r) => r + 1);
    setPhase("USER_GUESS");
  };


  

  const startGame = async () => {
    setError("");
    setGuess("");
    setUserResult("");
    setAiGuess(null);
    setAiGreeting("");
    setWinner("");
    setUserDone(false);
    setAiDone(false);
    setRound(1);
    setPhase("USER_GUESS");
    setAiStarted(false);
    try {
      await fetch(`${API_BASE}/api/user/reset`, { method: "POST" });
    } catch {
      // Continue even if backend fails
    }
    // User always plays first in this version.
    setStage("PLAY");
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
    setAiGuess(null);
    setAiGreeting("");
    setWinner("");
    setUserDone(false);
    setAiDone(false);
    setRound(1);
    setPhase("USER_GUESS");
    setAiStarted(false);
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
            <p>
              In each round, <strong>you</strong> guess the computer&apos;s secret
              number between 1 and 100.
            </p>
            <p>
              Then the <strong>computer</strong> guesses your number once. The
              first to guess correctly wins the game immediately.
            </p>
            <ul>
              <li><strong>Your turn:</strong> One guess per round.</li>
              <li><strong>Computer&apos;s turn:</strong> One guess per round; you say Higher, Lower, or Correct.</li>
            </ul>
            <p className="choose-prompt">Tap below when you&apos;re ready.</p>
          </div>
          <div className="start-buttons">
            <button onClick={startGame}>
              Start Game 🎮
            </button>
          </div>
        </>
      )}

      {/* PLAY SCREEN: USER + COMPUTER SIDE BY SIDE */}
      {stage === "PLAY" && (
        <div className="play-grid">
          {/* User panel */}
          <div
            className={
              "panel user-panel" +
              (phase === "USER_GUESS" && !userDone && !aiDone ? " active" : "")
            }
          >
            <h2>Your Guess</h2>
            <p className="panel-subtitle">
              Guess the computer&apos;s secret number.
            </p>

            <input
              type="number"
              min={1}
              max={100}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="1 - 100"
              aria-label="Your guess between 1 and 100"
              disabled={
                loading || userDone || aiDone || phase !== "USER_GUESS"
              }
            />

            <button
              onClick={userGuess}
              disabled={loading || userDone || aiDone || phase !== "USER_GUESS"}
            >
              {loading && phase === "USER_GUESS" ? "Checking…" : "Guess"}
            </button>

            <p className="panel-result">{userResult}</p>
          </div>

          {/* AI panel */}
          <div
            className={
              "panel ai-panel" +
              (phase === "AI_GUESS" && !userDone && !aiDone ? " active" : "")
            }
          >
            <h2>🤖 Computer Guess</h2>
            <p className="panel-subtitle">
              You secretly choose a number. Tell the computer if it should go
              higher or lower.
            </p>

            <p className="round-label">Round {round}</p>

            {loading && phase === "AI_GUESS" && !aiGuess ? (
              <p className="loading-text">AI is thinking…</p>
            ) : (
              <>
                <p className="ai-greeting">{aiGreeting}</p>
                <h3>My Guess: {aiGuess ?? "—"}</h3>
              </>
            )}

            <p className="ai-hint">Is your number higher or lower?</p>

            <div className="button-group">
              <button
                onClick={() => feedback("higher")}
                disabled={
                  loading || userDone || aiDone || phase !== "AI_GUESS"
                }
              >
                Higher 🔼
              </button>
              <button
                onClick={() => feedback("lower")}
                disabled={
                  loading || userDone || aiDone || phase !== "AI_GUESS"
                }
              >
                Lower 🔽
              </button>
              <button
                className="correct"
                onClick={() => feedback("correct")}
                disabled={
                  loading || userDone || aiDone || phase !== "AI_GUESS"
                }
              >
                Correct ✅
              </button>
            </div>
          </div>
        </div>
      )}


      {/* RESULT */}
      {stage === "RESULT" && (
        <>
          <h2>🏆 Result</h2>

          <p className="winner-text">{winner}</p>

          <div className="result-buttons">
            <button onClick={restartGame} disabled={loading}>
              Play Again 🔄
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("GOODBYE");
              }}
              disabled={loading}
            >
              Stop Game ✖
            </button>
          </div>
        </>
      )}

      {/* GOODBYE / END SCREEN */}
      {stage === "GOODBYE" && (
        <>
          <h2>👋 Thanks for playing!</h2>
          <p className="winner-text">
            Have a great day! Come back any time for another number showdown.
          </p>
          <button
            onClick={() => {
              // Soft reset back to the intro screen
              setStage("START");
            }}
            disabled={loading}
          >
            Back to Home
          </button>
        </>
      )}
      </div>
    </div>
  );
}

export default App;