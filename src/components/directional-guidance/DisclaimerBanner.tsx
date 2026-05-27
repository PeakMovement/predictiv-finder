export const DisclaimerBanner = () => (
  <div
    role="note"
    className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-sm"
  >
    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
    <span className="text-[11px] font-semibold uppercase tracking-widest text-primary">
      Directional guidance • Not medical advice
    </span>
  </div>
);

export default DisclaimerBanner;
