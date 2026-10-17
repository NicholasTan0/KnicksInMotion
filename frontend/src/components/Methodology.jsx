export default function Methodology(){
    return (
        <div 
            className="absolute z-1002 top-0 left-0 w-full h-full flex justify-center items-center backdrop-blur-md bg-neutral-200/90 dark:bg-black/90 text-black dark:text-neutral-100 text-sm py-6"
        >
            <div className="relative w-full max-w-2xl h-full font-rale overflow-y-auto scrollbar-gutter-both scrollbar-thin scrollbar-thumb-neutral-500 flex flex-col gap-2 px-4">
                <h1 className="text-xl font-bold text-center">Knicks in Motion</h1>
                <p>
                    Game-related activity is identified by matching pickup and drop-off locations to monitored locations during defined time windows. The two-hour pregame window captures vehicle arrivals before tipoff, while the three-hour postgame window captures departures after the game ends, including potential postgame travel, lingering, and celebration. For pregame activity, trips arriving at a monitored location are used to identify where vehicles traveled from, with the pickup zone recorded as the origin. For postgame activity, trips departing from a monitored location are used to identify where vehicles traveled afterward, with the drop-off zone recorded as the destination. These trips are aggregated by NYC taxi zone and displayed as raw trip volumes on the map.
                    <br/><br/>
                    The analysis uses the 2026 NYC Taxi and Limousine Commission (TLC) Yellow Taxi, Green Taxi, and High Volume For-Hire Vehicle (FHVHV) datasets. The raw trip records were cleaned and filtered to retain usable data, including pickup and drop-off timestamps, taxi type, and TLC taxi zones. Game information, such as tipoff times, opponents, locations, results, and game durations, was then combined with the trip data to define the analysis windows for each game. Trips were matched to these windows and retained when they were associated with a monitored location relevant to that game.
                    <br/><br/>
                    The resulting records were grouped by game, time period, taxi type, monitored location, and NYC taxi zone, then aggregated into raw trip counts. These processed datasets were exported in structured formats for use in the interactive visualization, allowing users to filter activity by game, series, playoff stage, taxi type, and location. Madison Square Garden is monitored throughout the playoff run, while Central Park, Radio City Music Hall, Bryant Park, and Brooklyn Bowl are included for specific games where relevant.
                    <br/><br/>
                    This analysis measures vehicle trip activity, not people, attendance, or fan movement. Individual trips cannot establish whether a passenger attended a game, supported the Knicks, or traveled specifically because of a game or watch party. Away games may also generate activity in New York City through watch parties and other events. The results should therefore be interpreted as trip activity associated with selected locations and time periods, rather than as a direct measure of game-caused traffic or other game-related effects.
                    <br/><br/>
                </p> 
                <div className="flex flex-col gap-1 items-start text-sm">
                    <h2 className="text-lg font-bold">Sources & References</h2>

                    <details>
                        <summary className="cursor-pointer font-bold my-1">
                            Map Data
                        </summary>
                        <div className="flex flex-col gap-1 pl-3">
                            <div>
                                <a
                                    href="https://visgl.github.io/react-map-gl/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-500 underline"
                                >
                                    @vis.gl/react-maplibre
                                </a>
                                {" + "}
                                <a
                                    href="https://maplibre.org/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-500 underline"
                                >
                                    MapLibre GL JS
                                </a>
                            </div>
                            <div>
                                <a
                                    href="https://openfreemap.org/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-500 underline"
                                >
                                    OpenFreeMap
                                </a>
                                &nbsp;&copy;&nbsp;
                                <a
                                    href="https://www.openmaptiles.org/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-500 underline"
                                >
                                    OpenMapTiles
                                </a>
                                {" Data from "}
                                <a
                                    href="https://www.openstreetmap.org/copyright"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-blue-500 underline"
                                >
                                    OpenStreetMap
                                </a>
                            </div>
                        </div>
                    </details>

                    <details>
                        <summary className="cursor-pointer font-bold my-1">
                            Game Data
                        </summary>
                        <div className="flex flex-col gap-1 pl-3">
                            <a
                                href="https://www.basketball-reference.com/teams/NYK/2026_games.html#all_games_playoffs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 underline"
                            >
                                Basketball Reference — 2026 New York Knicks Schedule
                            </a>
                        </div>
                    </details>

                    <details>
                        <summary className="cursor-pointer font-bold my-1">
                            Trip Data & Documentation
                        </summary>
                        <div className="flex flex-col gap-1 pl-3">
                            <a
                                href="https://data.cityofnewyork.us/d/8meu-9t5y"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 underline"
                            >
                                NYC Open Data — Taxi Zones
                            </a>
                            <a
                                href="https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 underline"
                            >
                                NYC TLC — Trip Record Data
                            </a>
                            <a
                                href="https://www.nyc.gov/assets/tlc/downloads/pdf/data_dictionary_trip_records_hvfhs.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 underline"
                            >
                                NYC TLC — High Volume For-Hire Vehicle Trip Record Data Dictionary
                            </a>
                            <a
                                href="https://www.nyc.gov/assets/tlc/downloads/pdf/data_dictionary_trip_records_yellow.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 underline"
                            >
                                NYC TLC — Yellow Taxi Trip Record Data Dictionary
                            </a>
                            <a
                                href="https://www.nyc.gov/assets/tlc/downloads/pdf/data_dictionary_trip_records_green.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 underline"
                            >
                                NYC TLC — Green Taxi Trip Record Data Dictionary
                            </a>
                        </div>
                    </details>

                    <details>
                        <summary className="cursor-pointer font-bold my-1">
                            Additional References
                        </summary>
                        <div className="flex flex-col gap-1 pl-3">
                        <a
                            href="https://www.nyc.gov/mayors-office/news/2026/06/mayor-mamdani-announces-additional-knicks-watch-party-location-a"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-500 underline"
                        >
                            NYC Mayor's Office — Additional Knicks Watch Party at Bryant Park
                        </a>
                            <a
                                href="https://www.governor.ny.gov/news/go-new-york-go-governor-hochul-announces-mta-preserve-iconic-orange-and-blue-subway-entrance"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 underline"
                            >
                                New York State — MTA Subway Entrance Preservation
                            </a>
                            <a
                                href="https://stylemagazine.com/news/2026/jun/08/knicks-fans-know-theyre-seeing-something-special-theyre-flying-from-around-the-world-to-nyc-to-be-a-part-of-it/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 underline"
                            >
                                Style Magazine — Knicks Fans Travel to New York
                            </a>
                            <a
                                href="https://metroairportnews.com/knicks-fever-takes-flight/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 underline"
                            >
                                Metro Airport News — Knicks Fever Takes Flight
                            </a>
                            <a
                                href="https://sports.yahoo.com/articles/knicks-were-almost-impossible-beat-122323726.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 underline"
                            >
                                Yahoo Sports — Knicks' 2026 Road Playoff Run
                            </a>
                        </div>
                    </details>
                </div>
                <a
                    href="https://github.com/NicholasTan0/KnicksInMotion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-500 underline mt-2 font-mont"
                >
                    Github - @NicholasTan0
                </a>
            </div>
        </div>
    )
}