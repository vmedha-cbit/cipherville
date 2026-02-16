import { useEffect, useState } from "react";
import api from "../../providers/api.js";
import AdminNav from "../../components/AdminNav.jsx";

const applyAdminToken = () => {
  const token = localStorage.getItem("cipherville-admin-token");
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
};

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);

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
    await api.post("/rooms");
    loadRooms();
  };

  const startRoom = async (roomId) => {
    applyAdminToken();
    await api.post(`/rooms/${roomId}/start`);
    loadRooms();
  };

  const endRoom = async (roomId) => {
    applyAdminToken();
    await api.post(`/rooms/${roomId}/end`);
    loadRooms();
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Room Management</h2>
          <button className="px-4 py-2 bg-ember text-black font-semibold rounded" onClick={createRoom}>Create Room</button>
        </div>
        <div className="mt-4">
          <AdminNav />
        </div>
        <div className="mt-6 space-y-3">
          {rooms.map((room) => (
            <div key={room.roomId} className="bg-steel/70 p-4 rounded border border-white/10 flex items-center justify-between">
              <div>
                <p className="font-semibold">{room.roomId}</p>
                <p className="text-haze text-sm">{room.status} | {room.currentPhase}</p>
              </div>
              <div className="space-x-2">
                <button className="px-3 py-2 bg-slate-700 rounded" onClick={() => startRoom(room.roomId)}>Start</button>
                <button className="px-3 py-2 bg-slate-700 rounded" onClick={() => endRoom(room.roomId)}>End</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
