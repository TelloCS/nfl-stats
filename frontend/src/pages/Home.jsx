import { Link } from "react-router-dom";
import { ChartColumn, Shield, Users } from 'lucide-react';
import UpcomingGames from '../components/UpcomingGames';

export default function Home() {
  return (
    <>
      <UpcomingGames />
      <div className="bg-background flex flex-col justify-center overflow-hidden font-poppins">
        <div className="container mx-auto p-6 md:p-10 relative z-10 my-12 flex flex-col">
          <div className="mx-auto justify-center flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight leading-tight text-center sm:text-left">
              NFL Analytics & Stats
            </h1>

            <p className="text-lg mb-10 leading-relaxed max-w-2xl text-geodude-200 text-center sm:text-left">
              Dive deep into weekly matchups, team performance metrics, and player statistics.
            </p>

            <div className="flex flex-wrap gap-4 mb-16 justify-center sm:justify-start">
              <Link
                to="/team/stats"
                className="px-8 py-4 text-foreground bg-card rounded-md font-semibold text-lg border border-geodude-800 hover:bg-geodude-800 transition-colors"
              >
                View Team Stats
              </Link>
              <Link
                to="/position-vs-opponent"
                className="px-8 py-4 text-foreground bg-primary rounded-md font-semibold text-lg border border-primary hover:bg-primary/80 hover:border-primary/80 transition-colors"
              >
                Analyze Matchups
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-geodude-800 pt-8">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const Feature = ({ icon, title, desc }) => (
  <div className="flex flex-col gap-2">
    <div className="mb-2 p-3 bg-geodude-900 rounded-md w-fit border border-geodude-800">{icon}</div>
    <h3 className="font-bold text-lg text-foreground">{title}</h3>
    <p className="text-geodude-200 text-sm">{desc}</p>
  </div>
);