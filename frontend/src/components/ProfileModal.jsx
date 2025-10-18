import { useState } from "react";
import { X } from "lucide-react";

export default function ProfileModal({ isOpen, onClose, onSave }) {

  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [useCase, setUseCase] = useState("");

  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [commentingRules, setCommentingRules] = useState("");
  const [spacingInstruction, setSpacingInstruction] = useState("");


  const [targetAudience, setTargetAudience] = useState("");

  const [otherInstructions, setOtherInstructions] = useState("");


  const validate = () => {
    if (!name) {
        setError("name field must be filled out")
        return false;
    }
    if (name.length > 25) {
        setError("name must not be more than 25 characters")
        return false;
    }
    if (!aiModel) {
        setError("please select a model")
        return false;
    } 
    if (!useCase) {
        setError("please select a use case")
        return false;
    }     
    switch (useCase) {
        case "coding-assistance": {
            if (!preferredLanguage && !commentingRules && !spacingInstruction && !otherInstructions) {
                setError("must set at least one rule")
                return false;
            }
            break;
        }
        case "documentation-creation": {
            if (!targetAudience && !otherInstructions) {
                setError("must set at least one rule")
                return false;
            }
            break;
        }
    }
    return true;
  }


  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {return}
    const newProfile = {
      userId: 0,
      name,
      Model: aiModel,
      RuleSet: {
        UseCase: useCase,
      },
      active: false,
    };
    onSave(newProfile);
    handleClose();
    onClose();
  };

  const handleClose = () => {
    setName("");
    setAiModel("");
    setUseCase("");
    setPreferredLanguage("")
    setCommentingRules("")
    setSpacingInstruction("")
    setTargetAudience("")
    setPreferredLanguage("")
  }

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
        <h2 className="text-xl font-semibold text-foreground mb-4">Create New Ruleset</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-sm text-foreground">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 p-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-foreground/40"
              required
            />
          </label>

          <label className="flex flex-col text-sm text-foreground">
            Model
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="mt-1 p-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-foreground/40"
            >
                <option value="" disabled>
                    -- Select a type --
                </option>
                <option value="hyperion">Hyperion</option>
                <option value="hermes">Hermes </option>
            </select>
          </label>

          <label className="flex flex-col text-sm text-foreground">
            Use Case
            <select
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              className="mt-1 p-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-foreground/40"
            >
                <option value="" disabled>
                    -- Select a type --
                </option>
                <option value="coding-assistance">Coding Assistance</option>
                {/* <option value="financial-planning">Financial Planning</option> */}
                <option value="documentation-creation">Documentation Creation</option>
            </select>
          </label>

      {(() => {
            switch (useCase) {
              case "coding-assistance":
                return (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium text-foreground/80">Coding Settings</h3>
                    <label className="flex flex-col text-sm text-foreground">
                      Preferred Language
                      <input
                        type="text"
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                        placeholder="e.g. JavaScript, Python"
                        className="mt-1 p-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-foreground/40"
                      />
                    </label>
                    <label className="flex flex-col text-sm text-foreground">
                      Spacing Rules
                      <input
                        type="number"
                        value={spacingInstruction}
                        onChange={(e) => setSpacingInstruction(e.target.value)}
                        placeholder="how many spaces for each nested line, as a number"
                        className="mt-1 p-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-foreground/40"
                      />
                    </label>
                    <label className="flex flex-col text-sm text-foreground">
                       Commenting
                      <textarea
                        type="text"
                        rows={3}
                        value={commentingRules}
                        onChange={(e) => setCommentingRules(e.target.value)}
                        placeholder="how should the AI leave comments on functions"
                        className="mt-1 p-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-foreground/40"
                      />
                    </label>
                  </div>
                );

              case "financial-planning":
                return (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium text-foreground/80">Financial Parameters</h3>
                    <label className="flex flex-col text-sm text-foreground">
                      Budget Range
                      <input
                        type="number"
                        value={budgetRange}
                        onChange={(e) => setBudgetRange(e.target.value)}
                        placeholder="Enter budget limit"
                        className="mt-1 p-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-foreground/40"
                      />
                    </label>
                  </div>
                );

              case "documentation-creation":
                return (
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-medium text-foreground/80">Documentation Options</h3>
                    <label className="flex flex-col text-sm text-foreground">
                      Target Audience
                      <input
                        type="text"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="Who is the documentation for, e.g. Developers, Students"
                        className="mt-1 p-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-foreground/40"
                      />
                    </label>
                  </div>
                );

              default:
                return null;
            }
          })()}
            <label className="flex flex-col text-sm text-foreground">
                Other Instructions
                <textarea
                type="text"
                rows={3}
                value={otherInstructions}
                onChange={(e) => setOtherInstructions(e.target.value)}
                placeholder="What other instructions would you like the model to follow"
                className="mt-1 p-2 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-foreground/40"
                />
            </label>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => {
                handleClose()
                onClose()
              }}
              className="px-4 py-2 rounded-lg bg-border hover:bg-border/80 transition text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg font-medium hover:bg-foreground/90 transition ${error ? "bg-transparent text-border disabled" : "bg-foreground text-background"}`}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}