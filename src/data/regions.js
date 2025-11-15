// Comprehensive regions with ALL countries organized by geographic region
const regions = [
    {
        name: "North America",
        countries: ["USA", "CAN", "MEX"],
        nextRegion: "Caribbean",
        center: [-100, 45], // Center coordinates for zoom
        scale: 300, // Zoom scale for this region
        mapFile: null, // Use default world map
    },
    {
        name: "Caribbean",
        countries: ["CUB", "JAM", "HTI", "DOM", "PRI", "TTO", "BHS", "BRB", "GRD", "VCT", "LCA", "DMA", "ATG", "KNA"],
        nextRegion: "Central America",
        center: [-75, 20],
        scale: 600, // Higher scale for better visibility
        mapFile: null, // Will use filtered view of world map
    },
    {
        name: "Central America",
        countries: ["BLZ", "GTM", "HND", "SLV", "NIC", "CRI", "PAN"],
        nextRegion: "South America",
        center: [-85, 12],
        scale: 450,
        mapFile: null,
    },
    {
        name: "South America",
        countries: ["BRA", "ARG", "COL", "PER", "VEN", "CHL", "ECU", "BOL", "PRY", "URY", "GUY", "SUR", "GUF"],
        nextRegion: "Europe",
        center: [-60, -20],
        scale: 300,
        mapFile: null,
    },
    {
        name: "Europe",
        countries: [
            "GBR", "FRA", "DEU", "ITA", "ESP", "POL", "NLD", "BEL", "GRC", "PRT",
            "AUT", "CHE", "SWE", "NOR", "DNK", "FIN", "IRL", "CZE", "ROU", "HUN",
            "BGR", "HRV", "SVK", "SVN", "LTU", "LVA", "EST", "LUX", "SRB", "BIH",
            "ALB", "MKD", "MNE", "MDA", "UKR", "BLR", "RUS", "ISL", "CYP", "XKX"
        ],
        nextRegion: "Asia",
        center: [15, 55],
        scale: 400,
        mapFile: null,
    },
    {
        name: "Asia",
        countries: [
            "CHN", "IND", "JPN", "KOR", "THA", "VNM", "PHL", "IDN", "MYS", "SGP",
            "MMR", "KHM", "LAO", "BGD", "PAK", "AFG", "IRN", "IRQ", "SAU", "TUR",
            "ISR", "PSE", "JOR", "LBN", "SYR", "YEM", "OMN", "ARE", "QAT", "KWT",
            "KAZ", "UZB", "KGZ", "TJK", "TKM", "MNG", "NPL", "BTN", "LKA", "MDV",
            "BRN", "TLS", "TWN", "ARM", "AZE", "GEO", "PRK"
        ],
        nextRegion: "Africa",
        center: [100, 30],
        scale: 250,
        mapFile: null,
    },
    {
        name: "Africa",
        countries: [
            "EGY", "ZAF", "NGA", "KEN", "ETH", "MAR", "TUN", "DZA", "GHA", "TZA",
            "SDN", "SSD", "UGA", "RWA", "BDI", "CMR", "TCD", "NER", "MLI", "BFA",
            "SEN", "GIN", "GNB", "SLE", "LBR", "CIV", "GMB", "MRT", "LBY", "AGO",
            "COD", "COG", "CAF", "GAB", "GNQ", "SOM", "DJI", "ERI", "ZMB", "ZWE",
            "BWA", "NAM", "LSO", "SWZ", "MWI", "MOZ", "MDG", "MUS", "ESH", "BEN",
            "TGO"
        ],
        nextRegion: "Oceania",
        center: [20, 0],
        scale: 300,
        mapFile: null,
    },
    {
        name: "Oceania",
        countries: ["AUS", "NZL", "FJI", "PNG", "NCL", "VUT", "SLB", "WSM", "TON", "KIR", "NRU", "PLW", "FSM", "MHL"],
        nextRegion: null,
        center: [150, -25],
        scale: 400,
        mapFile: null,
    },
];

export default regions;
