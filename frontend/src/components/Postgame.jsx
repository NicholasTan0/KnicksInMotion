const sources = [
    {
        publication: "Forbes",
        title: "Bars and Restaurants Embrace the Playoff Run",
        date: "June 2, 2026",
        url: "https://www.forbes.com/sites/timcasey/2026/06/02/bars-and-restaurants-near-madison-square-garden-embrace-knicks-playoff-run/",
        domain: "forbes.com",
    },
    {
        publication: "New York Post",
        title: "The Knicks' Boost to NYC Nightlife",
        date: "July 2, 2026",
        url: "https://nypost.com/2026/07/02/us-news/knicks-championship-run-gave-major-boost-to-nycs-nightlife-economy-never-seen-anything-like-this/",
        domain: "nypost.com",
    },
    {
        publication: "New York City Mayor's Office",
        title: "Knicks Postseason Generates Economic Activity for NYC",
        date: "June 3, 2026",
        url: "https://www.nyc.gov/mayors-office/news/2026/06/mayor-mamdani-announces-new-york-knicks-postseason-has-generated",
        domain: "nyc.gov",
    },
    {
        publication: "Inc.",
        title: "How the Knicks' Championship Run Boosted NYC Businesses",
        date: "June 18, 2026",
        url: "https://www.inc.com/brian-contreras/knicks-championship-nyc-business-revenue/91362704",
        domain: "inc.com",
    },
    {
        publication: "New York Post",
        title: "Inside NYC Clubs Where Knicks Stars Celebrated",
        date: "June 19, 2026",
        url: "https://nypost.com/2026/06/19/lifestyle/inside-nyc-clubs-where-knicks-stars-celebrated-title-win/",
        domain: "nypost.com",
    },
];

export default function Postgame(){
    return (
        <section className="mt-2">
            <h3 className="mb-2 text-xs font-semibold tracking-widest text-neutral-500">
                READ THE COVERAGE
            </h3>

            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {sources.map((source) => (
                    <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 py-4"
                    >
                        <img
                            src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=64`}
                            alt=""
                            className="h-6 w-6 shrink-0 rounded-sm"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-snug text-neutral-900 transition-colors group-hover:text-orange dark:text-white">
                                {source.title}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                                {source.publication} · {source.date}
                            </p>
                        </div>

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="shrink-0 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange"
                            aria-hidden="true"
                        >
                            <path d="M7 17 17 7" />
                            <path d="M7 7h10v10" />
                        </svg>
                    </a>
                ))}
            </div>
        </section>
    )
}