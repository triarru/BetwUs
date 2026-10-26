import { saveMoodAction } from "@/app/actions/memories";
import { ActionForm } from "@/components/ActionForm";
import { MOODS } from "@/lib/constants";

export function MoodForm({ day, current }: { day: string; current?: string }) {
  return (
    <ActionForm action={saveMoodAction} className="flex flex-wrap gap-2">
      <input type="hidden" name="day" value={day} />
      {MOODS.map((emoji) => (
        <button
          key={emoji}
          name="emoji"
          value={emoji}
          className={`h-11 w-11 rounded-full text-xl disabled:opacity-50 ${current === emoji ? "bg-paper-deep ring-2 ring-gold" : "bg-white"}`}
        >
          {emoji}
        </button>
      ))}
    </ActionForm>
  );
}
