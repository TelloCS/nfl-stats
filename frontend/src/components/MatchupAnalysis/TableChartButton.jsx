import { memo } from "react"
import SelectDropdown from "../SelectDropdown";

const TableChartButton = ({ selectedGameIndex, setSelectedGameIndex, gameOptions, viewMode, setViewMode }) => {
  return (
    <div className="flex text-paper-400 justify-between mb-4 gap-4">
      <SelectDropdown
        value={selectedGameIndex}
        onChange={setSelectedGameIndex}
        options={gameOptions}
        minWidth="120px"
      />
      <div className="flex bg-geodude-900 p-1 max-w-[160px] w-full rounded-full border border-geodude-800 shrink-0 gap-1">
        <button
          onClick={() => setViewMode("table")}
          className={`flex-1 text-xs font-bold py-1 rounded-full transition-all duration-200 ${viewMode === "table"
            ? "bg-geodude-700 text-foreground"
            : "text-paper-500 hover:text-paper-300 hover:bg-geodude-700"
            }`}
        >
          Table
        </button>
        <button
          onClick={() => setViewMode("chart")}
          className={`flex-1 text-xs font-bold py-1 rounded-full transition-all duration-200 ${viewMode === "chart"
            ? "bg-geodude-700 text-foreground"
            : "text-paper-500 hover:text-paper-300 hover:bg-geodude-700"
            }`}
        >
          Chart
        </button>
      </div>
    </div>
  )
}

export default memo(TableChartButton);