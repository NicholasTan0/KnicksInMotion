import { Marker, Popup } from "@vis.gl/react-maplibre";
import DefaultMarker from "./DefaultMarker";

export default function Pin({ lat, long, color, text }){
    return (
        <>
            <Marker
                longitude={long}
                latitude={lat}
                className="cursor-pointer"
                onClick={()=>{

                }}
            >
                <div
                    // onMouseEnter={() => setHoveredInfo('Hello Marker!')}
                    // onMouseLeave={() => setHoveredInfo(null)}
                    className="cursor-pointer w-8 h-8"
                >
                    <DefaultMarker color={color}/>
                </div> 
            </Marker>

            {/* MSG */}
            <Popup
                longitude={long}
                latitude={lat}
                anchor="bottom"
                offset={[-3, -18]}
                closeButton={false}
                closeOnClick={false}
                className="font-inter text-xs"
            >
                <div className="text-center pointer-events-none">
                    {text}
                    {/* <br />
                    Max: {maxTrips.toLocaleString()}
                    <br />
                    Total: {totalTrips.toLocaleString()} */}
                </div>
            </Popup>
        </>
    )
}