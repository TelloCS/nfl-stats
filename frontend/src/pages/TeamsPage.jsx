import Teams from "../components/Teams"
import UpcomingGames from "../components/UpcomingGames/UpcomingGames";

export default function TeamsPage() {

  return (
    <>
      <UpcomingGames />
      <div className="container mx-auto p-2 sm:p-4 md:px-8 font-poppins">
        <Teams />
      </div>
    </>
  );
};