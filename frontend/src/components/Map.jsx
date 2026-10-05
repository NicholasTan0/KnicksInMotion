import { useState, useEffect, useMemo, useRef } from "react";
import {
    Map,
    Source,
    Layer,
    NavigationControl,
} from "@vis.gl/react-maplibre";
import ColorPicker from "./ColorPicker";
import Pin from "./Pin";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
maplibregl.setWorkerUrl(workerUrl);

const MSG = [-73.99361, 40.75056];
const RADIO_CITY = [-73.979977, 40.759976]
const CENTRAL_PARK = [-73.97242, 40.77047];
const BRYANT_PARK = [-73.983559, 40.753742];
const BROOKLYN_BOWL = [-73.957381, 40.721887];
const JFK = [-73.785849, 40.649128];
const LGA = [-73.874189, 40.78];

const BLUE = "#006BB6";
const ORANGE = "#F58426";
const DEFAULT_LOCATIONS = [
    186, // MSG
    43,  // Central Park
    161, // Radio City
    255, // Brooklyn Bowl
    164  // Bryant Park
];

const maxBounds = [
        [-74.26, 40.49],
        [-73.70, 40.92]
    ];
const locations = [
    { 
        id: 43, 
        name: "Central Park",
        long: CENTRAL_PARK[0],
        lat: CENTRAL_PARK[1],
    },
    { 
        id: 161, 
        name: "Radio City Music Hall",
        long: RADIO_CITY[0],
        lat: RADIO_CITY[1],
    },
    { 
        id: 255, 
        name: "Brooklyn Bowl",
        long: BROOKLYN_BOWL[0],
        lat: BROOKLYN_BOWL[1],
    },
    { 
        id: 164, 
        name: "Bryant Park",
        long: BRYANT_PARK[0],
        lat: BRYANT_PARK[1],
    },
    { 
        id: 186, 
        name: "Madison Square Garden",
        long: MSG[0],
        lat: MSG[1],
    },
];

const funFacts = [
    "The Knicks set an NBA playoff record with a 47-point halftime lead against the Atlanta Hawks.",
    "The Knicks won 13 consecutive postseason games, tying the 2017 Warriors for the second-longest streak in NBA playoff history.",
    "Defeating the San Antonio Spurs in five games earned the Knicks their first NBA championship since 1973.",
    "The Knicks became the first team to win both the NBA Cup and the NBA Championship in the same season.",
    "Across a 16-3 playoff record, the Knicks' three total losses were by a combined margin of six points.",
    "An eight-game postseason road winning streak tied the 2001 Lakers for the longest in NBA history.",
    "The Knicks tied the NBA playoff single-game record by making 25 three-pointers against the 76ers in Game 4.",
    "The Knicks overcame a 27-point halftime deficit in Game 4 of the Finals, marking the largest halftime comeback in NBA Finals history.",
    "Madison Square Garden sold out all home playoff games, with total attendance exceeding 178,000 fans.",
    "Approximately 70% of current New York City residents were born after the franchise's previous title in 1973.",
    "The Knicks were 6-2 in playoff games where they were down by double-digits.",
    "The Knicks outscored their opponents by 14.9 points per game, the best point differential in NBA playoff history.",
    "The Knicks had +2200 odds to win the finals before round 1 started, the lowest odds for a champion in NBA history.",
    "The average sold price for a ticket at MSG during Game 3 of the NBA Finals was $7,683. The most expensive ticket was around $65,000."
];

export default function MapView({ theme, mode, setMode }) {
    const mapRef = useRef(null);
    const hoveredFeature = useRef(null);
    const tooltipRef = useRef(null);
    const tooltipNameRef = useRef(null);
    const tooltipCountRef = useRef(null);

    const hideTooltip = () => {
        if (tooltipRef.current) tooltipRef.current.style.opacity = "0";
    };

    const [zones, setZones] = useState(null);
    const [gameStats, setGameStats] = useState([]);
    const [seriesStats, setSeriesStats] = useState([]);
    const [playoffsStats, setPlayoffsStats] = useState([]);
    const [metadata, setMetadata] = useState([]);
    const [page, setPage] = useState(1);

    const [isOpen, setIsOpen] = useState(false);
    const [level, setLevel] = useState("playoffs");
    const [selectedGame, setSelectedGame] = useState(1);
    const [selectedSeries, setSelectedSeries] = useState("r1");
    const [selectedHomeAway, setSelectedHomeAway] = useState("both");
    const [selectedPeriod, setSelectedPeriod] = useState("post-game");
    const [selectedTaxiType, setSelectedTaxiType] = useState("all");
    const [selectedLocations, setSelectedLocations] = useState(DEFAULT_LOCATIONS);

    const [lineColor, setLineColor] = useState(theme === "dark"
            ? "white"
            : theme === "light"
                ? "black"
                : window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "white"
                    : "black");
    const [startColor, setStartColor] = useState(BLUE);
    const [endColor, setEndColor] = useState(ORANGE);
    const [showPopup, setShowPopup] = useState(false);
    const [intensity, setIntensity] = useState(6);
    const [fillOpacity, setFillOpacity] = useState(75);
    const [random, setRandom] = useState(Math.floor(Math.random() * funFacts.length));
    const [showMetadata, setShowMetadata] = useState(false);
    const [showAttribution, setShowAttribution] = useState(false);
    const [showVisualization, setShowVisualization] = useState(true);
    const [showAnalysis, setShowAnalysis] = useState(true);
    const [showAbout, setShowAbout] = useState(true);
    const [showTotal, setShowTotal] = useState(true);
    
    useEffect(() => {
        const ac = new AbortController();
        const load = async (url) => {
            const res = await fetch(url, { signal: ac.signal });
            if (!res.ok) throw new Error(`${url} → ${res.status}`);
            return res.json();
        };

        Promise.all([
            "/data/taxi_zones.geojson",
            "/data/game_zone_stats.json",
            "/data/series_zone_stats.json",
            "/data/playoffs_zone_stats.json",
            "/data/games.json",
        ].map(load))
            .then(([geojson, game, series, playoffs, games]) => {
            setZones(geojson); setGameStats(game); setSeriesStats(series);
            setPlayoffsStats(playoffs); setMetadata(games);
            })
            .catch(err => { if (err.name !== "AbortError") console.error(err.message); });

        return () => ac.abort();
    }, []);

    const mapStyle =
        theme === "dark"
            ? "https://tiles.openfreemap.org/styles/dark"
            : theme === "light"
                ? "https://tiles.openfreemap.org/styles/positron"
                : window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "https://tiles.openfreemap.org/styles/dark"
                    : "https://tiles.openfreemap.org/styles/positron";

    useEffect(()=>{
        if(level !== "playoffs") setShowMetadata(true);
        if(level === "game") setSelectedHomeAway("both")
    }, [level])

    const handleSeriesChange = (series) => {
        const current = metadata.find(g => g.id === selectedGame);
        const seriesGames = metadata.filter(g => g.series === series);
        const match = seriesGames.find(g => g.game === current?.game) ?? seriesGames[0];
        setSelectedSeries(series);
        if (match) setSelectedGame(match.id);
    };

    useEffect(()=>{
        setIsOpen(false);
        setPage(1);
        setShowMetadata(false);

        if(mode === "visualization") {
            setShowVisualization(true);
        }
        else if(mode === "analysis") {
            setShowAnalysis(true);
            mapRef.current?.fitBounds(maxBounds, {
                pitch: 0,
                padding: 50,
                duration: 2000,
            });
        }
        else {
            setShowAbout(true);
            // mapRef.current?.fitBounds(maxBounds, {
            //     pitch: 0,
            //     padding: 50,
            //     duration: 2000,
            // });
        }
    }, [mode])
    
    useEffect(()=>{
        hideTooltip();

        if(mode === "visualization"){
            if(page === 1){
                mapRef.current?.flyTo({
                    center: MSG,
                    zoom: 11,
                    pitch: 0,
                    padding: { top: 0, bottom: 0, left: 0, right: 300 },
                    bearing: 0,
                    duration: 2000
                });
            }
            else if(page === 2){
                mapRef.current?.flyTo({
                    center: MSG,
                    zoom: 12,
                    pitch: 39,
                    bearing: 0,
                    duration: 2000
                });
            }
        }
        else if(mode === "analysis")
        {
            if(page === 1){
                mapRef.current?.fitBounds(maxBounds, {
                    pitch: 0,
                    padding: 50,
                    duration: 2000,
                });
            }
            else if(page === 2){
                setShowMetadata(false);
                mapRef.current?.flyTo({
                    center: [(JFK[0] + LGA[0])/2, (JFK[1] + LGA[1])/2],
                    zoom: 11,
                    pitch: 0,
                    offset: [150,0],
                    duration: 2000,
                });
                setLevel("playoffs");
                setSelectedHomeAway("both");
                setSelectedTaxiType("all");
                setSelectedPeriod("pre-game");
                setSelectedLocations(DEFAULT_LOCATIONS);
                setShowPopup(false);
                setIntensity(6);
            }
            else if(page === 3){
                mapRef.current?.flyTo({
                    center: MSG,
                    offset: [-150, 50],
                    zoom: 12,
                    bearing: 29,
                    duration: 2000
                });
                setLevel("game");
                setSelectedSeries("finals");
                setSelectedGame(17)
                setSelectedHomeAway("both");
                setSelectedTaxiType("all");
                setSelectedPeriod("pre-game");
                setSelectedLocations([186, 43, 255, 164]);
                setShowPopup(true);
                setShowMetadata(true);
                setIntensity(6);
            }
            else if(page === 4){
                setShowMetadata(false);
                mapRef.current?.flyTo({
                    center: MSG,
                    offset: [-100, -150],
                    zoom: 13,
                    bearing: 29,
                    duration: 2000
                });
                setLevel("playoffs");
                setSelectedHomeAway("both");
                setSelectedTaxiType("all");
                setSelectedPeriod("post-game");
                setSelectedLocations(DEFAULT_LOCATIONS);
                setShowPopup(false);
                setIntensity(8);
            }
            else if(page === 5){
                setShowMetadata(false);
                mapRef.current?.fitBounds(maxBounds, {
                    pitch: 0,
                    padding: 50,
                    duration: 2000,
                });
                setLevel("playoffs");
                setSelectedHomeAway("both");
                setSelectedTaxiType("yellow");
                setSelectedPeriod("pre-game");
                setSelectedLocations(DEFAULT_LOCATIONS);
                setShowPopup(false);
                setIntensity(6);
            }
            else if(page === 6){
                setShowMetadata(false);
                mapRef.current?.fitBounds(maxBounds, {
                    pitch: 0,
                    padding: 50,
                    duration: 2000,
                });
                setLevel("playoffs");
                setSelectedHomeAway("home");
                setSelectedTaxiType("all");
                setSelectedPeriod("post-game");
                setSelectedLocations(DEFAULT_LOCATIONS);
                setShowPopup(false);
                setIntensity(6);
            }
        }
    }, [page])


    const zoneData = useMemo(() => {
        let stats;

        if (level === "game") {
            stats = gameStats;
        } else if (level === "series") {
            stats = seriesStats;
        } else {
            stats = playoffsStats;
        }

        const data = {};

        stats
            .filter(stat => {
                if (stat.period !== selectedPeriod) return false;

                if (
                    selectedHomeAway !== "both" &&
                    stat.home !== (selectedHomeAway === "home")
                ) {
                    return false;
                }

                if (
                    level === "game" &&
                    stat.game_id !== Number(selectedGame)
                ) {
                    return false;
                }

                if (
                    level === "series" &&
                    stat.series !== selectedSeries
                ) {
                    return false;
                }

                if (
                    selectedTaxiType !== "all" &&
                    stat.taxi_type !== selectedTaxiType
                ) {
                    return false;
                }

                if (!selectedLocations.includes(stat.attention_zone_id)) {
                    return false;
                }

                return true;
            })
            .forEach(stat => {
                data[stat.zone_id] =
                    (data[stat.zone_id] || 0) +
                    Number(stat.trip_count);
            });

        return data;
    }, [
        level,
        gameStats,
        seriesStats,
        playoffsStats,
        selectedGame,
        selectedSeries,
        selectedHomeAway,
        selectedPeriod,
        selectedTaxiType,
        selectedLocations
    ]);

    const availableLocations = useMemo(() => {
        const stats =
            level === "game"
                ? gameStats
                : level === "series"
                ? seriesStats
                : playoffsStats;

        const availableIds = new Set(
            stats
                .filter(stat => {
                    if (stat.period !== selectedPeriod) return false;

                    if (
                        selectedHomeAway !== "both" &&
                        stat.home !== (selectedHomeAway === "home")
                    ) {
                        return false;
                    }

                    if (
                        level === "game" &&
                        stat.game_id !== Number(selectedGame)
                    ) {
                        return false;
                    }

                    if (
                        level === "series" &&
                        stat.series !== selectedSeries
                    ) {
                        return false;
                    }

                    if (
                        selectedTaxiType !== "all" &&
                        stat.taxi_type !== selectedTaxiType
                    ) {
                        return false;
                    }

                    return true;
                })
                .map(stat => stat.attention_zone_id)
        );

        return locations.filter(location =>
            availableIds.has(location.id)
        );
    }, [
        level,
        gameStats,
        seriesStats,
        playoffsStats,
        selectedGame,
        selectedSeries,
        selectedHomeAway,
        selectedPeriod,
        selectedTaxiType
    ]);

    const maxTrips = useMemo(() => {
        return Object.entries(zoneData)
            .map(([zoneId, trips]) => {
                const zone = zones?.features.find(
                    feature =>
                        Number(feature.properties.location_id) === Number(zoneId)
                );

                return {
                    id: Number(zoneId),
                    name: zone?.properties.zone ?? "Unknown",
                    trips
                };
            })
            .sort((a, b) => b.trips - a.trips);
    }, [zoneData, zones]);

    const totalTrips = Object.values(zoneData).reduce(
        (sum, trips) => sum + Number(trips),
        0
    );

    function choropleth(start, end, steps) {
        const hexToRgb = hex => {
            hex = hex.replace("#", "");

            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16)
            };
        };

        const rgbToHex = ({ r, g, b }) => {
            return (
                "#" +
                [r, g, b]
                    .map(value =>
                        Math.round(value)
                            .toString(16)
                            .padStart(2, "0")
                    )
                    .join("")
            );
        };

        const startRgb = hexToRgb(start);
        const endRgb = hexToRgb(end);

        return Array.from({ length: steps }, (_, i) => {
            const t = i / (steps - 1);

            return rgbToHex({
                r: startRgb.r + (endRgb.r - startRgb.r) * t,
                g: startRgb.g + (endRgb.g - startRgb.g) * t,
                b: startRgb.b + (endRgb.b - startRgb.b) * t
            });
        });
    }

    const colors = useMemo(
        () => choropleth(
            startColor,
            endColor,
            Math.max(2, 10 - intensity)
        ),
        [startColor, endColor, intensity]
    );

    const tripsExpr = useMemo(() => [
        "number",
        ["get", ["to-string", ["get", "location_id"]], ["literal", zoneData]],
        0,
    ], [zoneData]);

    const fillColor = useMemo(() => {
        if (!maxTrips.length || maxTrips[0].trips <= 0) return "transparent";
        const stops = colors.map((color, i) => [
            Math.expm1((i / (colors.length - 1)) * Math.log1p(maxTrips[0].trips)),
            color,
        ]);
        return ["case", ["==", tripsExpr, 0], "transparent",
            ["interpolate", ["linear"], tripsExpr, ...stops.flat()]];
    }, [colors, maxTrips, tripsExpr]);

    const zoneFillLayer = useMemo(() => ({ 
        id: "taxi-zones-fill", 
        type: "fill", 
        source: "taxi-zones", 
        paint: { 
            "fill-color": fillColor, 
            "fill-opacity": fillOpacity/100, 
        } 
    }), [fillColor, fillOpacity]);

    const zoneOutlineLayer = useMemo(() => ({
        id: "taxi-zones-outline",
        type: "line",
        source: "taxi-zones",
        paint: {
            "line-color": lineColor,
            "line-width": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                4,
                1
            ]
        }
    }), [lineColor]);

    const handleMouseMove = (event) => {
        const map = event.target;
        if(map.isMoving()) return;
        const feature = event.features?.[0];
        if (!feature) return;

        if (hoveredFeature.current !== feature.id) {
            if (hoveredFeature.current !== null) {
                map.setFeatureState({ source: "taxi-zones", id: hoveredFeature.current }, { hover: false });
            }
            map.setFeatureState({ source: "taxi-zones", id: feature.id }, { hover: true });
            hoveredFeature.current = feature.id;

            const id = Number(feature.properties.location_id);
            tooltipNameRef.current.textContent = feature.properties.zone;
            tooltipCountRef.current.textContent = `${(zoneData[id] ?? 0).toLocaleString()} trips`;
            tooltipRef.current.style.opacity = "1";
        }

        const el = tooltipRef.current;
        if (el) {
            const { clientWidth: W } = map.getContainer();
            const w = el.offsetWidth;
            const h = el.offsetHeight;
            const gap = 12;

            const x = Math.min(Math.max(event.point.x, w / 2), W - w / 2);

            const above = event.point.y - gap - h >= 0;
            const y = above ? event.point.y - gap : event.point.y + gap;

            el.style.transform = `translate(${x}px, ${y}px) translate(-50%, ${above ? "-100%" : "0"})`;
        }

        if (hoveredFeature.current === feature.id) return;
        if (hoveredFeature.current !== null) {
            map.setFeatureState({ source: "taxi-zones", id: hoveredFeature.current }, { hover: false });
        }
        map.setFeatureState({ source: "taxi-zones", id: feature.id }, { hover: true });
        hoveredFeature.current = feature.id;
    };

    const handleMouseLeave = event => {
        const map = event.target;

        if (hoveredFeature.current !== null) {
            map.setFeatureState(
                {
                    source: "taxi-zones",
                    id: hoveredFeature.current
                },
                { hover: false }
            );

            hoveredFeature.current = null;
        }

        hideTooltip();
    };

    const handleClick = (event) => {
        const feature = event.features?.[0];
        if (!feature) return;
        const id = Number(feature.properties.location_id);
        const full = zones?.features.find(f => Number(f.properties.location_id) === id);

        let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
        const extend = (c) => {
            if (typeof c[0] === "number") {
                minLng = Math.min(minLng, c[0]);
                maxLng = Math.max(maxLng, c[0]);
                minLat = Math.min(minLat, c[1]);
                maxLat = Math.max(maxLat, c[1]);
            } else {
                c.forEach(extend);
            }
        };
        extend((full ?? feature).geometry.coordinates);

        if (!isFinite(minLng)) return;

        event.target.fitBounds(
            [[minLng, minLat], [maxLng, maxLat]],
            { padding: 50, duration: 1000 }
        );
    };

    function getGameInfo(selectGame) {
        const game = metadata.find(item => item.id === selectGame);
        const date = game
            ? new Date(game.tipoff).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZone: "America/New_York",
                timeZoneName: "short",
            })
            : "";

        const opponent = game?.opponent ?? "";
        const score = game?.score ?? "";
        const won = game?.won ?? false;
        const home = game?.home ?? false;
        const gameNumber = game?.game ?? selectedGame;

        return {
            date,
            opponent,
            score,
            won,
            home,
            gameNumber,
        };
    }

    function getSeriesInfo(selectSeries) {
        const series = metadata.filter(game => game.series === selectSeries);
        const startDate = series.length
            ? new Date(series.at(0).tipoff).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                timeZone: "America/New_York",
            })
            : "";
        const endDate = series
            ? new Date(series.at(-1).tipoff).toLocaleString("en-US", {
                day: "numeric",
                timeZone: "America/New_York",
            })
            : "";

        const opponent = series[0]?.opponent ?? "";
        const wins = series.filter(game => game.won === true).length;
        const losses = series.filter(game => game.won === false).length;
        const homeGames = series.filter(game => game.home === true).length;
        const awayGames = series.filter(game => game.home === false).length;
        const totalGames = wins + losses;

        return {
            startDate,
            endDate,
            opponent,
            wins,
            losses,
            homeGames,
            awayGames,
            totalGames
        };
    }

    return (
        <div className="relative w-full flex-1">
            <Map
                mapLib={maplibregl}
                ref={mapRef}
                initialViewState={{
                    longitude: MSG[0],
                    latitude: MSG[1],
                    padding: { top: 0, bottom: 0, left: 0, right: 300 },
                    zoom: 11,
                    pitch: 0,
                    bearing: 0,
                }}
                minZoom={8}
                maxZoom={20}
                maxPitch={65}
                // maxBounds={maxBounds}
                mapStyle={mapStyle}
                className="w-full h-full"
                interactiveLayerIds={[
                    "taxi-zones-fill"
                ]}
                onMoveStart={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onDblClick={handleClick}
                doubleClickZoom={false}
                attributionControl={false}
            >

                {/* 3D buildings */}
                <Layer
                    id="3d-buildings"
                    type="fill-extrusion"
                    source="openmaptiles"
                    source-layer="building"
                    minzoom={13}
                    filter={[
                        "!=",
                        ["get", "hide_3d"],
                        true
                    ]}
                    paint={{
                        "fill-extrusion-color": "#c8c8c8",

                        "fill-extrusion-height": [
                            "interpolate",
                            ["linear"],
                            ["zoom"],
                            13,
                            0,
                            16,
                            ["get", "render_height"]
                        ],

                        "fill-extrusion-base": [
                            "interpolate", 
                            ["linear"], 
                            ["zoom"], 
                            13, 
                            0, 
                            16, 
                            ["get", "render_min_height"]
                        ],

                        "fill-extrusion-opacity": 0.65
                    }}
                />

                {/* Taxi zones */}
                {zones && (
                    <Source
                        id="taxi-zones"
                        type="geojson"
                        data={zones}
                        promoteId="location_id"
                    >
                        <Layer {...zoneFillLayer} />
                        <Layer {...zoneOutlineLayer} />
                    </Source>
                )}

                {showPopup && <>
                    {availableLocations
                        .filter(location => selectedLocations.includes(location.id))
                        .map(location => (
                            <Pin
                                key={location.id}
                                long={location.long}
                                lat={location.lat}
                                color="#3FB1CE"
                                text={<strong>⭐ {location.name}</strong>}
                            /> 
                        ))}
                </>}

                {(mode === "analysis" && page === 2) && <>
                    <Pin
                        long={JFK[0]}
                        lat={JFK[1]}
                        color="red"
                        text={<strong>⭐ John F. Kennedy International Airport</strong>}
                    />
                    <Pin
                        long={LGA[0]}
                        lat={LGA[1]}
                        color="red"
                        text={<strong>⭐ LaGuardia Airport</strong>}
                    />
                </>}

                <div
                    ref={tooltipRef}
                    className="absolute top-0 left-0 pointer-events-none px-2 py-1 text-sm font-inter bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 border border-neutral-500 transition-opacity duration-100 opacity-0"
                >
                    <strong ref={tooltipNameRef} />
                    <br />
                    <span ref={tooltipCountRef} />
                </div>

                <div className="hidden sm:flex flex-col absolute top-2.5 right-2.5 w-min justify-center items-start p-2 border border-neutral-500 bg-white/90 dark:bg-black/90 text-neutral-800 dark:text-neutral-200 text-base font-mont z-1002">
                    <div className="flex justify-between items-center gap-2 w-full">
                        <div className="font-bold text-nowrap">Total Trips: {totalTrips.toLocaleString()}</div>
                        <button className="cursor-pointer flex justify-center items-center" onClick={()=>setShowTotal(!showTotal)} title={showTotal ? "Hide" : "Show"}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1rem" height="1rem" fill="currentColor" className={`transition-all duration-200 ${showTotal && "-scale-y-100"}`} viewBox="0 0 16 16">
                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                            </svg>
                        </button>
                    </div>
                    {showTotal && <div>
                        <hr className="my-1 w-full"></hr>
                        <ol className="list-decimal list-inside">
                            {maxTrips.slice(0,5).map(zone => <li key={zone.id}>
                                {zone.name} ({zone.trips})
                            </li>)}
                        </ol>
                    </div>}
                </div>
                
                <NavigationControl
                    position="bottom-right"
                    showCompass={true}
                    showZoom={true}
                    visualizePitch={true}
                />

                {/* STORY */}
                {(mode === "visualization") && <div 
                    className={`absolute z-1002 top-0 left-0 w-full md:w-1/3 text-white text-sm lg:text-base transition-opacity duration-300 ${isOpen && "opacity-0"} ${showVisualization ? "" : "-translate-x-[calc(100%-120px)] w-min!"}`}
                >
                    <div className="m-2.5 relative p-5 pt-7 pb-3 rounded-none border-2 border-neutral-500 bg-white/95 dark:bg-black/90 text-black dark:text-neutral-100 font-rale text-center">
                        <button className="absolute top-1 right-1 p-2 text-3xl cursor-pointer" onClick={()=>setShowVisualization(!showVisualization)} title={showVisualization ? "Hide" : "Show"}>
                            {showVisualization ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                            </svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
                            </svg>}
                        </button>
                        <div className={`${!showVisualization && "hidden"}`}>
                            <span className="mb-0.5 font-bold block text-lg">&ndash; Knicks in Motion &ndash;</span>
                            {page === 1 && <p>
                                This visualization explores taxi and for-hire vehicle activity throughout New York City during the New York Knicks' 2026 NBA playoff run, covering all 19 games played from the First Round 
                                through the NBA Finals. Using the NYC Taxi and Limousine Commission's <a href="https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-semibold hover:underline">trip record data</a>, 
                                this project maps raw trip volumes across NYC <a href="https://data.cityofnewyork.us/Transportation/NYC-Taxi-Zones/8meu-9t5y/about_data" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-semibold hover:underline">taxi zones</a> to
                                show where they originated before games and where they ended after games. The analysis accounts for locations associated with game-related activity, including Madison Square Garden
                                and team-sanctioned watch party locations. By combining these geographic patterns with information about each game, this project provides an interactive view of trip activity 
                                throughout the Knicks' 2026 playoff run.
                            </p>}
                            {page === 2 && <p>
                                To get started, use the map controls in the top left to select a playoff series or individual game, choose a pregame or postgame period, and filter the data by home or away game, 
                                taxi type, and location when applicable. In the pregame view (Trip Context: Going To), the map shows the zones where trips originated before arriving at a monitored location. 
                                In the postgame view (Trip Context: Leaving From), it shows the zones where trips ended after departing from a monitored location. Higher contrast areas represent greater raw trip volume. 
                                Use the map to zoom and pan across New York City, and hover over individual zones to view their trip volumes. Check out the <button className="cursor-pointer text-blue-500 font-semibold hover:underline" onClick={()=>setMode("analysis")}>Analysis</button> section 
                                for more information on what can be learned from this data and check out the <button className="cursor-pointer text-blue-500 font-semibold hover:underline" onClick={()=>setMode("about")}>Methodology</button> section for the details behind this project.
                            </p>}
                            <div className="relative w-full flex items-center h-8 mt-2">
                                {page !== 1 && <button className="absolute left-0 cursor-pointer p-0.5" onClick={()=>{
                                    setPage(page === 1 ? 2 : page - 1);
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                                    </svg>
                                </button>}
                                <span className="text-xs absolute left-[50%] translate-x-[-50%]">
                                    <strong>{page} of 2</strong>
                                </span>
                                {page !== 2 ? <button className="absolute right-0 cursor-pointer p-0.5" onClick={()=>{
                                    setPage(page === 2 ? 1 : page + 1)
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                                    </svg>
                                </button> :
                                <button className="absolute right-0 cursor-pointer p-1 text-sm font-bold text-blue hover:underline" 
                                onClick={()=>{
                                    setShowVisualization(false);
                                    setIsOpen(true);
                                    hideTooltip();
                                    mapRef.current?.fitBounds(maxBounds, {
                                        pitch: 0,
                                        offset: [100, 0],
                                        duration: 2000,
                                    });
                                    setShowMetadata(false);
                                }}>
                                    Get Started
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>}

                {/* ANALYSIS */}
                {(mode === "analysis") && <div 
                    className={`absolute z-1002 top-0 left-0 w-full md:w-1/3 text-white text-sm lg:text-base transition-opacity duration-300 ${isOpen && "opacity-0"} ${showAnalysis ? "translate-x-0" : "-translate-x-[calc(100%-120px)] w-min!"}`}
                >
                    <div className="m-2.5 relative p-5 pt-7 pb-3 rounded-none border-2 border-neutral-500 bg-white/95 dark:bg-black/90 text-black dark:text-neutral-100 font-rale text-center">
                        <button className="absolute top-1 right-1 p-2 text-3xl cursor-pointer" onClick={()=>setShowAnalysis(!showAnalysis)} title={showAnalysis ? "Hide" : "Show"}>
                            {showAnalysis ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                            </svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
                            </svg>}
                        </button>
                        <div className={`${!showAnalysis && "hidden"}`}>
                            {page === 1 && <p>
                                <span className="mb-1 font-bold block text-lg ">&ndash; What Can We Learn? &ndash;</span>
                                By using the filters available in the sidebar, we are able to visualize very specific movements throughout New York City during the playoffs. 
                                Let's walk through a few of these cases. 
                                <br/>
                                <em>(Note: The filters will be applied automatically for each, however please feel free to open the sidebar at any time to see which are in effect.)</em>
                            </p>}
                            {page === 2 && <p>
                                <span className="mb-1 font-bold block text-lg ">&ndash; Knicks Fans Travel Well &ndash;</span>
                                Some notable patterns we can visualize are the areas that generated the most traffic en route to Knicks games. As shown below, noticeable hotspots appear around the 
                                major NYC airports (JFK and LaGuardia), highlighting them as significant origins of trips to MSG, Central Park, Radio City Music Hall, Bryant Park, and Brooklyn Bowl 
                                before games. Across the playoffs, nearly a thousand trips traveled directly from JFK & LaGuardia to these areas within the two hours leading up to tipoff, revealing 
                                a notable flow of airport traffic into Manhattan and its surrounding areas on game days. Moreover, the vast majority of trips originated from Lower and Midtown Manhattan.
                            </p>}
                            {page === 3 && <p>
                                <span className="mb-1 font-bold block text-lg ">&ndash; President's Day &ndash;</span>
                                President Donald Trump attended Game 3 of the 2026 NBA Finals at Madison Square Garden, becoming the first sitting U.S. president to attend an NBA Finals game.
                                By applying the right filters, we can examine the impact that his presence had on trips throughout NYC on this day. There was a 20% decrease in the number 
                                of trips going to MSG compared to the other games in the Finals, most likely due to the street closures and cancellation of the outdoor watch party. Conversely, 
                                there was a large number of trips going to Central Park (Wollman Rink), Bryant Park and Brooklyn Bowl, the other team-sanctioned watch party locations.
                                In fact, nearly half of all trips were headed to Brooklyn Bowl before tipoff of Game 3.
                            </p>}
                            {page === 4 && <p>
                                <span className="mb-1 font-bold block text-lg ">&ndash; Postgame Pursuits &ndash;</span>
                                Let's shift our focus to where trips traveled to after the buzzer sounds. These trips highlight the destinations that saw the most activity in the 3 hours following
                                the end of the game. Aside from the majority of fans flooding the streets surrounding MSG, the zones with the highest volumes of trips were East Village and Murray Hill. 
                                Both are major late-night neighborhoods due to their high concentration of bars, restaurants, and general nightlife activities. Several other neighborhoods within Manhattan 
                                also received similar attention, such as Upper East Side, West Village, and Hell's Kitchen.
                            </p>}
                            {page === 5 && <p>
                                <span className="mb-1 font-bold block text-lg ">&ndash; A Dying Service? &ndash;</span>
                                Another interesting statistical trend that can be examined is the usage of taxi (yellow and green) vs. ride-share (Uber and Lyft) services. As you can see, the map becomes 
                                much more sparse when filtering for taxi rides only, comprising of only 29% of all pregame rides. However, this number jumps to around 41% for postgame rides, most likely 
                                due the availability and sheer amount of taxis in Manhattan. Although taxis are nowhere near extinct, it is clear that most riders opted to take an Uber or Lyft instead
                                throughout the playoffs.
                            </p>}
                            {page === 6 && <p>
                                <span className="mb-1 font-bold block text-lg ">&ndash; Home vs. Away &ndash;</span>
                                As expected, home games generated roughly 2,000 more pregame trips than away games, with over 74% going to Madison Square Garden. After the games, however, the difference 
                                largely disappears, with away games actually producing slightly more postgame trips overall. This may reflect the broader NYC activity captured by the three-hour postgame window, 
                                including watch parties, nightlife, and other trips unrelated to the game itself (e.g. evening rush hour). Much like the Knicks' championship run, home-court advantage seems to 
                                have been completely optional, as they went 9&ndash;1 on the road and closed out every series away from home. Our data tells a similar story: home and away games produced 
                                remarkably similar levels of postgame trip activity.
                            </p>}
                            <div className="relative w-full flex items-center h-8 mt-2">
                                {page !== 1 && <button className="absolute left-0 cursor-pointer p-0.5" onClick={()=>{
                                    setPage(page === 1 ? 6 : page - 1);
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                                    </svg>
                                </button>}
                                <span className="text-xs absolute left-[50%] translate-x-[-50%]">
                                    <strong>{page} of 6</strong>
                                </span>
                                {page !== 6 ? <button className="absolute right-0 cursor-pointer p-0.5" onClick={()=>{
                                    setPage(page === 6 ? 1 : page + 1)
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
                                    </svg>
                                </button> :
                                <button className="absolute right-0 cursor-pointer p-1 text-sm font-bold text-blue hover:underline" 
                                onClick={()=>{
                                    setMode("about");
                                }}>
                                    Learn More
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>}

                {/* ABOUT */}
                {(mode === "about" && showAbout) && <div 
                    className={`absolute z-1002 top-0 left-0 w-full h-full flex justify-center items-center bg-white/95 dark:bg-black/90 text-black dark:text-neutral-100 text-sm py-6`}
                >
                    <div className="relative w-full sm:w-1/3 h-full font-rale overflow-y-auto scrollbar-gutter-both scrollbar-thin scrollbar-thumb-neutral-500 flex flex-col gap-2 px-4">
                        <h1 className="text-xl font-bold text-center">Knicks in Motion</h1>
                        <p>
                            How does New York City move when the Knicks play? Knicks in Motion explores taxi and for-hire vehicle activity surrounding the Knicks' 2026 NBA Playoff games, 
                            using NYC Taxi & Limousine Commission trip records to visualize where trips originated before games and where they traveled afterward.
                            Game-related activity is identified using pickup and drop-off locations in relation to monitored locations associated with each game. 
                            During the two hours before tipoff, trips arriving at a monitored location are used to represent where vehicles traveled from. During 
                            the three hours after a game ends, trips departing from a monitored location are used to represent where vehicles traveled afterward. 
                            The resulting trips are aggregated by NYC taxi zone and displayed as raw trip volumes on the map.
                            The underlying trip records were cleaned and transformed to retain the fields necessary for the analysis, including pickup and drop-off timestamps, 
                            taxi type, and TLC taxi zones. Individual trips were then matched to the defined pre-game and post-game windows and retained when they were associated 
                            with a monitored location for that particular game. Madison Square Garden is monitored throughout the playoff run, while Central Park, Radio City Music Hall, 
                            Bryant Park, and Brooklyn Bowl are included for specific games where relevant.
                            <br/><br/>
                            The visualization includes Yellow Taxi, Green Taxi, and High Volume For-Hire Vehicle (FHVHV) records from the 2026 TLC trip datasets. 
                            Game information, including tipoff times, opponents, locations, results, and game durations, is used to define the temporal boundaries of each analysis period.
                            The data provides a view of vehicle activity, rather than a direct measurement of people or Knicks fans. Individual trips do not indicate whether a passenger attended a game, 
                            was a Knicks fan, or was traveling specifically because of a game or watch party. Similarly, away games can still generate substantial activity in New York City through watch 
                            parties and other events. The results should therefore be interpreted as trip activity associated with selected locations and time periods, rather than a direct measurement of 
                            attendance, fan movement, or game-caused traffic.
                            <br/><br/>
                        </p>
                        <div className="flex flex-col gap-1 items-start text-sm">
                            <h2 className="text-lg font-bold">Sources & References</h2>

                            <details>
                                <summary className="cursor-pointer font-bold my-1">
                                    Map Data
                                </summary>
                                <div className="flex flex-col gap-0.5 pl-3">
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
                                <div className="flex flex-col gap-0.5 pl-3">
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
                                <div className="flex flex-col gap-0.5 pl-3">
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
                                <div className="flex flex-col gap-0.5 pl-3">
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
                            href="https://github.com/NicholasTan0"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-500 underline"
                        >
                            Github - @NicholasTan0
                        </a>
                    </div>
                    
                </div>}

                {/* GAME METADATA */}
                <div 
                    className={`absolute flex flex-col z-1002 justify-center items-center bottom-2.5 left-[50%] translate-x-[-50%] transition-all duration-500
                    text-white text-lg lg:text-xl xl:text-2xl w-3/4 ${((mode === "analysis" && page !== 3) || mode === "about") && "hidden"} ${showMetadata ? "translate-y-0" : "translate-y-[85%]"}`}
                >
                    <button className={`flex justify-center items-center min-w-24 w-1/16 text-black dark:text-white bg-white/50 hover:bg-white/40 dark:bg-black/70 dark:hover:bg-black/60 rounded-3xl rounded-b-none box-border border-2 border-b-0 border-neutral-500 -mb-0.5 z-1003 cursor-pointer ${!showMetadata && "opacity-50"}`} onClick={()=>setShowMetadata(!showMetadata)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 fill-current transition-all ${!showMetadata && "-scale-y-100"}`} viewBox="0 0 16 16">
                            <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                        </svg>
                    </button>
                    <div className="p-4 min-w-32 rounded-3xl border-2 border-neutral-500 bg-white/85 dark:bg-black/85 text-neutral-900 dark:text-neutral-200 font-oswald">
                        {level === "playoffs" && <div className="text-center flex justify-center items-center gap-2">
                            {funFacts[random]}
                            <button 
                                className="cursor-pointer hover:animate-spin" 
                                title="New fun fact"
                                onClick={() => setRandom(prev => {
                                    let next;
                                    do {
                                        next = Math.floor(Math.random() * funFacts.length);
                                    } while (next === prev);
                                    return next;
                                })}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
                                    <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
                                </svg>
                            </button>
                        </div>}
                        {level === "series" && <div className="text-center">
                            <h3 className="mb-1 font-semibold uppercase underline underline-offset-3 tracking-wider">{selectedSeries === "r1" ? "First Round" : selectedSeries === "r2" ? "Eastern Conference Semifinals" : selectedSeries === "ecf" ? "Eastern Conference Finals" : "2026 NBA Finals"}</h3>
                            <p>{getSeriesInfo(selectedSeries).startDate}&ndash;{getSeriesInfo(selectedSeries).endDate}. 2026</p>
                            <p>vs. {getSeriesInfo(selectedSeries).opponent} • {getSeriesInfo(selectedSeries).totalGames} games ({getSeriesInfo(selectedSeries).wins}W-{getSeriesInfo(selectedSeries).losses}L)</p>
                            
                        </div>}
                        {level === "game" && <div className="text-center">
                            <h3 className="mb-1 font-semibold uppercase underline underline-offset-3 tracking-wider">{selectedSeries === "r1" ? "First Round" : selectedSeries === "r2" ? "East Semifinal" : selectedSeries} • Game {getGameInfo(selectedGame).gameNumber}</h3>
                            <p>{getGameInfo(selectedGame).date}</p>
                            <p>{getGameInfo(selectedGame).home ? "vs." : "@"} {getGameInfo(selectedGame).opponent} &ndash; {getGameInfo(selectedGame).won ? <span className="text-green-500 font-bold font-inter">W</span> : <span className="text-red-500 font-inter">L</span>} {getGameInfo(selectedGame).score}</p>
                        </div>}
                    </div>
                </div>
                
                {/* SHOW ATTRIBUTION */}
                <button className="absolute bottom-5 right-2.5 text-black bg-white z-1001 rounded-sm border-[#ddd] border cursor-pointer" title="Show attribution" onClick={()=>setShowAttribution(!showAttribution)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" fill="currentColor" viewBox="0 0 16 16">
                        <path d="m9.708 6.075-3.024.379-.108.502.595.108c.387.093.464.232.38.619l-.975 4.577c-.255 1.183.14 1.74 1.067 1.74.72 0 1.554-.332 1.933-.789l.116-.549c-.263.232-.65.325-.905.325-.363 0-.494-.255-.402-.704zm.091-2.755a1.32 1.32 0 1 1-2.64 0 1.32 1.32 0 0 1 2.64 0"/>
                    </svg>
                </button>
                {showAttribution && <div className="text-xs absolute bottom-0 right-0 px-1 text-black bg-white dark:bg-black dark:text-neutral-300 w-max">
                    <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a>
                    &nbsp;&copy;&nbsp;
                    <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> 
                    {" Data from "}
                    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
                </div>}

                {/* CENTER BUTTON */}
                <button
                    title="Center map"
                    className={`absolute z-1001 bottom-38 right-2 text-sm font-bold bg-white text-black cursor-pointer rounded-md p-1 border-current box-border border-2`}
                    onClick={() => {
                        mapRef.current?.fitBounds(maxBounds, {
                            pitch: 0,
                            padding: 50,
                            duration: 2000,
                        });
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.5.5a.5.5 0 0 0-1 0v.518A7 7 0 0 0 1.018 7.5H.5a.5.5 0 0 0 0 1h.518A7 7 0 0 0 7.5 14.982v.518a.5.5 0 0 0 1 0v-.518A7 7 0 0 0 14.982 8.5h.518a.5.5 0 0 0 0-1h-.518A7 7 0 0 0 8.5 1.018zm-6.48 7A6 6 0 0 1 7.5 2.02v.48a.5.5 0 0 0 1 0v-.48a6 6 0 0 1 5.48 5.48h-.48a.5.5 0 0 0 0 1h.48a6 6 0 0 1-5.48 5.48v-.48a.5.5 0 0 0-1 0v.48A6 6 0 0 1 2.02 8.5h.48a.5.5 0 0 0 0-1zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                    </svg>
                </button>

                {/* SIDEBAR */}
                <div className={`top-2.5 left-2.5 absolute flex flex-col z-1002 ${mode === "about" && "hidden"}`}>
                    <button 
                    onClick={()=>{
                        setIsOpen(!isOpen);
                    }}
                    className={`flex justify-center items-center bg-white text-black dark:bg-black dark:text-neutral-200 p-2 border-2 cursor-pointer outline-black shadow-sm z-1001 hover:bg-neutral-200 dark:hover:bg-neutral-900`}>
                        {isOpen ? <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 fill-current transition-all duration-250`} viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                        </svg>
                        : <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 fill-current transition-all duration-250`} viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1z"/>
                            </svg>   
                        </div>}
                    </button>

                    <div className={`fixed z-1000 left-0 top-14 h-[calc(100vh-56px)] min-w-[320px] w-1/5 bg-white dark:bg-black dark:text-neutral-200 box-border border-r border-current/20 transition-all duration-250 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        <div className="mt-16 h-full font-oswald text-xl">
                            <hr className="text-neutral-300 dark:text-neutral-700 mt-2"/>
                            <div className="flex flex-col gap-4 py-4 px-2 h-[calc(100vh-121px)] overflow-y-auto scrollbar-thumb-neutral-400 scrollbar-thin scrollbar-gutter-both">
                                <h2 className="font-bold">Filters</h2>
                                <label className="flex flex-col gap-2 text-nowrap">
                                    <div className="w-20">Scope:</div>
                                    <select
                                        value={level}
                                        onChange={(e)=>setLevel(e.target.value)}
                                        className="cursor-pointer w-full bg-neutral-200 hover:bg-neutral-300 border-b text-black px-1 py-2 [&_option]:bg-white [&_option]:text-neutral-800"
                                    >
                                        <option value="playoffs">Entire Playoffs</option>
                                        <option value="series">Series</option>
                                        <option value="game">Individual Game</option>
                                    </select>
                                </label>
                                {level !== "playoffs" && <label className="flex flex-col gap-2 text-nowrap">
                                    <div className="w-20">Round:</div>
                                    <select 
                                        value={selectedSeries}
                                        onChange={(e)=>handleSeriesChange(e.target.value)}
                                        className="cursor-pointer w-full bg-neutral-200 hover:bg-neutral-300 border-b text-black px-1 py-2 [&_option]:bg-white [&_option]:text-neutral-800"
                                    >
                                        <option value="finals">Finals</option>
                                        <option value="ecf">Conference Finals</option>
                                        <option value="r2">Conference Semifinals</option>
                                        <option value="r1">First Round</option>
                                    </select>
                                </label>}
                                {level === "game" ?  <label className="flex flex-col gap-2 text-nowrap">
                                    <div className="w-20">Game:</div>
                                    <select
                                        value={selectedGame}
                                        onChange={e => setSelectedGame(Number(e.target.value))}
                                        className="cursor-pointer w-full bg-neutral-200 hover:bg-neutral-300 border-b text-black px-1 py-2 [&_option]:bg-white [&_option]:text-neutral-800"
                                    >
                                        {metadata
                                            .filter(game => game.series === selectedSeries)
                                            .map(game => <option key={game.id} value={game.id}>
                                                Game {game.game}
                                            </option>)}
                                    </select>
                                </label> :
                                <label className="flex flex-col gap-2 text-nowrap">
                                    <div className="w-20">Game Location:</div>
                                    <select 
                                        value={selectedHomeAway}
                                        onChange={(e)=>setSelectedHomeAway(e.target.value)}
                                        className="cursor-pointer w-full bg-neutral-200 hover:bg-neutral-300 border-b text-black px-1 py-2 [&_option]:bg-white [&_option]:text-neutral-800"
                                    >
                                        <option value="both">All (Home + Away)</option>
                                        <option value="home">Home</option>
                                        <option value="away">Away</option>
                                    </select>
                                </label>}
                                
                                <label className="flex flex-col gap-2 text-nowrap">
                                    <div className="w-20">Ride Services:</div>
                                    <select 
                                        value={selectedTaxiType}
                                        onChange={(e)=>setSelectedTaxiType(e.target.value)}
                                        className="cursor-pointer w-full bg-neutral-200 hover:bg-neutral-300 border-b text-black px-1 py-2 [&_option]:bg-white [&_option]:text-neutral-800"
                                    >
                                        <option value="all">All (Taxis + FHV)</option>
                                        <option value="yellow">Taxis</option>
                                        <option value="fhvhv">Uber & Lyft</option>
                                    </select>
                                </label>

                                <div className="flex flex-col gap-2">
                                    <label className="flex flex-col gap-2 text-nowrap">
                                        <div className="w-20">Trip Context:</div>
                                        <select 
                                            value={selectedPeriod}
                                            onChange={(e)=>setSelectedPeriod(e.target.value)}
                                            className="cursor-pointer w-full bg-neutral-200 hover:bg-neutral-300 border-b text-black px-1 py-2 [&_option]:bg-white [&_option]:text-neutral-800"
                                        >
                                            <option value="post-game">Leaving From (Postgame)</option>
                                            <option value="pre-game">Going To (Pregame)</option>
                                        </select>
                                    </label>
                                    <div className="flex gap-1.5 text-sm w-full items-center text-nowrap flex-wrap">
                                        {availableLocations.map(location => (
                                                <button
                                                    className={`flex items-center gap-1 bg-blue hover:bg-blue-700 cursor-pointer text-neutral-200 px-2 ${!selectedLocations.includes(location.id) && "opacity-50"}`}
                                                    key={location.id}
                                                    onClick={() => {
                                                        setSelectedLocations(prev =>
                                                            prev.includes(location.id)
                                                                ? prev.filter(id => id !== location.id)
                                                                : [...prev, location.id]
                                                        );
                                                    }}
                                                >
                                                    <div className={`${!selectedLocations.includes(location.id) && "line-through"}`}>{location.name}</div>
                                                    <div className="text-lg text-white">&times;</div>
                                                </button>
                                        ))}
                                    </div>
                                </div>

                                <button className="flex justify-center items-center gap-2 cursor-pointer bg-neutral-200 hover:bg-neutral-300 p-2 mt-4 text-black" onClick={()=>setShowPopup(!showPopup)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                                    </svg>
                                    {!showPopup ? "Show Pins" : "Hide Pins"}
                                </button>

                                <hr className="text-neutral-300 dark:text-neutral-700 my-2"/>

                                <h2 className="font-bold my-2">Map Appearance</h2>
                                
                                <div className="flex w-full gap-8">
                                    <label className="flex flex-col gap-2 w-min">
                                        Colors
                                        <ColorPicker 
                                            startColor={startColor}
                                            setStartColor={setStartColor} 
                                            endColor={endColor}
                                            setEndColor={setEndColor}
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2 w-max">
                                        Border Color
                                        <input
                                            title="Change starting color"
                                            type="color"
                                            value={lineColor}
                                            onChange={(e)=>setLineColor(e.target.value)}
                                            className="h-10 w-32 cursor-pointer appearance-none border-2 border-neutral-400 bg-transparent p-0 
                                            [&::-webkit-color-swatch-wrapper]:p-0 
                                            [&::-webkit-color-swatch]:border-none 
                                            [&::-moz-color-swatch]:border-none" 
                                        />
                                    </label>
                                </div>

                                <label className="flex flex-col">
                                    Intensity
                                    <div className="flex gap-2">
                                        <input type="range" min={4} max={8} value={intensity} onChange={(e)=>setIntensity(Number(e.target.value))} className="w-min"/>
                                        <div>{(intensity === 4 || intensity === 5) ? "Low" : intensity === 8 ? "High" : "Medium"}</div>
                                    </div>
                                </label>

                                <label className="flex flex-col">
                                    Opacity
                                    <div className="flex gap-2">
                                        <input type="range" min={0} max={100} step={1} value={fillOpacity} onChange={(e)=>setFillOpacity(Number(e.target.value))} className="w-min"/>
                                        <div>{fillOpacity}%</div>
                                    </div>
                                </label>

                                <hr className="text-neutral-300 dark:text-neutral-700 my-2"/>

                                <button 
                                className="w-max px-2 py-1 self-center mt-auto cursor-pointer text-neutral-700 dark:text-neutral-300 hover:underline active:scale-96"
                                onClick={()=>{
                                    setLevel("playoffs");
                                    setSelectedGame(1);
                                    setSelectedSeries("r1");
                                    setSelectedHomeAway("both");
                                    setSelectedPeriod("post-game");
                                    setSelectedTaxiType("all");
                                    setSelectedLocations(DEFAULT_LOCATIONS);
                                    setStartColor("#006BB6");
                                    setEndColor("#F58426");
                                    setIntensity(6);
                                    setFillOpacity(75);
                                }}
                                >Restore Defaults?</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Map>
        </div>
    );
}