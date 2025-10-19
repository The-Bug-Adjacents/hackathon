import { useEffect, useState } from "react";
import { useAuth } from "../stores/authStore";

import { Plus } from "lucide-react";
import Box from "./Box";
import ProfileModal from "./ProfileModal";
import ProfileMenu from "./ProfileMenu";
import ProfileViewModal from "./ProfileViewModal";

const usedNames = new Set();

function generateAvatarText(name) {
  let base = name[0].toUpperCase();
  let variant = base;
  let index = 1;

  while (usedNames.has(variant) && index < name.length) {
    variant = base + name[index].toLowerCase();
    index++;
  }

  usedNames.add(variant);
  return variant;
}

export default function ProfilesBox({ profiles, noProfiles, activeProfile, onSelectProfile, onProfilesChange, title, className = "" }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileViewModalOpts, setProfileViewModalOpts] = useState({
    open: false,
    profileName: "",
    profileId: ""
  });
  const [isHovered, setIsHovered] = useState(false);
  const [avatarPs, setAvatarPs] = useState(() => {
      if (profiles?.length) {
        return profiles.map((p) => ({
          id: p.profileId,
          name: p.profileName,
          aName: p.aName || generateAvatarText(p.profileName),
        }));
      } else {
        return [];
      }
  });
  const { authorizedFetch } = useAuth();

  // 🧠 Whenever profiles prop changes (like after fetch), rebuild avatar list
  useEffect(() => {
    if (profiles?.length) {
      const withAvatars = profiles.map((p) => ({
        
        id: p.profileId,
        name: p.profileName,
        aName: p.aName || generateAvatarText(p.profileName),
      }));
      setAvatarPs(withAvatars);
    }
  }, [profiles]);

    useEffect(() => {
    if (profiles?.length && !noProfiles) {
      const withAvatars = profiles.map((p) => ({
        
        id: p.profileId,
        name: p.profileName,
        aName: p.aName || generateAvatarText(p.profileName),
      }));
      setAvatarPs(withAvatars);
    }
  }, [noProfiles]);

  const handleAddProfile = () => setIsModalOpen(true);

  const handleSaveProfile = async (newProfile) => {
  try {
    // Step 1: Send new profile to backend
    const res = await authorizedFetch(`/api/rules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProfile),
    });

    if (!res.ok) {
      throw new Error(`Failed to save profile: ${res.status}`);
    }

    // Step 2: Parse backend response (which should include the real id)
    const data = await res.json();

    // Step 3: Add avatar name locally
    const profileWithAvatar = {
      id: data.profileId,
      name: newProfile.name,
      aName: generateAvatarText(newProfile.profileName),
    };

    // Step 4: Update this component’s state
    setAvatarPs((prev) => [...prev, profileWithAvatar]);

    newProfile = {
      profileId: data.profileId,
      ...newProfile
    }
    // Step 5: Update Layout’s global profile list
    if (typeof onProfilesChange === "function") {
      onProfilesChange(newProfile);
    }

    // Step 6: Optionally select the new profile immediately
    if (typeof onSelectProfile === "function") {
      onSelectProfile(data.profileId, data.chatlogId);
    }

    setIsModalOpen(false);
  } catch (error) {
    console.error("Failed to save profile:", error);
    // setError("Error adding new profile. Please try again.");
  }
};

  return (
    <Box
      title={title}
      className={`w-fit flex-shrink-0 h-full flex flex-col items-center max-h-[100vh] overflow-y-auto ${className}`}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex flex-col items-center gap-2 h-full"
      >
        {avatarPs.map((profile) => (
          <div
            key={profile.id}
            className={`group flex gap-1 items-center justify-between p-1 ${
              isHovered
                ? "w-[35ch] rounded-md border-2 border-border hover:border-foreground transition cursor-pointer"
                : "w-fit"
            }`}
            onClick={() => onSelectProfile(profile.id)}
          >
            <div className="flex items-center gap-2">
              <div
                id={profile.id}
                className={`w-12 h-12 rounded-full overflow-hidden border-2 border-border flex items-center justify-center ${
                  activeProfile === profile.id.toString()
                    ? "border-dashed border-foreground group-hover:border-solid transition"
                    : "group-hover:border-foreground transition"
                }`}
              >
                {profile.aName}
              </div>
            </div>
            {isHovered && (
              <div className="flex gap-2 justify-between w-[25ch] items-center">
                <span className="text-sm font-medium leading-none align-middle">
                  {profile.name}
                </span>
                {/* optional menu */}
                <ProfileMenu onView={() => {
                  setProfileViewModalOpts({
                    open: true,
                    profileId: profile.id.toString(),
                    profileName: profile.name
                  })
                }} />
              </div>
            )}
          </div>
        ))}

        {/* Add new profile */}
        <div
          onClick={handleAddProfile}
          className={`group cursor-pointer flex gap-1 items-center justify-between p-1 ${
            isHovered ? "w-[35ch] rounded-md border-2 border-border" : "w-fit"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-border group-hover:border-foreground transition">
              <Plus />
            </div>
          </div>
          {isHovered && (
            <div className="flex gap-2 justify-between w-[25ch] items-center">
              <span className="text-sm p-0 m-0 font-medium truncate leading-none align-middle">
                Add a new profile
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ProfileModal
        title={"Create New Profile"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfile}
      />
      <ProfileViewModal
        title={profileViewModalOpts.profileName}
        onClose={() => setProfileViewModalOpts({
          open: false,
          profileName: "",
          profileId: ""
        })}
        isOpen={profileViewModalOpts.open}
        profileId={profileViewModalOpts.profileId}
      />
    </Box>
  );
}
