import { useEffect, useMemo, useState } from "react";
import api from "../providers/api.js";
import { useNavigate } from "react-router-dom";
import { useTimer } from "../providers/timerContext.jsx";
import SQLGuide from "../components/SQLGuide.jsx";
import TimerDisplay from "../components/TimerDisplay.jsx";

export default function Phase2() {
  const navigate = useNavigate();
  const { timeRemaining, getElapsedTime, pauseTimer, isExpired } = useTimer();
  const [story, setStory] = useState(null);
  const [officer, setOfficer] = useState(null);
  const [schema, setSchema] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [correctIds, setCorrectIds] = useState([]);
  const [sql, setSql] = useState("SELECT * FROM evidence LIMIT 5");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [queryError, setQueryError] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState({}); // { [questionId]: 'correct' | 'incorrect' }

  const storyId = useMemo(() => story?.sqliteTemplateId || story?._id, [story]);
  const allCorrect = questions.length > 0 && correctIds.length === questions.length;

  // Save progress helper
  const saveProgressToBackend = async (subphase) => {
    try {
      await api.post("/participants/save-progress", {
        subphase,
        timeRemaining: timeRemaining || 0,
        timeElapsed: getElapsedTime()
      });
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/participants/story");
      setStory(data.story);
      setOfficer(data.officer);
      // Update backend progress: phase 2, subphase 1, lastVisitedRoute
      await api.post("/participants/progress/update", {
        currentPhase: 2,
        currentSubphase: 1,
        lastVisitedRoute: "/phase2"
      });
    };
    load();
  }, []);

  useEffect(() => {
    const loadSchema = async () => {
      if (!storyId) return;
      const { data } = await api.get(`/sql/schema?storyId=${storyId}`);
      setSchema(data.tables || []);
      if (data.tables?.length) {
        setSelectedTable(data.tables[0].name);
      }
    };
    loadSchema();
  }, [storyId]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!started) return;
      setLoadingQuestions(true);
      try {
        const { data } = await api.get("/participants/phase2/questions");
        setQuestions(data.questions || []);
        setCorrectIds((data.correct || []).map(String));
      } finally {
        setLoadingQuestions(false);
      }
    };
    loadQuestions();
  }, [started]);

  // Save progress when all questions are answered correctly
  useEffect(() => {
    if (allCorrect && !progressSaved) {
      // Update backend progress: phase 2, subphase 2, lastVisitedRoute
      api.post("/participants/progress/update", {
        currentPhase: 2,
        currentSubphase: 2,
        lastVisitedRoute: "/case"
      });
      saveProgressToBackend("phase2-complete");
      setProgressSaved(true);
      // Pause timer when congratulations appears
      pauseTimer();
    }
  }, [allCorrect, progressSaved, pauseTimer]);

  // Handle timeout - save progress
  useEffect(() => {
    if (isExpired) {
      const saveTimeout = async () => {
        try {
          await api.post("/participants/end-game", { reason: "timeout" });
        } catch (err) {
          console.error("Failed to end game:", err);
        }
      };
      saveTimeout();
    }
  }, [isExpired]);

  const runQuery = async () => {
    setQueryError("");
    try {
      const { data } = await api.post("/sql/query", { storyId, sql });
      setResult(data);
    } catch (err) {
      setQueryError(err.response?.data?.error || "Query failed");
    }
  };

  const submitAnswer = async (questionId) => {
    // Clear previous status for this question
    setSubmissionStatus(prev => ({ ...prev, [questionId]: null }));
    setError("");
    
    try {
      const { data } = await api.post("/participants/phase2/answer", {
        questionId,
        answer: answers[questionId] || ""
      });
      
      if (data.correct) {
        setCorrectIds((prev) => Array.from(new Set([...prev, String(questionId)])));
        setSubmissionStatus(prev => ({ ...prev, [questionId]: 'correct' }));
      } else {
        setSubmissionStatus(prev => ({ ...prev, [questionId]: 'incorrect' }));
        // Also clear incorrect status after 3 seconds
        setTimeout(() => {
             setSubmissionStatus(prev => ({ ...prev, [questionId]: null }));
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Answer check failed");
    }
  };

  return (
    <div className="min-h-screen relative">
      <SQLGuide />
      <div className="film-grain" />
      
      <TimerDisplay />

      {/* Main Content - Always rendered */}
      <div className="min-h-screen px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Card */}
          <div className="evidence-card p-6">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
              Phase 2: SQL Investigation
            </h2>
            {story && (
              <div className="mt-4 space-y-2 text-haze">
                <p className="text-white text-lg font-semibold">{story.title}</p>
                <p>{story.description}</p>
              </div>
            )}
            {officer?.name && <p className="text-sm text-haze mt-2">Assigned Officer: {officer.name}</p>}
          </div>

          {/* Intro & Start */}
          {!started && (
              <div className="evidence-card p-8 text-center border border-amber-500/30 bg-black/40">
                  <p className="text-xl text-amber-100 mb-6 font-mono">
                      "Now solve this case by querying the database evidence."
                  </p>
                  <button
                      className="btn-investigate px-8 py-4 text-lg font-bold shadow-lg shadow-amber-900/20 transform hover:scale-105 transition-all"
                      onClick={() => setStarted(true)}
                  >
                      START INVESTIGATION
                  </button>
              </div>
          )}

          {/* Schema Card */}
          <div className="evidence-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Database Schema</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="bg-ink/70 rounded-lg border border-white/10 p-4">
                <p className="text-sm text-haze mb-3">Tables</p>
                <div className="space-y-2">
                  {schema.length === 0 && <p className="text-haze">No tables found.</p>}
                  {schema.map((table) => (
                    <button
                      key={table.name}
                      className={`w-full text-left px-3 py-2 rounded border ${
                        selectedTable === table.name ? "border-ember text-white bg-ember/10" : "border-white/10 text-haze"
                      }`}
                      onClick={() => setSelectedTable(table.name)}
                    >
                      {table.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-ink/70 rounded-lg border border-white/10 p-4">
                <p className="text-sm text-haze mb-3">Fields</p>
                {schema
                  .filter((table) => table.name === selectedTable)
                  .map((table) => (
                    <div key={table.name} className="space-y-2">
                      {table.columns.map((col) => (
                        <div key={col.name} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                          <span className="text-white">{col.name}</span>
                          <span className="text-haze">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                {!selectedTable && <p className="text-haze">Select a table to view fields.</p>}
              </div>
            </div>
          </div>

          {/* Questions and Console Layout - Only when investigation started and NOT all correct */}
          {started && !allCorrect && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="evidence-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Questions</h3>
                  <span className="text-sm text-haze">
                    {correctIds.length}/{questions.length} answered
                  </span>
                </div>
                {loadingQuestions && <p className="text-haze">Loading questions...</p>}
                {!loadingQuestions && questions.length === 0 && (
                  <p className="text-haze">No questions added yet.</p>
                )}
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const isCorrect = correctIds.includes(String(q.id));
                    const status = submissionStatus[q.id];
                    
                    return (
                      <div key={q.id} className={`bg-ink/70 border ${status === 'incorrect' ? 'border-red-500 animate-pulse' : 'border-white/10'} rounded-lg p-4 transition-all duration-300`}>
                        <p className="text-white font-semibold">Q{idx + 1}. {q.prompt}</p>
                        <div className="mt-3 flex gap-2">
                          <input
                            className={`flex-1 p-2 bg-black/60 border ${status === 'incorrect' ? 'border-red-500 text-red-300' : 'border-white/10 text-white'} rounded transition-colors`}
                            placeholder="Type your answer"
                            value={answers[q.id] || ""}
                            onChange={(e) => {
                                setAnswers({ ...answers, [q.id]: e.target.value });
                                if (submissionStatus[q.id]) {
                                    setSubmissionStatus(prev => ({ ...prev, [q.id]: null }));
                                }
                            }}
                            disabled={isCorrect}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !isCorrect) {
                                    submitAnswer(q.id);
                                }
                            }}
                          />
                          <button
                            className={`px-4 py-2 font-semibold rounded disabled:opacity-50 transition-all ${
                                isCorrect 
                                    ? "bg-emerald-600 text-white" 
                                    : status === 'incorrect' 
                                        ? "bg-red-600 text-white" 
                                        : "bg-ember text-black"
                            }`}
                            onClick={() => submitAnswer(q.id)}
                            disabled={isCorrect}
                          >
                            {isCorrect ? "Correct ✓" : status === 'incorrect' ? "Wrong ✖" : "Check"}
                          </button>
                        </div>
                        {status === 'incorrect' && (
                            <p className="text-red-400 text-xs mt-2 font-bold animate-bounce">
                                ⚠ Incorrect answer. Try again.
                            </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="evidence-card p-6">
                <h3 className="text-xl font-semibold mb-3">Investigation Console</h3>
                <div className="terminal p-4 rounded border border-white/10">
                  <div className="relative">
                    <textarea
                      className="w-full h-40 bg-transparent outline-none text-green-400 font-mono text-sm"
                      style={{ fontFamily: "'JetBrains Mono', 'Share Tech Mono', monospace" }}
                      value={sql}
                      onChange={(e) => setSql(e.target.value)}
                      placeholder="SELECT * FROM evidence LIMIT 5;"
                    />
                    {sql && (
                      <span className="sql-cursor absolute" style={{ 
                        left: `${sql.length * 0.6}ch`,
                        top: '1rem'
                      }}></span>
                    )}
                  </div>
                  <button className="mt-4 btn-investigate px-4 py-2" onClick={runQuery}>
                    Run Query
                  </button>
                  {queryError && <p className="text-ember text-sm mt-2">{queryError}</p>}
                </div>
                <div className="bg-ink/70 p-4 rounded border border-white/10 overflow-auto mt-4">
                  <h4 className="font-semibold">Result</h4>
                  {result?.rows?.length ? (
                    <table className="w-full text-sm mt-3">
                      <thead>
                        <tr>
                          {result.columns.map((col) => (
                            <th key={col} className="text-left border-b border-white/10 pb-2">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, idx) => (
                          <tr key={idx} className="border-b border-white/5">
                            {result.columns.map((col) => (
                              <td key={col} className="py-2 pr-3 text-haze">{String(row[col])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-haze mt-3">No rows yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* All Correct Info - Show when all questions answered */}
          {allCorrect && (
            <div className="evidence-card p-6 border-4 border-emerald-500">
              <div className="flex items-center gap-4">
                <div className="text-5xl">✓</div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-400">All Questions Answered Correctly!</h3>
                  <p className="text-haze mt-1">You've answered {correctIds.length}/{questions.length} questions correctly.</p>
                  <p className="text-emerald-300 text-sm mt-2">Click the button below to proceed to case submission.</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/case")}
                className="mt-6 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-lg w-full"
              >
                Proceed to Case Submission
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Congratulations Modal - Full Screen Overlay on top */}
      {allCorrect && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-40 flex-col">
          <div className="max-w-2xl w-full">
            <div className="relative overflow-hidden rounded-2xl border-4 border-emerald-500 shadow-2xl bg-gradient-to-b from-emerald-950/95 to-emerald-900/95 backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-green-800/40 to-emerald-900/40 animate-pulse"></div>
              
              <div className="relative z-10 p-16 text-center">
                <div className="mb-8 animate-bounce text-8xl">🎉</div>
                
                <h3 className="text-5xl font-bold bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-400 bg-clip-text text-transparent mb-6">
                  Congratulations!
                </h3>
                
                <p className="text-2xl text-emerald-100 mb-4">
                  You've successfully answered all questions!
                </p>
                
                <p className="text-lg text-emerald-200/90 mb-8">
                  Your investigation skills are impressive.
                </p>
                
                <div className="mb-8 inline-block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg border-2 border-emerald-400">
                  ✓ ALL QUESTIONS CORRECT ({correctIds.length}/{questions.length})
                </div>
                
                <p className="text-emerald-200 mb-8">
                  Ready to submit your case and complete the investigation?
                </p>
                
                <button
                  onClick={() => navigate("/case")}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-lg shadow-lg transition transform hover:scale-105"
                >
                  Proceed to Case Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
