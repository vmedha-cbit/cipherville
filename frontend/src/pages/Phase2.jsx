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
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 z-0 opacity-10 fingerprint-bg" />
      <div className="absolute inset-0 z-0 grid-overlay opacity-20"></div>
      
      <SQLGuide />

      {/* Main Content - Always rendered */}
      <div className="min-h-screen px-6 py-10 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Card */}
          <div className="bg-card border-l-4 border-primary p-6 rounded-r-xl shadow-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              <span className="text-primary">PHASE 2:</span> SQL INVESTIGATION
            </h2>
            {story && (
              <div className="mt-4 space-y-2 text-muted-foreground border-l-2 border-border pl-4">
                <p className="text-foreground text-xl font-bold font-mono">{story.title}</p>
                <p className="font-mono text-sm leading-relaxed">{story.description}</p>
              </div>
            )}
            {officer?.name && <p className="text-sm text-primary mt-4 font-bold uppercase tracking-wider">Assigned Officer: {officer.name}</p>}
          </div>

          {/* Intro & Start */}
          {!started && (
              <div className="bg-card border border-primary/30 p-10 text-center rounded-xl shadow-[0_0_50px_rgba(255,59,59,0.1)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-[scan_3s_linear_infinite]"></div>
                  <p className="text-xl text-primary mb-8 font-mono tracking-wide">
                      "ACCESS GRANTED. INITIATE DATABASE QUERY PROTOCOLS."
                  </p>
                  <button
                      className="px-10 py-4 bg-primary text-primary-foreground font-bold rounded shadow-lg hover:bg-primary/90 hover:scale-105 transition-all uppercase tracking-widest text-lg group relative overflow-hidden"
                      onClick={() => setStarted(true)}
                  >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                      START INVESTIGATION
                  </button>
              </div>
          )}

          {/* Schema Card */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h3 className="text-xl font-bold text-foreground">DATABASE SCHEMA</h3>
              <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse delay-75"></div>
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-150"></div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-lg border border-border p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Available Tables</p>
                <div className="space-y-2">
                  {schema.length === 0 && <p className="text-muted-foreground text-sm">No tables found.</p>}
                  {schema.map((table) => (
                    <button
                      key={table.name}
                      className={`w-full text-left px-4 py-3 rounded border font-mono text-sm transition-all ${
                        selectedTable === table.name 
                            ? "border-secondary text-secondary bg-secondary/10 shadow-[0_0_10px_rgba(0,245,255,0.2)]" 
                            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      onClick={() => setSelectedTable(table.name)}
                    >
                      {table.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg border border-border p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Table Structure</p>
                {schema
                  .filter((table) => table.name === selectedTable)
                  .map((table) => (
                    <div key={table.name} className="space-y-0">
                      {table.columns.map((col) => (
                        <div key={col.name} className="flex items-center justify-between text-sm border-b border-border py-2 last:border-0 hover:bg-muted/50 px-2 transition-colors">
                          <span className="text-foreground font-mono">{col.name}</span>
                          <span className="text-primary text-xs font-bold">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                {!selectedTable && <p className="text-muted-foreground text-sm italic">Select a table to inspect schema.</p>}
              </div>
            </div>
          </div>

          {/* Questions and Console Layout - Only when investigation started and NOT all correct */}
          {started && !allCorrect && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border p-6 rounded-xl shadow-md h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">INTERROGATION LOG</h3>
                  <span className="text-xs font-bold px-3 py-1 bg-muted rounded-full text-muted-foreground border border-border">
                    PROGRESS: {correctIds.length}/{questions.length}
                  </span>
                </div>
                {loadingQuestions && <p className="text-muted-foreground animate-pulse">Loading directives...</p>}
                {!loadingQuestions && questions.length === 0 && (
                  <p className="text-muted-foreground">No directives found.</p>
                )}
                <div className="space-y-6">
                  {questions.map((q, idx) => {
                    const isCorrect = correctIds.includes(String(q.id));
                    const status = submissionStatus[q.id];
                    
                    return (
                      <div key={q.id} className={`bg-muted/20 border ${status === 'incorrect' ? 'border-destructive' : isCorrect ? 'border-green-500/50' : 'border-border'} rounded-lg p-5 transition-all duration-300 relative overflow-hidden group`}>
                         {/* Status Indicator Bar */}
                         <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCorrect ? 'bg-green-500' : status === 'incorrect' ? 'bg-destructive' : 'bg-muted-foreground/30'}`}></div>
                         
                        <p className="text-foreground font-semibold text-sm mb-3 pl-2">
                            <span className="text-secondary font-mono mr-2">Q{idx + 1}.</span>
                            {q.prompt}
                        </p>
                        
                        <div className="flex gap-2 pl-2">
                          <input
                            className={`flex-1 p-3 bg-background border ${status === 'incorrect' ? 'border-destructive text-destructive' : 'border-input text-foreground'} rounded text-sm focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all font-mono`}
                            placeholder="Input findings..."
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
                            className={`px-4 py-2 font-bold rounded text-xs uppercase tracking-wider transition-all shadow-md ${
                                isCorrect 
                                    ? "bg-green-600 text-white shadow-green-900/20" 
                                    : status === 'incorrect' 
                                        ? "bg-destructive text-destructive-foreground shadow-destructive/20" 
                                        : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                            }`}
                            onClick={() => submitAnswer(q.id)}
                            disabled={isCorrect}
                          >
                            {isCorrect ? "VERIFIED" : status === 'incorrect' ? "ERROR" : "SUBMIT"}
                          </button>
                        </div>
                        {status === 'incorrect' && (
                            <p className="text-destructive text-xs mt-2 font-bold pl-2 flex items-center gap-2">
                                <span>⚠</span> INCORRECT DATA. RE-ANALYZE.
                            </p>
                        )}
                        {isCorrect && (
                             <p className="text-green-500 text-xs mt-2 font-bold pl-2 flex items-center gap-2">
                                <span>✓</span> CONFIRMED.
                            </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl shadow-md flex flex-col h-full">
                <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                    <span className="text-xl">{'_>'}</span> CONSOLE
                </h3>
                
                <div className="flex-1 flex flex-col gap-4">
                    <div className="terminal w-full flex-1 bg-black border border-white/10 rounded-lg p-4 font-mono text-sm relative shadow-inner overflow-hidden min-h-[200px]">
                      <div className="absolute top-0 left-0 right-0 h-6 bg-white/5 flex items-center px-2 gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <textarea
                        className="w-full h-full bg-transparent outline-none text-green-400 font-mono text-sm pt-6 resize-none"
                        style={{ fontFamily: "'JetBrains Mono', 'Share Tech Mono', monospace" }}
                        value={sql}
                        onChange={(e) => setSql(e.target.value)}
                        placeholder="SELECT * FROM evidence LIMIT 5;"
                      />
                      {sql && (
                        <span className="sql-cursor absolute" style={{ 
                          left: `${(sql.length % 50) * 0.6}rem`, // Approximate cursor pos logic (flawed but decorative)
                          bottom: '1rem',
                          display: 'none' // Hide for now as positioning is tricky
                        }}></span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center bg-muted/20 p-2 rounded border border-border">
                         <span className="text-xs text-muted-foreground font-mono">STATUS: {loadingQuestions ? "BUSY" : "READY"}</span>
                         <button 
                            className="px-6 py-2 bg-secondary/10 border border-secondary text-secondary font-bold rounded hover:bg-secondary hover:text-secondary-foreground transition-all uppercase text-xs tracking-wider shadow-[0_0_10px_rgba(0,245,255,0.2)]" 
                            onClick={runQuery}
                         >
                            EXECUTE QUERY
                         </button>
                    </div>

                    {queryError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/50 rounded flex items-center gap-2">
                            <span className="text-destructive">⚠</span>
                            <p className="text-destructive text-xs font-mono">{queryError}</p>
                        </div>
                    )}
                    
                    <div className="bg-black/80 p-4 rounded border border-white/10 overflow-auto h-64 shadow-inner custom-scrollbar">
                      <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-widest mb-2 sticky top-0 bg-black/80 pb-2 border-b border-white/10 w-full">Output Stream</h4>
                      {result?.rows?.length ? (
                        <table className="w-full text-xs font-mono text-left border-collapse">
                          <thead>
                            <tr>
                              {result.columns.map((col) => (
                                <th key={col} className="p-2 border-b border-white/20 text-secondary sticky top-8 bg-black">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {result.rows.map((row, idx) => (
                              <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                {result.columns.map((col) => (
                                  <td key={col} className="p-2 text-gray-300">{String(row[col])}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground text-xs font-mono opacity-50">NO DATA RETURNED</p>
                        </div>
                      )}
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* All Correct Info - Show when all questions answered */}
          {allCorrect && (
            <div className="bg-card p-8 border-4 border-green-500/50 rounded-xl shadow-[0_0_50px_rgba(34,197,94,0.2)] animate-pulse">
              <div className="flex items-center gap-6">
                <div className="text-6xl text-green-500">✓</div>
                <div>
                  <h3 className="text-3xl font-bold text-green-400 tracking-wide">CASE RESOLVED</h3>
                  <p className="text-muted-foreground mt-2 font-mono">ALL DIRECTIVES COMPLETED ({correctIds.length}/{questions.length}).</p>
                  <p className="text-green-300 text-sm mt-4 font-bold uppercase">Proceed to final submission.</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/case")}
                className="mt-8 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-lg w-full shadow-lg shadow-green-900/30 transition-all transform hover:scale-[1.01]"
              >
                SUBMIT FINAL REPORT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Congratulations Modal - Full Screen Overlay on top */}
      {allCorrect && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-50 flex-col animate-fadeIn">
            <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10"></div>
          <div className="max-w-2xl w-full">
            <div className="relative overflow-hidden rounded-2xl border-2 border-green-500 shadow-[0_0_100px_rgba(34,197,94,0.3)] bg-card">
              <div className="absolute inset-0 scanline opacity-20"></div>
              
              <div className="relative z-10 p-16 text-center">
                <div className="mb-8 animate-bounce text-8xl">🎉</div>
                
                <h3 className="text-5xl font-bold text-green-500 mb-6 tracking-tight font-mono">
                  MISSION ACCOMPLISHED
                </h3>
                
                <p className="text-2xl text-foreground mb-4">
                  Investigation protocols complete.
                </p>
                
                <p className="text-lg text-muted-foreground mb-8">
                  Evidence analysis successful.
                </p>
                
                <div className="mb-10 inline-block bg-green-500/10 text-green-400 px-8 py-3 rounded-full font-bold text-lg border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  ✓ 100% ACCURACY ACHIEVED
                </div>
                
                <button
                  onClick={() => navigate("/case")}
                  className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg shadow-lg shadow-green-900/40 transition transform hover:scale-105 uppercase tracking-widest"
                >
                  FILE FINAL REPORT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
