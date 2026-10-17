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
import Methodology from "./Methodology";
import Percentages from "./President";
import Airports from "./Airports";
import Services from "./Services";
import HomeCourt from "./HomeCourt";
import Boroughs from "./Boroughs";
maplibregl.setWorkerUrl(workerUrl);

const MSG = [-73.99361, 40.75056];
const RADIO_CITY = [-73.979977, 40.759976]
const CENTRAL_PARK = [-73.97242, 40.77047];
const BRYANT_PARK = [-73.983559, 40.753742];
const BROOKLYN_BOWL = [-73.957381, 40.721887];
const JFK = [-73.785849, 40.649128];
const LGA = [-73.874189, 40.78];
const SIXTH_AVE_32ND_WEST = [-73.98889, 40.74855];
const SIXTH_AVE_33RD_WEST = [-73.98836, 40.74919];
const SEVENTH_AVE_29TH_NE = [-73.99272, 40.74790];
const EIGHTH_AVE_30TH_NE = [-73.99512, 40.74969];
const EIGHTH_AVE_34TH_SE = [-73.99334, 40.75206];

const polygon = {
    type: "Feature",
    properties: {
        name: "Madison Square Garden Area",
    },
    geometry: {
        type: "Polygon",
        coordinates: [
        [
            [-73.99294, 40.75286],
            [-73.98728, 40.75046],
            [-73.98962, 40.74728],
            [-73.99529, 40.74968],
            [-73.99294, 40.75286],
        ],
        ],
    },
};

const polygonFill = {
    id: "custom-polygon-fill",
    type: "fill",
    paint: {
        "fill-color": "red",
        "fill-opacity": 0.3,
    },
};

const polygonOutline = {
    id: "custom-polygon-outline",
    type: "line",
    paint: {
        "line-color": "red",
        "line-width": 2,
    },
};

const boroughFill = {
    id: "borough-fill",
    type: "fill",
    paint: {
        "fill-color": [
        "match",
        ["get", "name"],
        "Manhattan", "green",
        "Brooklyn", "yellow",
        "Queens", "orange",
        "Bronx", "red",
        "Staten Island", "purple",
        "black",
        ],
        "fill-opacity": 0.5,
    },
};

const boroughOutline = {
    id: "borough-outline",
    type: "line",
    paint: {
        "line-color": "#ffffff",
        "line-width": 1,
        "line-opacity": 0.7,
    },
};

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

const stories = [
    {
        src: '/src/assets/msg_day.jpg',
        orientation: "object-center",
        id: 8,
        title: "The Road to Tipoff",
        description: "Where were pickups happening before tipoff? Explore pickup locations for trips headed to MSG and other Knicks-related destinations in the hours leading up to games."
    },
    {
        src: '/src/assets/postgame.jpg',
        orientation: "object-center",
        id: 4,
        title: "Postgame Pursuits",
        description: "When the game ends, where does the ride activity go? Follow postgame drop-offs to see which neighborhoods and destinations drew the most trips.",
        text: `Let's shift our focus to where trips traveled to after the buzzer sounds. These trips highlight the destinations that saw the most activity in the 3 hours following
            the end of the game. Aside from the majority of fans flooding the streets surrounding MSG, the zones with the highest volumes of trips were East Village and Murray Hill. 
            Both are major late-night neighborhoods due to their high concentration of bars, restaurants, and general nightlife activities. Several other neighborhoods within Manhattan 
            also received similar attention, such as Upper East Side, West Village, and Hell's Kitchen.`
    },
    {
        data: <Services/>,
        src: '/src/assets/msg_taxi.webp',
        orientation: "object-bottom",
        id: 5,
        title: "A Dying Service?",
        description: "Taxis and Uber/Lyft compete for a place in New York City's streets. Compare their recorded trip activity around playoff games.",
        text: `Another interesting statistical trend that can be examined is the usage of taxi (yellow and green) vs. ride-share (Uber and Lyft) services. As you can see, the map becomes 
            much more sparse when filtering for taxi rides only, comprising of only 29% of all pregame rides. However, this number jumps to around 41% for postgame rides, most likely 
            due the availability and sheer amount of taxis in Manhattan. Although taxis are nowhere near extinct, it is clear that most riders opted to take an Uber or Lyft instead
            throughout the playoffs.`
    },
    {
        data: <HomeCourt/>,
        src: '/src/assets/msg.webp',
        orientation: "object-bottom",
        id: 6,
        title: "There's No Place Like Home",
        description: "Did the city's ride activity look different when the Knicks played at home versus on the road? Compare the recorded trip patterns across both types of game nights.",
        text: `As expected, home games generated roughly 2,000 more pregame trips than away games, with over 74% going to Madison Square Garden. After the games, however, the difference 
            largely disappears, with away games actually producing slightly more postgame trips overall. This may reflect the broader NYC activity captured by the three-hour postgame window, 
            including watch parties, nightlife, and other trips unrelated to the game itself (e.g. evening rush hour). Much like the Knicks' championship run, home-court advantage seems to 
            have been completely optional, as they went 9–1 on the road and closed out every series away from home. Our data tells a similar story: home and away games produced 
            remarkably similar levels of postgame trip activity.`
    },
    {
        src: '/src/assets/crowd.jpg',
        orientation: "object-bottom",
        id: 7,
        title: "Playoff Fever or Just New York?",
        description: "Not every busy night is a playoff night. Use regular-season games and non-game days as reference points for understanding the activity surrounding the postseason."
    },
    {
        data: <Percentages/>,
        src: '/src/assets/president.webp',
        orientation: "object-top",
        id: 3,
        title: "President's Day",
        description: "A presidential visit brought added attention to New York on Finals night. Did the surrounding streets see a different pattern of pickup and drop-off activity?",
        text: `President Donald Trump attended Game 3 of the 2026 NBA Finals at Madison Square Garden, becoming the first sitting U.S. president to attend an NBA Finals game.
            By applying the right filters, we can examine the impact that his presence had on trips throughout NYC on this day. There was a 20% decrease in the number 
            of trips going to MSG compared to the other games in the Finals, most likely due to the street closures and cancellation of the outdoor watch party. Conversely, 
            there was a large number of trips going to Central Park (Wollman Rink), Bryant Park and Brooklyn Bowl, the other team-sanctioned watch party locations.
            In fact, nearly half of all trips were headed to Brooklyn Bowl before tipoff of Game 3.`
    },
    {
        data: <Boroughs/>,
        src: '/src/assets/night.jpg',
        orientation: "object-top",
        id: 9,
        title: "Borough Breakdown",
        description: "Where does Knicks playoff ride activity reach beyond the Garden's home borough? Explore how trips are distributed across the five boroughs.",
        text: `The five boroughs all saw varied levels of total trip activity throughout the playoffs.`
    },
    {
        data: <Airports/>,
        src: '/src/assets/knicks_airplane.webp',
        orientation: "object-top",
        id: 2,
        title: "Knicks Fans Travel Well",
        description: "How far do fans travel to catch a playoff game? Trace pregame rides originating at JFK and LaGuardia to explore how New York's airports connect to Knicks game nights.",
        text: `A notable pattern is the flow of airport-originating trips to Knicks game-day destinations. Nearly 1,000 trips from JFK and LaGuardia reached MSG within two hours before tipoff, highlighting the airports as significant sources of pregame traffic.`
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

export default function MapView({ theme, mode, setMode, story, setStory }) {
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
    const [boroughs, setBoroughs] = useState(null);
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
    const [showVisualization, setShowVisualization] = useState(true);
    const [showInformation, setShowInformation] = useState(true);
    
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
            "/data/boroughs.geojson",
        ].map(load))
            .then(([geojson, game, series, playoffs, games, boroughGeojson]) => {
                setZones(geojson); 
                setGameStats(game); 
                setSeriesStats(series);
                setPlayoffsStats(playoffs); 
                setMetadata(games);
                setBoroughs(boroughGeojson);
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
    
    useEffect(() => {
        const dark = theme === "dark" ||
            (theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
        setLineColor(dark ? "#ffffff" : "#292524");
        }, [theme]);

    useEffect(()=>{
        if(level === "game") setSelectedHomeAway("both")
    }, [level])

    const handleSeriesChange = (series) => {
        const current = metadata.find(g => g.id === selectedGame);
        const seriesGames = metadata.filter(g => g.series === series);
        const match = seriesGames.find(g => g.game === current?.game) ?? seriesGames[0];
        setSelectedSeries(series);
        if (match) setSelectedGame(match.id);
    };

    useEffect(() => {
        hideTooltip();
        setIsOpen(false);
        setShowPopup(false);
        setShowVisualization(true);

        const timeout = setTimeout(() => {
            const map = mapRef.current;
            if (!map) return;

            if (mode === "visualization") {
                if (page === 1) {
                    map.flyTo({
                        center: MSG,
                        zoom: 12,
                        pitch: 0,
                        padding: { top: 0, bottom: 0, left: 0, right: 200 },
                        bearing: 0,
                        duration: 2000,
                    });
                } else if (page === 2) {
                    map.flyTo({
                        center: MSG,
                        zoom: 14,
                        pitch: 39,
                        bearing: 0,
                        duration: 2000,
                    });
                }
            } else if (mode === "analysis") {
                if (story?.id === 1) {
                    map.fitBounds(maxBounds, {
                        pitch: 0,
                        padding: 50,
                        duration: 2000,
                    });
                } else if (story?.id === 2) {
                    map.flyTo({
                        center: [(JFK[0] + LGA[0]) / 2, (JFK[1] + LGA[1]) / 2],
                        zoom: 11,
                        pitch: 0,
                        offset: [150, 0],
                        duration: 2000,
                    });

                    setLevel("playoffs");
                    setSelectedHomeAway("both");
                    setSelectedTaxiType("all");
                    setSelectedPeriod("pre-game");
                    setSelectedLocations(DEFAULT_LOCATIONS);
                    setShowPopup(false);
                    setIntensity(6);
                } else if (story?.id === 3) {
                    map.fitBounds([[-73.99609,40.74646], [-73.98648,40.75368]], {
                        pitch: 0,
                        padding: 50,
                        duration: 2000,
                    });

                    setLevel("game");
                    setSelectedSeries("finals");
                    setSelectedGame(17);
                    setSelectedHomeAway("both");
                    setSelectedTaxiType("all");
                    setSelectedPeriod("pre-game");
                    setSelectedLocations([186, 43, 255, 164]);
                    setShowPopup(true);
                    setIntensity(6);
                } else if (story?.id === 4) {
                    map.flyTo({
                        center: MSG,
                        offset: [-100, 0],
                        zoom: 12,
                        bearing: 29,
                        pitch: 0,
                        duration: 2000,
                    });

                    setLevel("playoffs");
                    setSelectedHomeAway("both");
                    setSelectedTaxiType("all");
                    setSelectedPeriod("post-game");
                    setSelectedLocations(DEFAULT_LOCATIONS);
                    setShowPopup(false);
                    setIntensity(8);
                } else if (story?.id === 5) {
                    map.fitBounds(maxBounds, {
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
                } else if (story?.id === 6) {
                    map.flyTo({
                        center: MSG,
                        zoom: 16,
                        pitch: 65,
                        bearing: 67,
                        duration: 2000,
                    });

                    setLevel("playoffs");
                    setSelectedHomeAway("home");
                    setSelectedTaxiType("all");
                    setSelectedPeriod("post-game");
                    setSelectedLocations(DEFAULT_LOCATIONS);
                    setShowPopup(false);
                    setIntensity(6);
                } else if (story?.id === 9) {
                    map.fitBounds(maxBounds, {
                        pitch: 0,
                        padding: 50,
                        duration: 2000,
                    });
                    setLevel("playoffs");
                    setSelectedHomeAway("both");
                    setSelectedTaxiType("all");
                    setSelectedPeriod("post-game");
                }
            }
        }, 50);

        return () => clearTimeout(timeout);
    }, [page, mode, story]);


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
    
    // const boroughTrips = useMemo(() => {
    //     return playoffsStats.reduce((totals, trip) => {
    //         const borough = trip.borough;

    //         if (!borough) return totals;

    //         totals[borough] = (totals[borough] || 0) + Number(trip.trip_count);

    //         return totals;
    //     }, {});
    // }, [playoffsStats]);

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
                    padding: { top: 0, bottom: 0, left: 0, right: 200 },
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
                {zones && !(boroughs && mode === "analysis" && story?.id === 9) && (
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

                {(boroughs && mode === "analysis" && story?.id === 9) && <Source
                    id="borough-zones"
                    type="geojson"
                    data={boroughs}
                >
                    <Layer {...boroughFill} />
                    <Layer {...boroughOutline} />
                </Source>}

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
                                func={()=>{
                                    mapRef.current?.flyTo({
                                        center: [location.long, location.lat],
                                        zoom: 13,
                                        pitch: 0,
                                        bearing: 0,
                                        duration: 2000,
                                    });
                                }}
                            /> 
                        ))}
                </>}

                {(mode === "analysis" && story?.id === 2) && <>
                    <Pin
                        long={JFK[0]}
                        lat={JFK[1]}
                        color="red"
                        text={<strong>⭐ John F. Kennedy International Airport</strong>}
                        func={()=>{
                            mapRef.current?.flyTo({
                                center: JFK,
                                zoom: 13,
                                pitch: 0,
                                bearing: 0,
                                duration: 2000,
                            });
                        }}
                    />
                    <Pin
                        long={LGA[0]}
                        lat={LGA[1]}
                        color="red"
                        text={<strong>⭐ LaGuardia Airport</strong>}
                        func={()=>{
                            mapRef.current?.flyTo({
                                center: LGA,
                                zoom: 13,
                                pitch: 0,
                                bearing: 0,
                                duration: 2000,
                            });
                        }}
                    />
                </>}

                {(mode === "analysis" && story?.id === 3) && <>
                    <Source id="custom-polygon" type="geojson" data={polygon}>
                        <Layer {...polygonFill} />
                        <Layer {...polygonOutline} />
                    </Source>
                    {false && <>
                        <Pin
                            long={SIXTH_AVE_32ND_WEST[0]}
                            lat={SIXTH_AVE_32ND_WEST[1]}
                            color="red"
                        />
                        <Pin
                            long={SIXTH_AVE_33RD_WEST[0]}
                            lat={SIXTH_AVE_33RD_WEST[1]}
                            color="red"
                        />
                        <Pin
                            long={SEVENTH_AVE_29TH_NE[0]}
                            lat={SEVENTH_AVE_29TH_NE[1]}
                            color="red"
                        />
                        <Pin
                            long={EIGHTH_AVE_30TH_NE[0]}
                            lat={EIGHTH_AVE_30TH_NE[1]}
                            color="red"
                        />
                        <Pin
                            long={EIGHTH_AVE_34TH_SE[0]}
                            lat={EIGHTH_AVE_34TH_SE[1]}
                            color="red"
                        />
                    </>}
                </>}

                <div
                    ref={tooltipRef}
                    className="absolute top-0 left-0 pointer-events-none px-2 py-1 text-sm font-inter bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 border border-neutral-500 transition-opacity duration-150 opacity-0"
                >
                    <strong ref={tooltipNameRef} />
                    <br />
                    <span ref={tooltipCountRef} />
                </div>

                {/* INFORMATION */}
                {showInformation && <div className="hidden md:flex flex-col justify-center items-end absolute top-2.5 right-2.5 w-min gap-2.5 z-1002 transition-all">
                    <div className="flex flex-col w-full justify-center items-start p-2.5 border border-neutral-500 bg-white/95 dark:bg-black/90 text-black dark:text-neutral-100 text-base font-mont">
                        <div className="font-bold text-nowrap">{totalTrips.toLocaleString()} trips</div>
                        <div className="font-semibold italic text-nowrap flex gap-1 text-xs">
                            <div className="first-letter:uppercase">{selectedPeriod === "post-game" ? "Postgame" : "Pregame"}</div>
                            <div className="select-none">&middot;</div>
                            <div className="first-letter:uppercase">{level}</div>
                            <div className="select-none">&middot;</div>
                            <div className="first-letter:uppercase">{selectedTaxiType === "all" ? "All Services" : (selectedTaxiType === "fhvhv" ? "Uber & Lyft" : "Taxis")}</div>
                        </div>
                        <hr className="my-1.5 w-full"></hr>
                        <ol className="list-decimal list-inside max-h-43 overflow-y-auto scrollbar-thumb-neutral-500 scrollbar-thin text-sm">
                            {maxTrips.map(zone => <li key={zone.id}>
                                {zone.name} ({zone.trips})
                            </li>)}
                        </ol>
                    </div>
                    <div className={`flex flex-col justify-center items-start p-2.5 border border-neutral-500 bg-white/95 dark:bg-black/90 text-black dark:text-neutral-100 text-base md:text-lg font-mont ${((mode === "analysis" && page !== 3) || mode === "about" || (level === "playoffs")) && "hidden"}`}>
                        {level === "playoffs" && <div className="flex justify-center items-center gap-2 text-sm">
                            {funFacts[random]}
                            <button 
                                className="cursor-pointer hover:animate-spin" 
                                title="Generate Fun Fact"
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
                            <h3 className="text-nowrap mb-1 font-semibold uppercase underline underline-offset-3 tracking-wider">{selectedSeries === "r1" ? "First Round" : selectedSeries === "r2" ? "Eastern Conference Semifinals" : selectedSeries === "ecf" ? "Eastern Conference Finals" : "NBA Finals"}</h3>
                            <p className="text-nowrap">{getSeriesInfo(selectedSeries).startDate}&ndash;{getSeriesInfo(selectedSeries).endDate}, 2026</p>
                            <p className="text-nowrap">vs. {getSeriesInfo(selectedSeries).opponent}</p>
                            <p className="text-nowrap">{getSeriesInfo(selectedSeries).totalGames} Games ({getSeriesInfo(selectedSeries).wins}<span className="text-green-500 font-bold font-inter">W</span>-{getSeriesInfo(selectedSeries).losses}<span className="text-red-500 font-bold font-inter">L</span>)</p>
                            
                        </div>}
                        {level === "game" && <div className="text-center">
                            <h3 className="text-nowrap mb-1 font-semibold uppercase underline underline-offset-3 tracking-wider">{selectedSeries === "r1" ? "First Round" : selectedSeries === "r2" ? "East Semifinal" : selectedSeries} &ndash; Game {getGameInfo(selectedGame).gameNumber}</h3>
                            <p className="text-nowrap">{getGameInfo(selectedGame).date}</p>
                            <p className="text-nowrap">{getGameInfo(selectedGame).home ? "vs." : "@"} {getGameInfo(selectedGame).opponent}</p>
                            <p className="text-nowrap">{getGameInfo(selectedGame).won ? <span className="text-green-500 font-bold font-inter">W</span> : <span className="text-red-500 font-inter">L</span>} {getGameInfo(selectedGame).score}</p>
                        </div>}
                    </div>
                </div>}

                {/* CONTROLS */}
                <NavigationControl
                    position="bottom-right"
                    showCompass={true}
                    showZoom={true}
                    visualizePitch={true}
                />

                {/* STORY */}
                {(mode === "visualization") && <div 
                    className={`absolute z-1001 top-0 left-0 w-full md:w-1/2 xl:w-1/3 text-white text-sm lg:text-base transition-opacity duration-300 ${isOpen && "opacity-0"} ${showVisualization ? "translate-y-0" : "translate-y-13.5 md:translate-y-0 md:-translate-x-[calc(100%-120px)] w-min!"}`}
                >
                    <div className="m-2.5 relative px-5 pt-7 pb-3 rounded-none border-2 border-neutral-500 bg-white/95 dark:bg-black/90 text-black dark:text-neutral-100 font-rale text-center">
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
                            <span className="mb-0.5 font-bold justify-center items-center text-lg flex gap-1"><span className="select-none">&ndash;</span>Knicks in Motion<span className="select-none">&ndash;</span></span>
                            {page === 1 && <p>
                                How does New York City move when the Knicks play? This visualization maps taxi and rideshare activity across New York City during all 19 games of the Knicks' 2026 playoff run, from the First Round through the NBA Finals. Using the NYC Taxi and Limousine Commission's <a href="https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-semibold hover:underline">trip record data</a>, 
                                the visualization aggregates raw trip volumes across NYC <a href="https://data.cityofnewyork.us/Transportation/NYC-Taxi-Zones/8meu-9t5y/about_data" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-semibold hover:underline">taxi zones</a> around game-day time windows.
                                <br/><br/>
                                The analysis covers activity associated with Madison Square Garden and selected team-sanctioned watch party locations, combining trip patterns with information about each game to show how activity varied throughout the playoff run.
                            </p>}
                            {page === 2 && <p>
                                Use the map controls in the top left to select a playoff series or individual game, choose a pregame or postgame view, and filter by home or away game, taxi type, and location when available.
                                <br/><br/>
                                In <strong>Going To</strong>, the map shows where trips originated before arriving at a monitored location. In <strong>Leaving From</strong>, it shows where trips ended after departing from a monitored location. Darker areas represent higher raw trip volumes.
                                <br/><br/>
                                Zoom and pan across NYC, or hover over a zone to see its trip volume. Visit the <button className="cursor-pointer text-blue-500 font-semibold hover:underline" onClick={()=>setMode("analysis")}>Analysis</button> section to explore the data further, or <button className="cursor-pointer text-blue-500 font-semibold hover:underline" onClick={()=>setMode("about")}>Methodology</button> to see how the data was prepared.
                            </p>}
                            <div className="relative w-full flex items-center h-8 mt-2 mx-2">
                                {page !== 1 && <button className="absolute left-0 cursor-pointer p-0.5" aria-label="Previous page" onClick={()=>{
                                    setPage(page === 1 ? 2 : page - 1);
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                                    </svg>
                                </button>}
                                <span className="text-xs absolute left-[50%] translate-x-[-50%]">
                                    <strong>{page} of 2</strong>
                                </span>
                                {page !== 2 ? <button className="absolute right-0 cursor-pointer p-0.5" aria-label="Next page" onClick={()=>{
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
                                }}>
                                    Get Started
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>}

                {/* ANALYSIS */}
                {mode === "analysis" && !story && <div className="absolute z-1002 top-0 left-0 w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-500 flex flex-col text-black dark:text-neutral-200 bg-neutral-200 dark:bg-neutral-950 p-8 md:p-16 md:pb-8 gap-8 font-rale">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg uppercase">Analysis</h2>
                        <h1 className="text-4xl font-bold">Explore the Stories</h1>
                        <h3 className="text-base mt-1.5">Dive into a collection of hand-picked analyses that reveal how Knicks game nights move New York City.</h3>
                    </div>
                    <div className="grid grid-cols-1 auto-rows-fr md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 w-full gap-4">
                        {stories.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setStory(s);
                                }}
                                className="rounded-3xl overflow-hidden border-2 flex flex-col cursor-pointer"
                            >
                                <div className='h-48 w-full border-b-2'>
                                    <img src={s.src} loading='lazy' className={`w-full h-full object-cover ${s.orientation}`}/>
                                </div>
                                <div className='min-h-46 flex-1 w-full relative p-4 flex flex-col gap-1.5 text-left'>
                                    <div className='font-bold text-xl'>{s.title}</div>
                                    <p className='text-sm leading-relaxed'>{s.description}</p>
                                    <div className='mt-auto rounded-full size-8 border-2 flex self-end justify-center items-center hover:animate-[horizontal-bounce_1s_infinite]'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                            <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"/>
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <button className="self-center flex items-center gap-2 cursor-pointer text-sm font-bold p-4 border-2 rounded-full transition-all hover:scale-103">
                        <div>Suggest a Story</div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0z"/>
                        </svg>
                    </button>
                </div>}

                {/* ABOUT */}
                {(mode === "about") && <Methodology/>}

                {/* <div className="absolute bottom-0 right-0 z-1001 px-1 text-xs bg-white text-black dark:bg-black dark:text-neutral-300">
                    <a href="https://openfreemap.org/">OpenFreeMap</a>
                    {" © "}
                    <a href="https://www.openmaptiles.org/">OpenMapTiles</a>
                    {" © "}
                    <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
                </div> */}

                {/* LEGEND */}
                <div className="absolute bottom-1 left-1 border border-neutral-500 flex justify-center items-center p-1 text-xs font-mont font-semibold bg-white/90 text-black dark:bg-black/90 dark:text-white">
                    <div className="mr-1.5">Low</div>
                    {colors.map((color, i) => <div key={i} className="size-4" style={{ 
                        background: `${color}`,
                        border: `1px solid ${lineColor}`
                    }}/>)}
                    <div className="ml-1.5">High</div>
                </div>

                {/* CENTER BUTTON */}
                <button
                    title="Center map"
                    className={`absolute z-1001 bottom-26 right-2 text-sm font-bold bg-white text-black cursor-pointer rounded-md p-1 border-2`}
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
                <div className={`top-0 left-0 absolute flex flex-col z-1001 ${mode === "about" && "hidden"}`}>
                    <button 
                    aria-label="Filters"
                    onClick={()=>{
                        setIsOpen(!isOpen);
                    }}
                    className={`flex justify-center items-center bg-white text-black dark:bg-black dark:text-neutral-200 p-2 border-2 cursor-pointer outline-black shadow-sm z-1001 hover:bg-neutral-200 dark:hover:bg-neutral-900 mt-2.5 ml-2.5`}>
                        {isOpen ? <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 fill-current transition-all duration-250`} viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
                        </svg>
                        :
                            <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 fill-current transition-all duration-250`} viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M11.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9.05 3a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0V3zM4.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M2.05 8a2.5 2.5 0 0 1 4.9 0H16v1H6.95a2.5 2.5 0 0 1-4.9 0H0V8zm9.45 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-2.45 1a2.5 2.5 0 0 1 4.9 0H16v1h-2.05a2.5 2.5 0 0 1-4.9 0H0v-1z"/>
                            </svg>}
                    </button>

                    <div className={`absolute z-1000 left-0 top-0 h-[calc(100vh-56px)] min-w-[320px] w-1/5 bg-white dark:bg-black dark:text-neutral-200 box-border border-r border-current/20 transition-all duration-250 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        <div className="mt-16 h-full font-oswald text-xl">
                            <hr className="text-neutral-300 dark:text-neutral-700 mt-2"/>
                            <div className="flex flex-col gap-4 p-4 h-[calc(100vh-121px)] overflow-y-auto scrollbar-thumb-neutral-400 scrollbar-thin">
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
                                        {locations.map(location => (
                                            <button
                                            disabled={!availableLocations.includes(location)}
                                            key={location.id}
                                            aria-pressed={selectedLocations.includes(location.id)}
                                            className={`px-2 py-0.5 border transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:bg-neutral-600 disabled:text-neutral-200 disabled:cursor-not-allowed disabled:border-neutral-500 disabled:line-through
                                                ${selectedLocations.includes(location.id) ? "bg-blue text-white border-blue" : "bg-transparent text-blue border-blue/40 line-through"}`}
                                            onClick={() => setSelectedLocations(prev =>
                                                selectedLocations.includes(location.id) ? prev.filter(id => id !== location.id) : [...prev, location.id]
                                            )}
                                          >
                                            {location.name}
                                          </button>
                                        ))}
                                    </div>
                                </div>

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
                                    <div className="flex gap-2 items-center">
                                        <input type="range" min={4} max={8} value={intensity} onChange={(e)=>setIntensity(Number(e.target.value))} className="w-min accent-orange"/>
                                        <div>{(intensity === 4 || intensity === 5) ? "Low" : intensity === 8 ? "High" : "Medium"}</div>
                                    </div>
                                </label>

                                <label className="flex flex-col">
                                    Opacity
                                    <div className="flex gap-2 items-center">
                                        <input type="range" min={0} max={100} step={1} value={fillOpacity} onChange={(e)=>setFillOpacity(Number(e.target.value))} className="w-min"/>
                                        <div>{fillOpacity}%</div>
                                    </div>
                                </label>

                                <div className="flex justify-start items-center gap-2 my-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
                                    </svg>
                                    Show Pins:
                                    <button onClick={()=>setShowPopup(!showPopup)} className={`ml-auto self-end cursor-pointer rounded-full w-11 h-6 transition-colors ${showPopup ? "bg-blue" : "bg-neutral-400"}`}>
                                        <div className={`transition-transform rounded-full size-4 mx-1 text-sm flex justify-center items-center bg-white ${showPopup && "translate-x-[125%]"}`}></div>
                                    </button>
                                </div>

                                <div className="hidden md:flex justify-start items-center gap-2 my-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
                                    </svg>
                                    Show Trip Breakdown:
                                    <button onClick={()=>setShowInformation(!showInformation)} className={`ml-auto self-end cursor-pointer rounded-full w-11 h-6 transition-colors ${showInformation ? "bg-blue" : "bg-neutral-400"}`}>
                                        <div className={`transition-transform rounded-full size-4 mx-1 text-sm flex justify-center items-center bg-white ${showInformation && "translate-x-[125%]"}`}></div>
                                    </button>
                                </div>

                                <hr className="text-neutral-300 dark:text-neutral-700 my-2"/>

                                <button 
                                className="border w-full py-3 self-center mt-auto cursor-pointer bg-neutral-200 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 hover:dark:bg-neutral-800 active:scale-96"
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
                                    setLineColor(document.documentElement.classList.contains("dark") ? "#ffffff" : "#292524");
                                    setIntensity(6);
                                    setFillOpacity(75);
                                }}
                                >Restore Defaults</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Map>
        </div>
    );
}