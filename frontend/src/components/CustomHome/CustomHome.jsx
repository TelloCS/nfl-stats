import { useState, memo } from 'react';
import Teams from '../Teams';
import Table from '../UpcomingGames/Table';
import ScheduleHeader from '../UpcomingGames/ScheduleHeader';
import HistoricSlates from "../HistoricSlates/HistoricSlates";

import Toggle from '../PlayerPerformance/Toggle';

function CustomHome() {
  const [viewMode, setViewMode] = useState("schedule");

  return (
    <div className='container mx-auto flex flex-col'>
      <div className='flex bg-geodude-900 h-[32px] p-1 border border-geodude-800 rounded-full gap-1 w-full sm:w-fit shrink-0 mb-6'>
        <Toggle
          active={viewMode === 'schedule'}
          onClick={() => setViewMode('schedule')}
          label="Schedule"
        />
        <Toggle
          active={viewMode === 'slates'}
          onClick={() => setViewMode('slates')}
          label="Historic Slates"
        />
      </div>
      {viewMode == 'schedule' ? (
        <Table />
      ) : (
        <HistoricSlates />
      )}
      <Teams />
    </div>
  );
};

export default memo(CustomHome);