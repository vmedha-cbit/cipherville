import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/rooms", label: "Rooms" },
  { to: "/admin/officers", label: "Officers" },
  { to: "/admin/stories", label: "Stories" },
  { to: "/admin/analytics", label: "Analytics" }
];

export default function AdminNav() {
  const location = useLocation();

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active = location.pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-2 rounded border ${active ? "bg-ember text-black border-ember" : "bg-ink border-white/10 text-haze"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
