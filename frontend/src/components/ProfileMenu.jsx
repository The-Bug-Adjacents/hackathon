import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

export default function ProfileMenu({ onView }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
        <button
        onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full text-foreground/50 hover:bg-border transition"
        >
            <MoreVertical size={16} strokeWidth={2}/>
        </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-secondary border border-border rounded-lg shadow-lg z-50">
          <button
            onClick={onView}
            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-border"
          >
            View Rules
          </button>
          {/* <button
            onClick={onEdit}
            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-border"
          >
            Edit Profile
          </button>
          <button
            onClick={onDelete}
            className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-border"
          >
            Delete
          </button> */}
        </div>
      )}
    </div>
  );
}