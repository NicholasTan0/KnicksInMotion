export default function Percentages(){
    return (
        <div className="font-inter flex flex-col gap-6">
            <div className="w-full h-full relative">
                <img src="/assets/zone.webp" className="h-full w-full object-cover border"/>
                <a className="absolute bottom-0 left-0 text-blue-700 hover:underline bg-neutral-200 text-xs p-0.5" href="https://www.cbsnews.com/newyork/news/knicks-game-3-nba-finals-nypd-secret-service-trump-msg/" target="_blank" rel="noopener noreferrer">Source: CBS News New York</a>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="text-2xl font-bold">104 trips → <span className="text-lg">Madison Square Garden</span></div>
                <div className="flex gap-1 text-sm">
                    <div className="text-red-500">▼ -69.1%</div>
                    <div className="text-neutral-600 dark:text-neutral-400">finals average</div>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="text-2xl font-bold">1,433 trips → <span className="text-lg">Bryant Park + Brooklyn Bowl</span></div>
                <div className="flex gap-1 text-sm">
                    <div className="text-orange">83.6%</div>
                    <div className="text-neutral-600 dark:text-neutral-400">of Game 3 trips</div>
                </div>
            </div>

            
        </div>
    )
}