import Box from "./Box";
import { MoreVertical, Plus } from "lucide-react"; // You can install lucide-react for clean icons
import { useState } from "react";
import ProfileModal from "./ProfileModal";


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

export default function ProfilesBox({ title, className = "" }) {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [profiles, setProfiles] = useState(() => {
    // if you'll load from an API later, you can replace this with a fetch
    const initialProfiles = [
    {
      id: "12sas2",
      name: "hyperion code assitant",
      aName: "",
      model: "hyperion",
      active: true
    },
    {
      id: "12sas3",
      name: "hermes documentation creator",
      aName: "",
      model: "hermes",
      active: false
    },
    ];
    // generate names only once
    return initialProfiles.map(p => ({
      ...p,
      aName: generateAvatarText(p.name),
    }));
  });



  const handleProfileSelect = (e) => {
    console.log(profiles);
    let id = e.target.id;
    const updatedProfiles = profiles.map((p) =>
      p.id === id ? { ...p, active: true } : { ...p, active: false }
    );
    setProfiles(updatedProfiles);
  }
  
  const handleAddProfile = () => setIsModalOpen(true);

  const handleSaveProfile = async (newProfile) => {
    try {
      // const savedProfile = await sendProfileToAPI(newProfile);
      setProfiles((prev) => [...prev, {
        id: "isa",
        name: newProfile.name,
        aName: generateAvatarText(newProfile.name),
        model: newProfile.Model,
        active: false
      }]);
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  return (
    <Box title={title} className={`w-fit flex-shrink-0 h-full flex flex-col items-center ${className}`}>
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex flex-col items-center gap-3"
        >
        {profiles.map((profile) => (
          <div className={`flex gap-1 items-center justify-between ${isHovered ? "w-[45ch] p-2 rounded-md border-2 border-border" : "w-fit"}`}>
            <button
              key={profile.id}
              id={profile.id}
              onClick={handleProfileSelect}
              className={`w-12 h-12 rounded-full overflow-hidden border-2 border-border ${profile.active ? "border-dashed border-foreground hover:border-solid transition" : "hover:border-foreground transition"}`}
            >
              {profile.aName}
            </button>
            {isHovered &&
            <div className="flex gap-2 justify-between w-[30ch] items-center">
              <span className="text-sm p-0 m-0 font-medium truncate leading-none align-middle">{profile.name}</span>
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    // open profile settings / modal
                    console.log("Edit/View Rules:", profile.id);
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-foreground/50 hover:bg-border transition"
                >
                  <MoreVertical size={16} strokeWidth={2}/>
              </button>
            </div> 
            }
          </div>
        ))}
          <div className={`flex gap-1 items-center justify-between ${isHovered ? "w-[45ch] p-2 rounded-md border-2 border-border" : "w-fit"}`}>
        
        <button
          onClick={handleAddProfile}
          className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-border hover:border-foreground transition"
        >
          <Plus />
        </button>
        {isHovered &&
            <div className="flex gap-2 justify-between w-[30ch] items-center">
              <span className="text-sm p-0 m-0 font-medium truncate leading-none align-middle">Add a new profile</span>
            </div> 
            }
        </div>
        </div>
        <ProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveProfile}/>
    </Box>
  );
}