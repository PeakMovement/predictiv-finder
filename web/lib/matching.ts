// Public "Name Your Problem" triage. This is a lightweight, keyword-based
// front end to the same idea as the existing symptom_severity_rules /
// symptom_checks tables in Supabase (see ../src/utils/planGenerator and
// ../src/components/symptom-intake in the legacy app for the full AI-driven
// version used inside the logged-in assistant). This version is intentionally
// simple and deterministic so it can run instantly on a public marketing page
// without an LLM call, and it never claims to be a diagnosis.

export type TriageResult = {
  professions: string[];
  summary: string;
  redFlag: boolean;
  redFlagMessage?: string;
};

const RED_FLAG_KEYWORDS = [
  "chest pain",
  "can't breathe",
  "cannot breathe",
  "numbness in my face",
  "loss of consciousness",
  "severe head injury",
  "uncontrolled bleeding",
  "suicidal",
];

// keyword -> professions, ordered by how strongly they should be recommended
const SYMPTOM_MAP: { keywords: string[]; professions: string[]; summary: string }[] = [
  {
    keywords: ["lower back", "lower-back", "back pain", "sciatica", "disc"],
    professions: ["Physiotherapist", "Biokineticist"],
    summary:
      "This sounds like it could be a mechanical lower back issue. A physiotherapist can assess movement and posture causes; a biokineticist can help with a structured strengthening programme once acute pain has settled.",
  },
  {
    keywords: ["knee", "runner's knee", "runners knee", "acl", "meniscus"],
    professions: ["Physiotherapist", "Biokineticist"],
    summary:
      "Knee pain, especially with running, is most often a loading or tracking issue. A physiotherapist can diagnose and treat it directly; a biokineticist can help rebuild capacity safely afterwards.",
  },
  {
    keywords: ["shoulder", "rotator cuff", "frozen shoulder"],
    professions: ["Physiotherapist"],
    summary:
      "Shoulder pain like this usually responds well to a targeted physiotherapy assessment, especially if it's affecting sleep or overhead movement.",
  },
  {
    keywords: ["neck pain", "stiff neck", "whiplash"],
    professions: ["Physiotherapist"],
    summary:
      "Neck pain and stiffness is a common physiotherapy case, particularly if it's linked to desk posture or a recent strain.",
  },
  {
    keywords: ["sports injury", "sprain", "strain", "pulled muscle"],
    professions: ["Physiotherapist"],
    summary:
      "A recent sprain or strain is best assessed early by a physiotherapist to guide safe loading and return to activity.",
  },
  {
    keywords: ["post surgery", "post-surgery", "rehab", "recovering from surgery"],
    professions: ["Biokineticist", "Physiotherapist"],
    summary:
      "Post-surgical recovery is exactly what biokineticists and physiotherapists specialise in, with a structured, graded return to function.",
  },
];

export function analyzeSymptom(rawText: string): TriageResult {
  const text = rawText.toLowerCase();

  const redFlagHit = RED_FLAG_KEYWORDS.find((k) => text.includes(k));
  if (redFlagHit) {
    return {
      professions: [],
      summary: "",
      redFlag: true,
      redFlagMessage:
        "What you've described could be serious. Please seek emergency medical care immediately or call your local emergency number. This tool is directional guidance only, not a diagnosis, and isn't a substitute for urgent medical attention.",
    };
  }

  const match = SYMPTOM_MAP.find((entry) =>
    entry.keywords.some((k) => text.includes(k))
  );

  if (!match) {
    return {
      professions: ["Physiotherapist"],
      summary:
        "We couldn't match this to a specific pattern, but a physiotherapist is the right first point of call for most musculoskeletal complaints and can refer you onward if needed.",
      redFlag: false,
    };
  }

  return { professions: match.professions, summary: match.summary, redFlag: false };
}
