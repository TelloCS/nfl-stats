import { memo } from 'react';
import { FilterConfig, Positions, TeamAbbreviations } from '../Config';
import { LayoutList, LineChart as ChartIcon, Loader2, Search } from 'lucide-react';
import { Hash, Files } from 'lucide-react';
import SelectDropdown from '../SelectDropdown';

const FilterSection = memo(({ filters, onFilterChange, stats, isLoading, viewMode, setViewMode }) => (
  <div className="bg-background border-b border-geodude-800">
    <div className="container mx-auto flex flex-col px-4 md:px-8 py-6 gap-6">
      <div className='flex flex-col lg:flex-row justify-between gap-6'>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-3">
          <div className="col-span-1">
            <SelectDropdown
              value={filters.season_year}
              onChange={(v) => onFilterChange('season_year', v)}
              options={FilterConfig.season_year}
              minWidth="100%"
              className="lg:min-w-[110px]"
            />
          </div>
          <div className="col-span-1">
            <SelectDropdown
              value={filters.season_type}
              onChange={(v) => onFilterChange('season_type', v)}
              options={FilterConfig.season_type}
              minWidth="100%"
              className="lg:min-w-[150px]"
            />
          </div>
          <div className="col-span-1">
            <SelectDropdown
              value={filters.location}
              onChange={(v) => onFilterChange('location', v)}
              options={FilterConfig.location}
              minWidth="100%"
              className="lg:min-w-[130px]"
            />
          </div>

          <div className="h-6 w-px bg-geodude-800 mx-2 hidden sm:block"></div>

          <div className="col-span-1">
            <SelectDropdown
              value={filters.opponent}
              onChange={(v) => onFilterChange('opponent', v)}
              options={TeamAbbreviations}
              minWidth="100%"
              className="lg:min-w-[160px]"
            />
          </div>
          <div className="col-span-1">
            <SelectDropdown
              value={filters.position}
              onChange={(v) => onFilterChange('position', v)}
              options={Positions}
              minWidth="100%"
              className="lg:min-w-[130px]"
            />
          </div>
        </div>

        <div className="flex bg-geodude-950 w-full sm:w-fit h-[38px] p-1 border border-geodude-800 shrink-0">
          <ToggleButton
            active={viewMode === 'table'}
            onClick={() => setViewMode('table')}
            icon={<LayoutList size={14} />}
            label="Table"
          />
          <ToggleButton
            active={viewMode === 'chart'}
            onClick={() => setViewMode('chart')}
            icon={<ChartIcon size={14} />}
            label="Trend Chart"
          />
        </div>
      </div>

      {!isLoading && stats?.totalCount > 0 && viewMode === 'table' && (
        <StatsSummary stats={stats} />
      )}
    </div>
  </div>
));

const StatsSummary = memo(({ stats }) => (
  <div className="text-sm font-medium text-paper-500 pt-3 border-t border-geodude-800 mt-2">

    <div className='flex gap-4'>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className="flex items-center gap-1">
          <span>Total Entries: <strong className="text-paper-300">{stats.totalCount.toLocaleString()}</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <span>Pages: <strong className="text-paper-300">{stats.totalPages}</strong></span>
        </div>
      </div>
      <div className='flex ml-auto items-end gap-1'>
        Showing <strong className="text-paper-300">{stats.loadedCount}</strong> of {stats.totalCount.toLocaleString()}
      </div>
    </div>
  </div>
));

const ToggleButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 h-full text-xs font-bold
      ${active
        ? 'bg-geodude-800 text-primary border border-geodude-700'
        : 'text-paper-500 hover:text-paper-200'}`}
  >
    {icon}
    {label}
  </button>
);

export default FilterSection;