import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "../stores/authStore";

export default function ProfileViewModal({ title, isOpen, onClose, profileId }) {
  const { authorizedFetch, userId } = useAuth();
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  // Mock or real fetch
  const fetchProfileDetails = async (id) => {
    try {
      const res = await authorizedFetch(`/api/rules/${userId}/${id}`);
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();

      console.log(data)
      setProfile(data);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch profile details.");
    }
  };

  useEffect(() => {
    if (isOpen && profileId) {
      fetchProfileDetails(profileId);
    }
  }, [isOpen, profileId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-h-[85vh] overflow-y-auto bg-secondary border border-border rounded-2xl shadow-xl w-[90%] max-w-md p-6">
        {error && (
          <div className="flex items-center justify-between bg-destructive/15 border border-destructive text-destructive px-4 py-2 rounded-md mb-3 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium">Error: {error}</span>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded-md hover:bg-destructive/20 transition"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <h2 className="text-xl font-semibold text-foreground mb-4">Ruleset</h2>

        {!profile ? (
          <p className="text-foreground/70 italic">Loading profile...</p>
        ) : (
          <div className="flex flex-col gap-4 text-sm text-foreground">
            <div>
              <p className="font-medium">Name</p>
              <span className="block mt-1 p-2 rounded-lg bg-input border border-border">
                {title || "—"}
              </span>
            </div>

            <div>
              <p className="font-medium">Model</p>
              <span className="block mt-1 p-2 rounded-lg bg-input border border-border">
                {profile.model || "—"}
              </span>
            </div>

            <div>
              <p className="font-medium">Use Case</p>
              <span className="block mt-1 p-2 rounded-lg bg-input border border-border">
                {(profile.ruleset.targetAudience != undefined ? "Documentation Creation" : "Coding Assistance") || "—"}
              </span>
            </div>

            {profile.ruleset.targetAudience == undefined && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-foreground/80">
                  Coding Settings
                </h3>
                <div>
                  <p className="font-medium">Preferred Language</p>
                  <span className="block mt-1 p-2 rounded-lg bg-input border border-border">
                    {profile.ruleset?.preferredLanguage || "—"}
                  </span>
                </div>

                <div>
                  <p className="font-medium">Spacing Rules</p>
                  <span className="block mt-1 p-2 rounded-lg bg-input border border-border">
                    {profile.ruleset?.spacingInstruction || "—"}
                  </span>
                </div>

                <div>
                  <p className="font-medium">Commenting Rules</p>
                  <span className="block mt-1 p-2 rounded-lg bg-input border border-border whitespace-pre-wrap">
                    {profile.ruleset?.commentingRules || "—"}
                  </span>
                </div>
              </div>
            )}

            {profile.ruleset.targetAudience != undefined && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium text-foreground/80">
                  Documentation Options
                </h3>
                <div>
                  <p className="font-medium">Target Audience</p>
                  <span className="block mt-1 p-2 rounded-lg bg-input border border-border">
                    {profile.ruleset?.targetAudience || "—"}
                  </span>
                </div>
              </div>
            )}

            <div>
              <p className="font-medium">Other Instructions</p>
              <span className="block mt-1 p-2 rounded-lg bg-input border border-border whitespace-pre-wrap">
                {profile.ruleset?.otherInstructions || "—"}
              </span>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-border hover:bg-border/80 transition text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
