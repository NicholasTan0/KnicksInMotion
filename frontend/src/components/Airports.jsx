export default function Airports(){
    return (
        <div className="font-inter flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <div className="text-2xl font-bold"><span className="text-green-500">#10</span> - LaGuardia Airport</div>
                <div className="flex gap-1.5 text-sm">
                    <div className="text-neutral-600 dark:text-neutral-400">Pick-up destination of 564 trips</div>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="text-2xl font-bold"><span className="text-yellow-500">#18</span> - JFK Airport</div>
                <div className="flex gap-1.5 text-sm">
                    <div className="text-neutral-600 dark:text-neutral-400">Pick-up destination of 421 trips</div>
                </div>
            </div>

            <blockquote className="border-l-4 border-orange pl-4 my-2">
                <p className="text-sm italic">
                    “Although the [Federal Aviation Administration] does not track Knicks-related travel separately, aviation professionals are seeing many of the same trends that accompany major sporting events.
                    Fans traveling to road games, national media covering the team, corporate sponsors, and business travelers attending playoff events all contribute to increased airline bookings. ”
                </p>

                <footer className="mt-3 text-xs text-neutral-500">
                    — Tanya Austin,{" "}
                    <cite>
                    <a
                        href="https://metroairportnews.com/knicks-fever-takes-flight/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-orange"
                    >
                        “Knicks Fever Takes Flight”
                    </a>
                    </cite>
                    {" "}· June 5, 2026
                </footer>
            </blockquote>

            <blockquote className="border-l-4 border-orange-500 pl-4 my-2">
                <p className="text-sm italic leading-relaxed">
                    “He arrives Monday morning in New York, will attend
                    Game 3 that night, and go right from MSG back to the airport... and fly home on the first flight out Tuesday
                    morning. No other plans, no hotel.”
                </p>

                <footer className="mt-3 text-xs text-neutral-500">
                    — <cite>
                    <a
                        href="https://kvia.com/cnn-sports/2026/06/08/knicks-fans-know-theyre-seeing-something-special-theyre-flying-from-around-the-world-to-nyc-to-be-a-part-of-it-2/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-orange-500"
                    >
                        CNN Sports, “Knicks fans know they’re seeing something special.
                        They’re flying from around the world to NYC to be a part of it”
                    </a>
                    </cite>
                    {" "}· June 8, 2026
                </footer>
            </blockquote>
        </div>
    )
}