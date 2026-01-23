import UpcomingGames from "../components/UpcomingGames";
import  PlayerGraph from "../components/Dashboard/PlayerGraph";
import SampleGraph from "../components/Dashboard/SampleGraph";

const PlayerStats = () => {
  return (
    <>
      <UpcomingGames />
      <PlayerGraph />
      {/* <SampleGraph /> */}
    </>
  );
};

export default PlayerStats;