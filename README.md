# Knicks in Motion

**How does New York City move when the Knicks play?**

Knicks in Motion is an interactive map that explores taxi and for-hire vehicle activity around the Knicks' 2026 NBA Playoff games. Using NYC Taxi & Limousine Commission (TLC) trip records, it shows where trips came from before tipoff and where they went after the final buzzer, aggregated by NYC taxi zone.

**Live demo:** [knicksinmotion.app](https://knicksinmotion.app)

<!-- Replace the placeholders below with real screenshots or a short GIF. -->

<img width="1918" height="902" alt="image" src="https://github.com/user-attachments/assets/ffd962cc-9d4c-4e36-a589-91d9a4d797b9" />

<img width="1919" height="903" alt="image" src="https://github.com/user-attachments/assets/f5ef864d-6868-4d88-80e5-078540b67313" />

## Highlights

- **Geospatial visualization of real public data.** Millions of TLC trip records are reduced to zone-level flows and rendered with MapLibre GL JS.
- **Three levels of analysis.** Explore a single game, a full series, or the entire playoff run.
- **Flexible filtering.** Slice by series, home vs. away games, pre-game vs. post-game period, taxi type (Yellow, Green, or High Volume For-Hire Vehicle), and monitored location.
- **Customizable appearance.** Adjust start and end colors, line color, intensity, and fill opacity, with light, dark, and system themes.
- **Click-to-zoom zones**, popups, a game metadata panel, and a built-in methodology and sources page.
- **End-to-end project.** A Python data-processing pipeline produces the static JSON and GeoJSON files that a React frontend loads and visualizes.

## How It Works

Game-related activity is identified by matching trips to **monitored locations** during time windows around each game:

| Period | Window | Trips used | What it represents |
|---|---|---|---|
| Pre-game | 2 hours before tipoff | Trips *arriving* at a monitored location | Where vehicles traveled from |
| Post-game | 3 hours after the game ends | Trips *departing* from a monitored location | Where vehicles traveled afterward |

Madison Square Garden is monitored throughout the playoff run. Central Park, Radio City Music Hall, Bryant Park, and Brooklyn Bowl are included for specific games where relevant. Matching trips are aggregated by TLC taxi zone and displayed as raw trip volumes.

## Data

**Sources**

- 2026 TLC trip records: Yellow Taxi, Green Taxi, and High Volume For-Hire Vehicle (FHVHV)
- TLC taxi zone boundaries
- Game information: tipoff times, opponents, locations, results, and game durations, used to define each analysis window

**Processing**

1. Raw trip records are cleaned and reduced to the fields needed for the analysis: pickup and drop-off timestamps, taxi type, and TLC taxi zones.
2. Each trip is matched against the pre-game and post-game windows.
3. Trips are retained when they are associated with a monitored location for that particular game.
4. Results are aggregated by taxi zone at the game, series, and playoff levels.

The frontend loads the processed output from `public/data/`:

| File | Contents |
|---|---|
| `taxi_zones.geojson` | NYC taxi zone geometry |
| `game_zone_stats.json` | Per-game zone statistics |
| `series_zone_stats.json` | Per-series zone statistics |
| `playoffs_zone_stats.json` | Playoff-wide zone statistics |
| `games.json` | Game metadata |

## Limitations

This visualization shows **vehicle activity, not people**. Please read the results with that in mind:

- Individual trips do not indicate whether a passenger attended a game, was a Knicks fan, or was traveling because of a game or watch party.
- Away games can still generate substantial activity in New York City through watch parties and other events.
- Results represent trip activity associated with selected locations and time periods. They are **not** a direct measurement of attendance, fan movement, or game-caused traffic.
- Values are raw trip counts, not normalized against typical activity for the same time and place.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Mapping:** MapLibre GL JS via `@vis.gl/react-maplibre`, with OpenFreeMap vector tiles
- **Data pipeline:** Python
- **Data format:** Static JSON and GeoJSON served from `public/data/`

### Prerequisites

- Node.js (current LTS recommended)
- Python 3.x (only needed to regenerate the data)

### Run the frontend

```bash
git clone https://github.com/NicholasTan0/knicks-in-motion.git
cd knicks-in-motion/frontend
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

### MapLibre GL JS v6 note

This project uses `maplibre-gl` v6, which ships as ES modules only and has no default export. Two things follow from that:

- Import it as a namespace and pass it to the map: `import * as maplibregl from "maplibre-gl"` and `<Map mapLib={maplibregl} />`.
- Vite builds must register the worker before a map renders:

```js
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
maplibregl.setWorkerUrl(workerUrl);
```

Use `?worker&url` rather than a plain `?url`, otherwise production builds can ship the worker without a file it imports.

## Project Structure

```
knicks-in-motion/
├── frontend/
│   ├── public/data/          # Processed GeoJSON and JSON used by the map
│   └── src/components/       # Map, ColorPicker, Pin, and other UI components
└── analysis/                 # Python data-processing scripts (adjust to match your layout)
└── data/                     # cleaned and aggregated data
```

## Acknowledgments

- [NYC Taxi & Limousine Commission](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page) for trip record data
- [OpenFreeMap](https://openfreemap.org/), [OpenMapTiles](https://www.openmaptiles.org/), and [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors for map tiles and data
- [MapLibre GL JS](https://maplibre.org/) and [`@vis.gl/react-maplibre`](https://visgl.github.io/react-map-gl/) for the mapping stack

## Author

Built by [Nicholas Tan](https://github.com/NicholasTan0).
