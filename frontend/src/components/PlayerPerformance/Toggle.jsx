const Toggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex bg-geodude-900 h-[32px] p-1 border border-geodude-800 rounded-full gap-1">
      <button
        onClick={() => setViewMode("table")}
        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 h-full text-xs font-bold rounded-full
          ${viewMode === "table"
            ? "bg-geodude-700 text-foreground"
            : "text-paper-500 hover:text-paper-300 hover:bg-geodude-700"
          }`}
      >
        Table
      </button>
      <button
        onClick={() => setViewMode("chart")}
        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 h-full text-xs font-bold rounded-full
          ${viewMode === "chart"
            ? "bg-geodude-700 text-foreground"
            : "text-paper-500 hover:text-paper-300 hover:bg-geodude-700"
          }`}
      >
        Chart
      </button>
    </div>
  )
}

export default Toggle;