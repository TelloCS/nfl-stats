import { useState, useEffect } from "react";

function UpcomingGames() {
    const [ loadGames, setLoadGames ] = useState(false)
    const [ games, setGames ] = useState([])

    useEffect(() => {
        const fetchUpcomingGames = async () => {
            setLoadGames(true)

            try {
                const response = await fetch("/nfl/events/?week=17&status=Final")
                const data = await response.json()
                setGames(data)
            } catch (error) {
            } finally {
                setLoadGames(false)
            }
        }
        fetchUpcomingGames()
        }, [])

    const formatDate = (isoString) => {
        const dateObject = new Date(isoString)

        const options = {
            hour: 'numeric',
            minute: 'numeric',
        };

        const localTime = dateObject.toLocaleTimeString(undefined, options)
        return localTime
    };
    
    return (
        <>
            <div className="flex items-center justify-center">
                <div className="container mx-auto flex flex-wrap">
                    {games.map((game, index) => {
                        return (
                            <div key={index} className="text-center text-xs w-[120px] h-full">
                                <div className="border border-neutral-200 rounded-sm p-1 m-2">
                                    <div className="">
                                        {game.homeTeam.abbreviation} vs {game.awayTeam.abbreviation}
                                    </div>
                                    
                                    <div className="">
                                        {formatDate(game.date)}
                                    </div>

                                    {game.awayTeam?.total.map((value, index) => (
                                        <div key={index} className="">
                                            {value.open_line}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* <div className="flex justify-center w-full">
                <div className="flex overflow-x-auto space-x-3 pb-2">
                    {games.map((game, index) => {
                        return (
                            <div 
                                key={index}
                                className="flex-shrink-0 text-white bg-zinc-800 p-2 rounded-lg shadow transition-transform duration-200 min-w-[120px] text-center"
                            >
                                <div className="font-semibold text-sm">
                                    {game.homeTeam.abbreviation} vs {game.awayTeam.abbreviation}
                                </div>
                                
                                <div className="text-xs text-zinc-400 mt-1">
                                    {formatDate(game.date)}
                                </div>

                                {game.awayTeam?.total.map((value, index) => (
                                    <div key={index} className="text-xs text-zinc-400 mt-1">
                                        {value.open_line}
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div> */}
        </>
    )
}

export default UpcomingGames;