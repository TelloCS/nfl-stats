import { useQuery } from "@tanstack/react-query";
import createUpcomingGamesQueryOptions from "../queryOptions/createUpcomingGamesQueryOptions";
import formatDate from "../helpers/utils/"

export default function UpcomingGames() {
    const { data, isPending } = useQuery(createUpcomingGamesQueryOptions())

    return (
        <>
            {isPending ?
                <div className="flex justify-center items-center">
                </div>
                : <div className="flex items-center justify-center">
                    <div className="container mx-auto flex flex-wrap px-8 py-4 gap-4">
                        {data?.map((game, index) => {
                            return (
                                <div key={index} className="text-center text-xs w-[120px] h-full">
                                    <div className="border border-neutral-200 rounded-sm p-2">
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
                </div>}
        </>
    )
}