import { useEffect, useMemo, useState } from "react";
import api from "../providers/api.js";
import { useNavigate } from "react-router-dom";
import { useTimer } from "../providers/timerContext.jsx";

export default function Phase2() {
  const navigate = useNavigate();
  const { timeRemaining, getElapsedTime } = useTimer();
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
      saveProgressToBackend("phase2-complete");
      setProgressSaved(true);
    }
  }, [allCorrect, progressSaved]);

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
    setError("");
    try {
      const { data } = await api.post("/participants/phase2/answer", {
        questionId,
        answer: answers[questionId] || ""
      });
      if (data.correct) {
        setCorrectIds((prev) => Array.from(new Set([...prev, String(questionId)])));
      }
    } catch (err) {
      setError(err.response?.data?.error || "Answer check failed");
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="film-grain" />
      <div className="min-h-screen px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
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

        <div className="evidence-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Database Schema</h3>
            {!started && (
              <button
                className="btn-investigate px-5 py-2"
                onClick={() => setStarted(true)}
              >
                Start Investigation
              </button>
            )}
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

        {allCorrect ? (
          <div className="fixed inset-0 flex items-center justify-center p-6 z-50">
            <div className="max-w-2xl w-full">
              <div className="relative overflow-hidden rounded-2xl border-4 border-emerald-500 shadow-2xl bg-gradient-to-b from-emerald-950/90 to-emerald-900/90 backdrop-blur">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-green-800/40 to-emerald-900/40 animate-pulse"></div>
                
                {/* Content */}
                <div className="relative z-10 p-16 text-center">
                  <div className="mb-8 animate-bounce">
                    <span className="text-8xl">🎉</span>
                  </div>
                  <h3 className="text-5xl font-bold bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-400 bg-clip-text text-transparent mb-6">Congratulations!</h3>
                  <p className="text-2xl text-emerald-100 mb-4">You've successfully answered all questions!</p>
                  <p className="text-lg text-emerald-200/90 mb-8">Your investigation skills are impressive. Ready to submit your case?</p>
                  
                  {/* Success Badge */}
                  <div className="mb-8 inline-block bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg animate-pulse border-2 border-emerald-400">
                    ✓ ALL QUESTIONS CORRECT ({correctIds.length}/{questions.length})
                  </div>

                  {/* Proceed Button */}
                  <button
                    onClick={() => navigate("/case")}
                    className="mt-8 px-8 py-4 btn-investigate bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg"
                  >
                    Proceed to Case Submission
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

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
                  return (
                    <div key={q.id} className="bg-ink/70 border border-white/10 rounded-lg p-4">
                      <p className="text-white font-semibold">Q{idx + 1}. {q.prompt}</p>
                      <div className="mt-3 flex gap-2">
                        <input
                          className="flex-1 p-2 bg-black/60 border border-white/10 rounded text-white"
                          placeholder="Type your answer"
                          value={answers[q.id] || ""}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                          disabled={isCorrect}
                        />
                        <button
                          className="px-4 py-2 bg-ember text-black font-semibold rounded disabled:opacity-50"
                          onClick={() => submitAnswer(q.id)}
                          disabled={isCorrect}
                        >
                          {isCorrect ? "Correct" : "Check"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {error && <p className="text-ember text-sm mt-3">{error}</p>}
            </div>

            <div className="evidence-card p-6">
              <h3 className="text-xl font-semibold mb-3">Investigation Console</h3>
              <div className="terminal p-4 rounded border border-white/10">
                <textarea
                  className="w-full h-40 bg-transparent outline-none text-green-400"
                  value={sql}
                  onChange={(e) => setSql(e.target.value)}
                />
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

        {!allCorrect && (
          <div className="flex justify-end">
            <button
              className="btn-investigate px-6 py-3 disabled:opacity-50"
              onClick={() => navigate("/case")}
              disabled={!allCorrect}
            >
              Submit Case
            </button>
          </div>
        )}
      </div>
    </div>

  );
}
