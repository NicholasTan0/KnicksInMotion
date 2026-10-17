import { useState } from "react";
import RidePieChart from "./RidePieChart";

const pregameData = [
  { name: "Taxis", trips: 6357 },
  { name: "Uber/Lyft", trips: 15590 },
];

const postgameData = [
  { name: "Taxis", trips: 8686 },
  { name: "Uber/Lyft", trips: 12651 },
];

export default function Services(){
    const [pregame, setPregame] = useState(true)

    return (
        <div className="flex flex-col w-full h-full overflow-hidden">
            <div className="font-bold self-center flex gap-1.5">
                <button onClick={()=>setPregame(!pregame)} className={`relative flex justify-center items-center rounded-lg cursor-pointer w-52.5 h-11.5 bg-neutral-300 dark:bg-neutral-400 border border-neutral-500 text-black`}>
                    <div className={`absolute top-[50%] left-0 translate-y-[-50%] mx-1 rounded-md bg-white h-9 w-25 transition-transform ${!pregame && "translate-x-full"}`}/>
                    <div className="flex w-50 justify-between items-center font-rale">
                        <div className={`flex justify-center items-center flex-1 z-1 ${!pregame && "text-neutral-600"}`}>Pregame</div>
                        <div className={`flex justify-center items-center flex-1 z-1 ${pregame && "text-neutral-600"}`}>Postgame</div>
                    </div>
                </button>
            </div>
            <RidePieChart data={pregame ? pregameData : postgameData}/>
        </div>
    )
}