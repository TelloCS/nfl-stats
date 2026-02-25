import { Link } from "react-router-dom";
import { ChartColumn, Shield, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-white flex flex-col justify-center overflow-hidden">
      <div className="container mx-auto p-10 relative z-10 mb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-4xl font-bold text-neutral-900 mb-6 tracking-tight leading-tight">
            Advanced NFL Analytics & Stats
          </h1>
          
          <p className="text-lg mb-10 leading-relaxed max-w-2xl text-gray-600">
            Dive deep into weekly matchups, team performance metrics, and player statistics.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <Link 
              to="/team/stats" 
              className="px-8 py-4 text-white bg-neutral-900 rounded-lg font-bold text-lg hover:underline"
            >
              View Team Stats
            </Link>
            <Link 
              to="/position-vs-opponent" 
              className="px-8 py-4 text-white bg-neutral-900 rounded-lg font-bold text-lg hover:underline"
            >
              Analyze Matchups
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-neutral-200 pt-8">
            <Feature 
              icon={<ChartColumn className="text-emerald-400" size={24} />}
              title="Team Rankings"
              desc="Compare offensive and defensive performance across the league."
            />
            <Feature 
              icon={<Shield className="text-blue-400" size={24} />}
              title="Position vs Opponent"
              desc="See how player performs against specific teams."
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
    <div className="mb-2">{icon}</div>
    <h3 className="font-bold text-lg">{title}</h3>
    <p className="text-gray-600 text-sm">{desc}</p>
  </div>
);