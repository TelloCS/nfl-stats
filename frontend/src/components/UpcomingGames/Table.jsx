import { memo } from "react";
import CustomLoader from "../CustomLoader"
import GameTableRow from "./GameTableRow";
import ScheduleHeader from "./ScheduleHeader";
import useUpcomingGames from "../../hooks/useUpcomingGames";

function Table() {
  const { data, isPending } = useUpcomingGames();

  if (isPending) {
    return (
      <CustomLoader />
    );
  };

  return (
    <>
      <ScheduleHeader data={data} />
      <div className="w-full overflow-x-auto border border-geodude-800 bg-geodude-900 hide-scrollbar font-mono">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr className="border-b border-geodude-800 uppercase text-[11px] tracking-wider [&>th]:font-semibold [&>th]:px-2 [&>th]:py-3 [&>th]:text-left">
              <th className="text-nowrap">Matchup</th>
              <th className="text-nowrap">Date</th>
              <th className="text-nowrap">Time</th>
              <th className="text-nowrap">Location</th>
              <th className="text-nowrap">Line</th>
              <th className="text-nowrap">O/U</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-geodude-800/50">
            {data.events.map((event, idx) => (
              <GameTableRow key={event?.id || idx} event={event} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default memo(Table);