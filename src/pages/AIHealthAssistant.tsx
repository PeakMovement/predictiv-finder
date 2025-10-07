return (
  <div className="flex flex-col md:flex-row items-start justify-center gap-10 w-full max-w-6xl mx-auto p-6 md:p-10">
    {/* LEFT PANEL – Input Section */}
    <section className="flex-1 md:w-3/5 w-full flex flex-col space-y-4 bg-zinc-900/40 rounded-2xl p-6 backdrop-blur-sm border border-zinc-800 shadow-lg">
      <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
        <i className="lucide lucide-user text-purple-400" />
        Describe your health concern *
      </h2>

      <textarea
        placeholder="Describe your health concern, budget, and preferred location..."
        className="bg-zinc-950/60 border border-zinc-800 rounded-lg text-white p-4 w-full resize-none h-32 focus:ring-2 focus:ring-purple-500 focus:outline-none"
      />

      <p className="text-sm text-zinc-400">* Please try to mention the budget, issue and location if possible</p>

      <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all w-full md:w-auto px-6">
        Find My Physician
      </button>
    </section>

    {/* RIGHT PANEL – Example Prompts */}
    <aside className="flex-1 md:w-2/5 w-full flex flex-col space-y-3 mt-8 md:mt-0">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <span className="text-purple-400 text-lg">•</span> Try these examples
      </h3>

      {[
        "Lower back pain, R1000, Johannesburg",
        "Skin issues – acne, R800, Cape Town",
        "Chest pain, specialist needed, R1200, Durban",
        "Headaches and memory issues, R1500, Pretoria",
      ].map((example, index) => (
        <button
          key={index}
          className="bg-zinc-900/50 border border-zinc-800 hover:border-purple-500 hover:bg-zinc-800 transition-all text-left text-white p-3 rounded-lg flex items-center gap-2"
        >
          <i className="lucide lucide-user text-purple-400" />
          {example}
        </button>
      ))}

      <p className="text-xs text-zinc-500">Click any example to use it as your prompt</p>
    </aside>
  </div>
);
