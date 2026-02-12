// components/NavItem.jsx
import { NavLink } from "react-router-dom";

export default function NavItem({ icon, label, to }) {
  return (
    <NavLink
      to={to}
      
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 whiteColor rounded-lg hover:bg-violet-500/20 ${
          isActive ? "bg-violet-500/30 font-bold" : ""
        }`
      }
    >
      <i className={`fas ${icon}`}></i>
      {label}
    </NavLink>
  );
}
