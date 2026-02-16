import { useEffect, useState } from "react";
import api from "../../providers/api.js";
import AdminNav from "../../components/AdminNav.jsx";

const applyAdminToken = () => {
  const token = localStorage.getItem("cipherville-admin-token");
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
};

export default function StoryManagement() {
  const [stories, setStories] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", sqliteTemplateId: "", criminalName: "" });
  const [questionForms, setQuestionForms] = useState({});
  const [bulkJsons, setBulkJsons] = useState({});

  const load = async () => {
    applyAdminToken();
    const { data } = await api.get("/stories");
    setStories(data);
  };

  useEffect(() => {
    load();
  }, []);

  const createStory = async (e) => {
    e.preventDefault();
    applyAdminToken();
    await api.post("/stories", form);
    setForm({ title: "", description: "", sqliteTemplateId: "", criminalName: "" });
    load();
  };

  const uploadSqlite = async (storyId, file) => {
    applyAdminToken();
    const formData = new FormData();
    formData.append("file", file);
    await api.post(`/uploads/sqlite-template/${storyId}`, formData);
  };

  const addQuestion = async (storyId) => {
    const current = questionForms[storyId] || { prompt: "", answer: "" };
    if (!current.prompt || !current.answer) return;
    applyAdminToken();
    await api.post(`/stories/${storyId}/questions`, current);
    setQuestionForms({ ...questionForms, [storyId]: { prompt: "", answer: "" } });
    load();
  };

  const deleteQuestion = async (storyId, questionId) => {
    applyAdminToken();
    await api.delete(`/stories/${storyId}/questions/${questionId}`);
    load();
  };

  const deleteStory = async (storyId) => {
    if (!confirm("Delete this story?")) return;
    applyAdminToken();
    await api.delete(`/stories/${storyId}`);
    load();
  };

  const bulkImportQuestions = async (storyId) => {
    const jsonText = bulkJsons[storyId] || "";
    if (!jsonText.trim()) {
      alert("Please paste JSON questions");
      return;
    }
    try {
      const questions = JSON.parse(jsonText);
      if (!Array.isArray(questions)) {
        alert("JSON must be an array of questions");
        return;
      }
      applyAdminToken();
      const { data } = await api.post(`/stories/${storyId}/questions/bulk`, { questions });
      alert(`${data.count} questions imported!`);
      setBulkJsons({ ...bulkJsons, [storyId]: "" });
      load();
    } catch (parseErr) {
      alert("Invalid JSON: " + parseErr.message);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold">Story Management</h2>
        <AdminNav />
        <form className="bg-steel/70 p-4 rounded border border-white/10 grid md:grid-cols-2 gap-3" onSubmit={createStory}>
          <input className="p-2 bg-ink border border-white/10 rounded text-white" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="p-2 bg-ink border border-white/10 rounded text-white" placeholder="SQLite Template ID" value={form.sqliteTemplateId} onChange={(e) => setForm({ ...form, sqliteTemplateId: e.target.value })} />
          <input className="p-2 bg-ink border border-white/10 rounded text-white" placeholder="Criminal Name" value={form.criminalName} onChange={(e) => setForm({ ...form, criminalName: e.target.value })} required />
          <textarea className="p-2 bg-ink border border-white/10 rounded md:col-span-2 text-white" placeholder="Case Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <button className="px-4 py-2 bg-ember text-black font-semibold rounded">Create</button>
        </form>

        <div className="space-y-3">
          {stories.map((story) => (
            <div key={story._id} className="bg-steel/70 p-4 rounded border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{story.title}</p>
                  <p className="text-haze text-sm">Criminal: {story.criminalName}</p>
                </div>
                <button
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded"
                  onClick={() => deleteStory(story._id)}
                >
                  Delete
                </button>
              </div>
              <div className="mt-3 flex flex-col md:flex-row gap-3">
                <input type="file" className="text-sm" onChange={(e) => uploadSqlite(story.sqliteTemplateId || story._id, e.target.files[0])} />
              </div>

              <div className="mt-4 bg-ink/70 border border-white/10 rounded p-3">
                <p className="text-sm text-haze mb-2">Questions</p>
                <div className="space-y-2">
                  {(story.questions || []).map((q) => (
                    <div key={q._id} className="flex items-center justify-between gap-3">
                      <div className="text-sm">
                        <p className="text-white">{q.prompt}</p>
                        <p className="text-haze">Answer: {q.answer}</p>
                      </div>
                      <button
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                        onClick={() => deleteQuestion(story._id, q._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {(!story.questions || story.questions.length === 0) && (
                    <p className="text-haze text-sm">No questions yet.</p>
                  )}
                </div>

                <div className="mt-3 grid md:grid-cols-2 gap-2">
                  <input
                    className="p-2 bg-black/70 border border-white/10 rounded text-white text-sm"
                    placeholder="Question prompt"
                    value={(questionForms[story._id]?.prompt || "")}
                    onChange={(e) => setQuestionForms({
                      ...questionForms,
                      [story._id]: { ...questionForms[story._id], prompt: e.target.value }
                    })}
                  />
                  <input
                    className="p-2 bg-black/70 border border-white/10 rounded text-white text-sm"
                    placeholder="Answer"
                    value={(questionForms[story._id]?.answer || "")}
                    onChange={(e) => setQuestionForms({
                      ...questionForms,
                      [story._id]: { ...questionForms[story._id], answer: e.target.value }
                    })}
                  />
                </div>
                <button
                  className="mt-2 px-3 py-2 bg-ember text-black text-sm font-semibold rounded"
                  onClick={() => addQuestion(story._id)}
                >
                  Add Question
                </button>

                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-sm text-haze mb-2">📥 Bulk Import Questions (JSON)</p>
                  <textarea
                    className="w-full bg-black/70 border border-white/10 rounded text-white text-xs p-2"
                    placeholder='[{"prompt":"Question 1?","answer":"Answer 1"},{"prompt":"Question 2?","answer":"Answer 2"}]'
                    value={bulkJsons[story._id] || ""}
                    onChange={(e) => setBulkJsons({ ...bulkJsons, [story._id]: e.target.value })}
                    rows={3}
                  />
                  <button
                    className="mt-2 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded"
                    onClick={() => bulkImportQuestions(story._id)}
                  >
                    Import from JSON
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
