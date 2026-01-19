import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import { Link } from "react-router-dom";

export default function Home() {
    const [teams, setTeams] = useState([])
    const [groupedTeams, setGroupedTeams] = useState({ 
        AFC: { EAST: [], NORTH: [], SOUTH: [], WEST: [] }, 
        NFC: { EAST: [], NORTH: [], SOUTH: [], WEST: [] } 
    });

    const fetchTeams = async () => {
        try {
            const data = await fetch("/nfl/teams/");
            const resp = await data.json();
            setTeams(resp?.teams || []);
        } catch (error) {
            console.error("Failed to fetch teams:", error);
        }
    };
    
    const groupTeams = (teamsList) => {
        const initialGroup = {
            AFC: { EAST: [], NORTH: [], SOUTH: [], WEST: [] },
            NFC: { EAST: [], NORTH: [], SOUTH: [], WEST: [] }
        };
        
        teamsList.forEach(team => {
            const conference = team.conference;
            const division = team.division;
            
            if (initialGroup[conference] && initialGroup[conference][division]) {
                initialGroup[conference][division].push(team);
            }
        });
        
        setGroupedTeams(initialGroup);
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        if (teams.length > 0) {
            groupTeams(teams);
        }
    }, [teams]);

    const divisionHeaderClass = "text-md font-semibold text-gray-400 mt-4 mb-2 border-b border-gray-400 pb-1";
    const teamLinkClass = "block text-sm text-gray-400 hover:bg-slate-700/50 px-2 py-1 rounded transition duration-150";

    return (
        <>  
            <div className="h-screen w-screen bg-white">
                {/* <div className="m-[1rem] grid grid-cols-2 gap-8 p-4 bg-[#1E293B] rounded-lg shadow-lg">
                    <div>
                        <h2 className="text-2xl font-bold text-[#10B981] mb-4 border-b-2 border-current pb-2">AFC Conference</h2>
                        
                        {Object.keys(groupedTeams.AFC).map((division) => (
                            <div key={division} className="mb-6">
                                <h3 className={divisionHeaderClass}>{division}</h3>
                                <div>
                                    {groupedTeams.AFC[division].map(t =>
                                        <Link key={t.id} to={`/team/${t.slug}`} className={teamLinkClass}>
                                            {t.fullName} ({t.abbreviation})
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#10B981] mb-4 border-b-2 border-current pb-2">NFC Conference</h2>

                        {Object.keys(groupedTeams.NFC).map((division) => (
                            <div key={division} className="mb-6">
                                <h3 className={divisionHeaderClass}>{division}</h3>
                                <div>
                                    {groupedTeams.NFC[division].map(t =>
                                        <Link key={t.id} to={`/team/${t.slug}`} className={teamLinkClass}>
                                            {t.fullName} ({t.abbreviation})
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}
            </div>
        </>
    );
};