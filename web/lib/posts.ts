// Minimal file-based blog store. Deliberately not a CMS yet: the point of
// this first post is to start ranking for local, low-competition long-tail
// keywords around Rondebosch while the directory itself gets real listings.
// Add more entries here, or swap this for a headless CMS later without
// changing any page component.

export type Post = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  body: string[]; // paragraphs
};

export const posts: Post[] = [
  {
    slug: "best-physiotherapist-rondebosch-guide",
    title: "How to Choose a Physiotherapist in Rondebosch (2026 Guide)",
    description:
      "What to actually look for when picking a physiotherapist in Rondebosch, from qualifications to how quickly you can get an appointment.",
    publishedAt: "2026-09-16",
    body: [
      "If you're searching for a physiotherapist in Rondebosch, you've probably got a specific problem, not a general one: a sore lower back after too many hours at a desk, a knee that's been niggling since your last run around the Rondebosch Common, or a shoulder that hasn't felt right since a gym session went wrong.",
      "The short version: look for a physiotherapist registered with the HPCSA, check whether they specialise in your specific issue (sports injuries, post-surgical rehab, chronic pain), and read recent reviews rather than just a star rating, since the detail in a review tells you more than the number does.",
      "Rondebosch sits close to UCT and the southern suburbs sports clubs, so a lot of local physiotherapy demand is genuinely sports-related, running injuries, rugby and hockey knocks, and repetitive strain from studying. A practitioner who deals with that kind of caseload regularly will usually get you back to normal faster than a generalist.",
      "Once you've narrowed it down, book an initial assessment rather than committing to a block of sessions upfront. A good physiotherapist will give you a clear working diagnosis and a plan within the first session, not a vague promise that it'll take a while to figure out.",
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug) ?? null;
}
