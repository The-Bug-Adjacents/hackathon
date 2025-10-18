import Box from "./Box";
import { Plus } from "lucide-react"; // You can install lucide-react for clean icons
import { useState } from "react";
import ProfileModal from "./ProfileModal";
import ProfileMenu from "./ProfileMenu";


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
  const [activeProfile, setActiveProfile] = useState("");
  const [profiles, setProfiles] = useState(() => {
    // if you'll load from an API later, you can replace this with a fetch
  const initialProfiles = [
    {
      id: "12sas2",
      name: "hyperion code assitant",
      aName: "",
      model: "hyperion",
    },
    {
      id: "12sas3",
      name: "hermes documentation creator",
      aName: "",
      model: "hermes",
    },
    ];

    setActiveProfile(initialProfiles[0].id ?? "");
    // generate names only once
    return initialProfiles.map(p => ({
      ...p,
      aName: generateAvatarText(p.name),
    }));
  });



  const handleProfileSelect = (id) => setActiveProfile(id);
  
  
  const handleAddProfile = () => setIsModalOpen(true);

  const handleSaveProfile = async (newProfile) => {
    try {
      // const savedProfile = await sendProfileToAPI(newProfile);
      setProfiles((prev) => [...prev, {
        id: "isa",
        name: newProfile.name,
        aName: generateAvatarText(newProfile.name),
        model: newProfile.Model,
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
          className="flex flex-col items-center gap-3 h-full"
        >
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfile;
          return (
          <div 
            className={`group flex gap-1 items-center justify-between ${isHovered ? "w-[45ch] p-2 rounded-md border-2 border-border hover:border-foreground transition cursor-pointer" : "w-fit"}`}
            onClick={() => handleProfileSelect(profile.id)}
         >
          <div className="flex items-center gap-2">
            <div
              key={profile.id}
              id={profile.id}
              className={`w-12 h-12 rounded-full overflow-hidden border-2 border-border  flex items-center justify-center ${activeProfile === profile.id ? "border-dashed border-foreground group-hover:border-solid transition" : "group-hover:border-foreground transition"}`}
            >
              {profile.aName}
            </div>
          </div>
            {isHovered &&
            <div className="flex gap-2 justify-between w-[30ch] items-center">
              <span className="text-sm font-medium leading-none align-middle">{profile.name}</span>
              {open && (
                <ProfileMenu onDelete={()=>{}} onEdit={()=>{}} onView={()=>{}}/>
              )}
            </div> 
            }
          </div>
          )
          })}
          <div 
          onClick={handleAddProfile}
          className={`group cursor-pointer flex gap-1 items-center justify-between ${isHovered ? "w-[45ch] p-2 rounded-md border-2 border-border" : "w-fit"}`}>
        <div className="flex items-center gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-border group-hover:border-foreground transition"
          >
            <Plus />
          </div>
        </div>
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