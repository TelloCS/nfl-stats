import { memo } from 'react';
import { FilterConfig, Positions, TeamAbbreviations } from './Config';
import { Hash, Files } from 'lucide-react';
import SelectDropdown from './ui/SelectDropdown';

const FilterSection = memo(({ filters, onFilterChange, stats, isLoading }) => (
  <div className="bg-background border-b border-geodude-800">
    <div className="container mx-auto flex flex-col px-4 md:px-8 py-6 gap-6">
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

      {!isLoading && stats?.totalCount > 0 && (
        <StatsSummary stats={stats} />
      )}
    </div>
  </div>
));

const StatsSummary = ({ stats }) => (
  <div className="text-xs font-medium text-paper-500 pt-3 border-t border-geodude-800 mt-2">

    <div className='flex gap-4'>
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className="flex items-center gap-1">
          <Hash size={14} className="text-paper-500" />
          <span>Total Entries: <strong className="text-paper-300">{stats.totalCount.toLocaleString()}</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <Files size={14} className="text-paper-500" />
          <span>Pages: <strong className="text-paper-300">{stats.totalPages}</strong></span>
        </div>
      </div>
      <div className='flex ml-auto items-end gap-1'>
        Showing <strong className="text-paper-300">{stats.loadedCount}</strong> of {stats.totalCount.toLocaleString()}
      </div>
    </div>
  </div>
);

export default FilterSection;