import { Volume2, VolumeX } from "lucide-react";
import { useBackgroundMusic } from "../hooks/useBackgroundMusic";

export default function BgmToggle() {
  const { enabled, toggle } = useBackgroundMusic();

  return (
    <button
      onClick={toggle}
      title={enabled ? "Mute background music" : "Play background music"}
      className="text-ink-900/50 hover:text-ember-600 transition-colors"
    >
      {enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
    </button>
  );
}