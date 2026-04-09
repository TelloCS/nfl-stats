import { Link } from "react-router-dom";
import { ChartColumn, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-81px)] bg-[#000000] flex flex-col justify-center overflow-hidden font-poppins">
      <div className="container mx-auto p-6 md:p-10 relative z-10 mb-12 flex flex-col">
        <div className="mx-auto justify-center flex flex-col">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            Advance NFL Analytics & Stats
          </h1>

          <p className="text-lg mb-10 leading-relaxed max-w-2xl text-neutral-400">
            Dive deep into weekly matchups, team performance metrics, and player statistics.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <Link
              to="/position-vs-opponent"
              className="px-8 py-4 text-white bg-emerald-600 rounded-md font-semibold text-lg hover:bg-emerald-500 transition-colors"
            >
              Analyze Matchups
            </Link>
            <Link
              to="/team/stats"
              className="px-8 py-4 text-white bg-neutral-900 rounded-md font-semibold text-lg hover:bg-neutral-800 transition-colors"
            >
              View Team Stats
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-neutral-800 pt-8">
            <Feature
              icon={<Shield className="text-blue-400" size={24} />}
              title="Position vs Opponent"
              desc="See how a player performs against specific teams."
            />
            <Feature
              icon={<ChartColumn className="text-emerald-400" size={24} />}
              title="Team Rankings"
              desc="Compare offensive and defensive performance across the league."
            />
            <Feature
              icon={<Users className="text-purple-400" size={24} />}
              title="Player Insights"
              desc="Detailed game logs and historical performance data."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const Feature = ({ icon, title, desc }) => (
  <div className="flex flex-col gap-2">
    <div className="mb-2 p-3 bg-neutral-900 rounded-md w-fit border border-neutral-800">{icon}</div>
    <h3 className="font-bold text-lg text-white">{title}</h3>
    <p className="text-neutral-400 text-sm">{desc}</p>
  </div>
);