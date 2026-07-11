import { memo } from "react";
import { Link } from "react-router-dom";
import { ChartColumn, Shield, Users, Crown } from 'lucide-react';
import UpcomingGames from '../components/UpcomingGames';

function Home() {
  return (
    <>
      <UpcomingGames />
      <div className="bg-background flex flex-col justify-center overflow-hidden font-poppins">
        <div className="max-w-[1400px] mx-auto p-6 md:p-10 relative z-10 my-12 flex flex-col">
          <div className="mx-auto justify-center flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight text-center sm:text-left">
              NFL Analytics & Stats
            </h1>

            <p className="text-lg mb-10 leading-relaxed max-w-3xl text-geodude-200 text-center sm:text-left">
              Dive deep into weekly matchups, team performance metrics, and player statistics.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-16">
              <Link
                to="/team/stats"
                className="px-6 py-3 md:px-8 md:py-4 text-foreground rounded-md font-semibold text-base md:text-lg border border-geodude-800 hover:bg-geodude-800 transition-colors text-center"
              >
                View Team Stats
              </Link>
              <Link
                to="/position-vs-opponent"
                className="px-6 py-3 md:px-8 md:py-4 text-foreground rounded-md font-semibold text-base md:text-lg border border-geodude-800 hover:bg-geodude-800 transition-colors text-center"
              >
                Analyze Matchups
              </Link>
              <Link
                to="/fantasy-rankings"
                className="px-6 py-3 md:px-8 md:py-4 text-foreground rounded-md font-semibold text-base md:text-lg border border-geodude-800 hover:bg-geodude-800 transition-colors text-center"
              >
                Fantasy Rankings
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-geodude-800 pt-8">
              <Feature
                icon={<Shield className="text-status-info" size={24} />}
                title="Position vs Opponent"
                desc="See how a player performs against specific teams."
              />
              <Feature
                icon={<ChartColumn className="text-status-success" size={24} />}
                title="Team Rankings"
                desc="Compare offensive and defensive performance across the league."
              />
              <Feature
                icon={<Users className="text-status-accent" size={24} />}
                title="Player Insights"
                desc="Detailed game logs and historical performance data."
              />
              <Feature
                icon={<Crown className="text-status-aware" size={24} />}
                title="Fantasy Rankings"
                desc="Historic and updated weekly fantasy rankings."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const Feature = memo(({ icon, title, desc }) => (
  <div className="flex flex-col gap-2">
    <div className="mb-2 p-3 bg-geodude-900 rounded-md w-fit border border-geodude-800">{icon}</div>
    <h3 className="font-bold text-lg text-foreground">{title}</h3>
    <p className="text-geodude-200 text-sm">{desc}</p>
  </div>
));

export default memo(Home);