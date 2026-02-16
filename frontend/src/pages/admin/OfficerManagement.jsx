import { useEffect, useState } from "react";
import api from "../../providers/api.js";
import AdminNav from "../../components/AdminNav.jsx";

const applyAdminToken = () => {
  const token = localStorage.getItem("cipherville-admin-token");
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
};

export default function OfficerManagement() {
  const [officers, setOfficers] = useState([]);
  const [form, setForm] = useState({ 
    name: "", 
    dob: "", 
    background: "", 
    lastCase: "", 
    jumbledWord: "", 
    answer: "",
    puzzleFolder: "",
    storyId: "" 
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    applyAdminToken();
    try {
      const { data } = await api.get("/admin/officers");
      setOfficers(data);
    } catch (err) {
      console.error("Error loading officers:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    applyAdminToken();
    try {
      if (editingId) {
        await api.patch(`/admin/officers/${editingId}`, form);
        setEditingId(null);
      } else {
        await api.post("/admin/officers", form);
      }
      setForm({ 
        name: "", 
        dob: "", 
        background: "", 
        lastCase: "", 
        jumbledWord: "", 
        answer: "",
        puzzleFolder: "",
        storyId: "" 
      });
      load();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to save officer");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (officer) => {
    setEditingId(officer._id);
    setForm(officer);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this officer?")) return;
    applyAdminToken();
    try {
      await api.delete(`/admin/officers/${id}`);
      load();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to delete officer");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ 
      name: "", 
      dob: "", 
      background: "", 
      lastCase: "", 
      jumbledWord: "", 
      answer: "",
      puzzleFolder: "",
      storyId: "" 
    });
  };

  const seedOfficersData = async () => {
    if (!confirm("This will replace all existing officer data with 10 default officers. Continue?")) return;
    setLoading(true);
    applyAdminToken();
    try {
      const res = await api.post("/admin/seed-officers");
      alert(res.data.message);
      load();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to seed officers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Officer Management</h2>
          <button
            onClick={seedOfficersData}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            🌱 Seed Officers (10)
          </button>
        </div>
        <AdminNav />

        {/* Form */}
        <form className="bg-steel/70 p-6 rounded border border-white/10 space-y-4" onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold">{editingId ? "Edit Officer" : "Add New Officer"}</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input 
              className="p-3 bg-ink border border-white/10 rounded text-white" 
              placeholder="Name" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
            />
            <input 
              className="p-3 bg-ink border border-white/10 rounded text-white" 
              placeholder="DOB (DDMMYYYY)" 
              value={form.dob} 
              onChange={(e) => setForm({ ...form, dob: e.target.value })} 
              required 
            />
            <input 
              className="p-3 bg-ink border border-white/10 rounded text-white" 
              placeholder="Jumbled Word" 
              value={form.jumbledWord} 
              onChange={(e) => setForm({ ...form, jumbledWord: e.target.value })} 
              required 
            />
            <input 
              className="p-3 bg-ink border border-white/10 rounded text-white" 
              placeholder="Answer" 
              value={form.answer} 
              onChange={(e) => setForm({ ...form, answer: e.target.value })} 
              required 
            />
            <input 
              className="p-3 bg-ink border border-white/10 rounded text-white" 
              placeholder="Puzzle Folder (puzzle1-10)" 
              value={form.puzzleFolder} 
              onChange={(e) => setForm({ ...form, puzzleFolder: e.target.value })} 
              required 
            />
            <input 
              className="p-3 bg-ink border border-white/10 rounded text-white" 
              placeholder="Background" 
              value={form.background} 
              onChange={(e) => setForm({ ...form, background: e.target.value })} 
            />
            <input 
              className="p-3 bg-ink border border-white/10 rounded text-white" 
              placeholder="Last Case" 
              value={form.lastCase} 
              onChange={(e) => setForm({ ...form, lastCase: e.target.value })} 
            />
            <input 
              className="p-3 bg-ink border border-white/10 rounded text-white" 
              placeholder="Story ID" 
              value={form.storyId} 
              onChange={(e) => setForm({ ...form, storyId: e.target.value })} 
            />
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-ember text-black font-semibold rounded hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : editingId ? "Update Officer" : "Create Officer"}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Officers List */}
        <div className="">
          <h3 className="text-lg font-semibold mb-4">All Officers ({officers.length})</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {officers.map((officer) => (
              <div key={officer._id} className="bg-steel/70 p-4 rounded border border-white/10 space-y-3">
                <div>
                  <p className="font-bold text-ember">{officer.name}</p>
                  <p className="text-haze text-sm">DOB: {officer.dob}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  {officer.jumbledWord && (
                    <p className="text-haze">
                      <span className="text-white font-semibold">Jumbled:</span> {officer.jumbledWord}
                    </p>
                  )}
                  {officer.answer && (
                    <p className="text-haze">
                      <span className="text-white font-semibold">Answer:</span> {officer.answer}
                    </p>
                  )}
                  {officer.puzzleFolder && (
                    <p className="text-haze">
                      <span className="text-white font-semibold">Puzzle:</span> {officer.puzzleFolder}
                    </p>
                  )}
                  {officer.background && (
                    <p className="text-haze">
                      <span className="text-white font-semibold">Background:</span> {officer.background.substring(0, 50)}...
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleEdit(officer)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(officer._id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {officers.length === 0 && (
            <div className="bg-steel/70 p-8 rounded border border-white/10 text-center">
              <p className="text-haze">No officers found. Click "Seed Officers" to load the 10 default officers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
