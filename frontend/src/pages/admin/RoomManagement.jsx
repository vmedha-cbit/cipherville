import { useEffect, useState } from "react";
import api from "../../providers/api.js";
import AdminNav from "../../components/AdminNav.jsx";

const applyAdminToken = () => {
  // Token is managed by api.js, not localStorage
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
};

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30); // Default 30 minutes
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomMembers, setRoomMembers] = useState([]);

  const loadRooms = async () => {
    applyAdminToken();
    const { data } = await api.get("/rooms");
    setRooms(data);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const createRoom = async () => {
    applyAdminToken();
    await api.post("/rooms", { timerDuration: timerDuration * 60 }); // Convert minutes to seconds
    setShowCreateModal(false);
    setTimerDuration(30);
    loadRooms();
  };

  const startRoom = async (roomId) => {
    applyAdminToken();
    await api.post(`/rooms/${roomId}/start`);
    loadRooms();
  };

  const endRoom = async (roomId) => {
    if (!confirm(`Are you sure you want to end room ${roomId}? All participants will be kicked out.`)) {
      return;
    }
    applyAdminToken();
    await api.post(`/rooms/${roomId}/end`);
    loadRooms();
  };

  const viewMembers = async (roomId) => {
    applyAdminToken();
    const { data } = await api.get(`/rooms/${roomId}/players`);
    setRoomMembers(data);
    setSelectedRoom(roomId);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen px-6 py-10 film-grain">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            Room Management
          </h2>
          <button 
            className="px-6 py-3 btn-investigate text-black font-bold rounded-lg shadow-lg"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Room
          </button>
        </div>
        
        <div className="mt-4">
          <AdminNav />
        </div>

        {/* Create Room Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="evidence-card p-8 rounded-xl max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-amber-500 mb-6">Create New Room</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-amber-400 font-semibold">Timer Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(parseInt(e.target.value) || 30)}
                    className="w-full mt-2 p-3 bg-black/60 border-2 border-white/20 rounded-lg text-white font-mono text-xl focus:border-amber-500 outline-none"
                  />
                  <p className="text-haze text-xs mt-1">Participants will have {timerDuration} minutes to solve the case</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={createRoom}
                  className="flex-1 px-4 py-3 btn-investigate text-black font-bold rounded-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members Modal */}
        {selectedRoom && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="evidence-card p-8 rounded-xl max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-500">Room {selectedRoom} Members</h3>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-haze hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {roomMembers.length === 0 ? (
                  <p className="text-haze">No participants yet</p>
                ) : (
                  roomMembers.map((member, idx) => (
                    <div key={member._id || idx} className="bg-black/40 p-4 rounded-lg border border-white/10">
                      <p className="text-white font-semibold">{member.rollNumber}</p>
                      <p className="text-haze text-sm">Phase: {member.phase}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {rooms.length === 0 ? (
            <div className="evidence-card p-8 text-center">
              <p className="text-haze">No rooms created yet. Create one to get started!</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div key={room.roomId} className="evidence-card p-5 rounded-xl flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-bold text-xl text-amber-500">{room.roomId}</p>
                  <div className="flex gap-4 mt-2">
                    <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                      room.status === 'started' ? 'bg-green-900/30 text-green-400' :
                      room.status === 'ended' ? 'bg-red-900/30 text-red-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {room.status.toUpperCase()}
                    </span>
                    <span className="text-haze text-sm">⏱ {formatTimer(room.timerDuration || 1800)}</span>
                    <span className="text-haze text-sm">👥 {room.participants?.length || 0} players</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:opacity-50"
                    onClick={() => viewMembers(room.roomId)}
                  >
                    View Members
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 disabled:opacity-50"
                    onClick={() => startRoom(room.roomId)}
                    disabled={room.status === 'started' || room.status === 'ended'}
                  >
                    Start
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 disabled:opacity-50"
                    onClick={() => endRoom(room.roomId)}
                    disabled={room.status === 'ended'}
                  >
                    End
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
