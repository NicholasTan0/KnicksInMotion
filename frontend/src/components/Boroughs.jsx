const data = {
    "Manhattan": 33149,
    "Queens": 3526,
    "Brooklyn": 5471,
    "Bronx": 1036,
    "Staten Island": 95,
    "EWR": 20
}

export default function Boroughs(){
    return (
        <div className="grid grid-rows-1 gap-4">
            <div className="relative w-full min-h-62.5 flex justify-end overflow-hidden rounded-3xl border-2 border-[green] text-white dark:text-black transition-transform hover:scale-101">
                <img src="/assets/manhattan.jpg" alt="Image" className="w-7/10 h-3/5 object-cover object-center" />
                <div className="absolute inset-y-0 left-[30%] w-1/3 bg-linear-to-r from-current to-transparent"></div>
                <div className="absolute inset-x-0 bottom-[40%] h-1/2 bg-linear-to-t from-current to-transparent"></div>
                {/* <div className="absolute inset-x-0 top-0 h-1/10 bg-linear-to-b from-current to-transparent"></div> */}

                <div className="absolute m-4 text-black dark:text-white flex flex-col gap-0">
                    <div className="font-extrabold text-2xl">#1 - Manhattan</div>
                    <div className="mt-4 mb-6">
                        <div className="font-bold text-3xl">{data.Manhattan.toLocaleString()}</div>
                        <div className="text-neutral-600 text-xl">total trips</div>
                    </div>
                    <p>The highest activity was in Manhattan, with trips centered around Madison Square Garden and surrounding neighborhoods.</p>
                </div>
            </div>
            <div className="relative w-full min-h-62.5 flex justify-end overflow-hidden rounded-3xl border-2 border-[yellow] text-white dark:text-black transition-transform hover:scale-101">
                <img src="/assets/brooklyn.jpg" alt="Image" className="w-7/10 h-3/5 object-cover object-center" />
                <div className="absolute inset-y-0 left-[30%] w-1/3 bg-linear-to-r from-current to-transparent"></div>
                <div className="absolute inset-x-0 bottom-[40%] h-1/2 bg-linear-to-t from-current to-transparent"></div>
                {/* <div className="absolute inset-x-0 top-0 h-1/10 bg-linear-to-b from-current to-transparent"></div> */}

                <div className="absolute m-4 text-black dark:text-white flex flex-col gap-0">
                    <div className="font-extrabold text-2xl">#2 - Brooklyn</div>
                    <div className="mt-4 mb-6">
                        <div className="font-bold text-3xl">{data.Brooklyn.toLocaleString()}</div>
                        <div className="text-neutral-600 text-xl">total trips</div>
                    </div>
                    <p>Brooklyn had substantial activity, particularly in northern neighborhoods and areas near the waterfront (e.g. Brooklyn Bowl).</p>
                </div>
            </div>
            <div className="relative w-full min-h-62.5 flex justify-end overflow-hidden rounded-3xl border-2 border-[orange] text-white dark:text-black transition-transform hover:scale-101">
                <img src="/assets/queens.jpg" alt="Image" className="w-7/10 h-3/5 object-cover object-center" />
                <div className="absolute inset-y-0 left-[30%] w-1/3 bg-linear-to-r from-current to-transparent"></div>
                <div className="absolute inset-x-0 bottom-[40%] h-1/2 bg-linear-to-t from-current to-transparent"></div>
                {/* <div className="absolute inset-x-0 top-0 h-1/10 bg-linear-to-b from-current to-transparent"></div> */}

                <div className="absolute m-4 text-black dark:text-white flex flex-col gap-0">
                    <div className="font-extrabold text-2xl">#3 - Queens</div>
                    <div className="mt-4 mb-6">
                        <div className="font-bold text-3xl">{data.Queens.toLocaleString()}</div>
                        <div className="text-neutral-600 text-xl">total trips</div>
                    </div>
                    <p>Queens saw notable volume overall, especially due to containing both major NYC airports. Activity was scattered relatively evenly within the borough.</p>
                </div>
            </div>
            <div className="relative w-full min-h-62.5 flex justify-end overflow-hidden rounded-3xl border-2 border-[red] text-white dark:text-black transition-transform hover:scale-101">
                <img src="/assets/bronx.jpg" alt="Image" className="w-7/10 h-3/5 object-cover object-center" />
                <div className="absolute inset-y-0 left-[30%] w-1/3 bg-linear-to-r from-current to-transparent"></div>
                <div className="absolute inset-x-0 bottom-[40%] h-1/2 bg-linear-to-t from-current to-transparent"></div>
                {/* <div className="absolute inset-x-0 top-0 h-1/10 bg-linear-to-b from-current to-transparent"></div> */}

                <div className="absolute m-4 text-black dark:text-white flex flex-col gap-0">
                    <div className="font-extrabold text-2xl">#4 - Bronx</div>
                    <div className="mt-4 mb-6">
                        <div className="font-bold text-3xl">{data.Bronx.toLocaleString()}</div>
                        <div className="text-neutral-600 text-xl">total trips</div>
                    </div>
                    <p>The Bronx saw a decent share of trips with just over one thousand, however taking the subway down to Manhattan may have been more preferable.</p>
                </div>
            </div>
            <div className="relative w-full min-h-62.5 flex justify-end overflow-hidden rounded-3xl border-2 border-[purple] text-white dark:text-black transition-transform hover:scale-101">
                <img src="/assets/statenisland.jpg" alt="Image" className="w-7/10 h-3/5 object-cover object-center" />
                <div className="absolute inset-y-0 left-[30%] w-1/3 bg-linear-to-r from-current to-transparent"></div>
                <div className="absolute inset-x-0 bottom-[40%] h-1/2 bg-linear-to-t from-current to-transparent"></div>
                {/* <div className="absolute inset-x-0 top-0 h-1/10 bg-linear-to-b from-current to-transparent"></div> */}

                <div className="absolute m-4 text-black dark:text-white flex flex-col gap-0">
                    <div className="font-extrabold text-2xl">#5 - Staten Island</div>
                    <div className="mt-4 mb-6">
                        <div className="font-bold text-3xl">{data["Staten Island"].toLocaleString()}</div>
                        <div className="text-neutral-600 text-xl">total trips</div>
                    </div>
                    <p>The least activity was in Staten Island, with less than a hundred total trips. The Staten Island Ferry would have seen many more rides.</p>
                </div>
            </div>
        </div>
    )
}