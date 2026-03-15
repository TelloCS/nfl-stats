import { memo } from 'react';
import { FilterConfig, Positions, TeamAbbreviations } from './Config';
import { Database, Layers } from 'lucide-react';
import SelectDropdown from './ui/SelectDropdown';

const FilterSection = memo(({ filters, onFilterChange, stats, isLoading }) => (
  <div className="bg-[#000000] border-b border-neutral-800">
    <div className="container mx-auto flex flex-col px-4 md:px-8 py-6 gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <SelectDropdown value={filters.season_year} onChange={(v) => onFilterChange('season_year', v)} options={FilterConfig.season_year} minWidth="100px" />
        <SelectDropdown value={filters.season_type} onChange={(v) => onFilterChange('season_type', v)} options={FilterConfig.season_type} minWidth="150px" />
        <SelectDropdown value={filters.location} onChange={(v) => onFilterChange('location', v)} options={FilterConfig.location} minWidth="120px" />

        <div className="h-6 w-px bg-neutral-800 mx-2 hidden md:block"></div>

        <SelectDropdown value={filters.opponent} onChange={(v) => onFilterChange('opponent', v)} options={TeamAbbreviations} minWidth="140px" />
        <SelectDropdown value={filters.position} onChange={(v) => onFilterChange('position', v)} options={Positions} minWidth="120px" />
      </div>

      {!isLoading && stats?.totalCount > 0 && (
        <StatsSummary stats={stats} />
      )}
    </div>
  </div>
));

const StatsSummary = ({ stats }) => (
  <div className="flex items-center gap-6 text-xs font-medium text-neutral-500 pt-3 border-t border-neutral-800/50 mt-2">
    <div className="flex items-center gap-2">
      <Database size={16} className="text-neutral-600" />
      <span>Total Entries: <strong className="text-neutral-300">{stats.totalCount.toLocaleString()}</strong></span>
    </div>
    <div className="flex items-center gap-2">
      <Layers size={16} className="text-neutral-600" />
      <span>Pages: <strong className="text-neutral-300">{stats.totalPages}</strong></span>
    </div>
    <div className="ml-auto">
      Showing <strong className="text-neutral-300">{stats.loadedCount}</strong> of {stats.totalCount.toLocaleString()}
    </div>
  </div>
);

export default FilterSection;