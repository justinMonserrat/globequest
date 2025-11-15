import React, { useState, useRef } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import countriesData from '../data/countries-110m.json';
import countryNameToISO from '../data/countryNameToISO';
import './WorldMap.css';

const WorldMap = ({ 
    unlockedCountries = [], 
    availableCountries = [], 
    onCountrySelect,
    regionCenter = null, // [longitude, latitude] for region zoom
    regionScale = null, // Scale for region zoom
    regionCountries = [], // Countries in current region for filtering
}) => {
    const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
    const mapRef = useRef(null);
    
    // Convert arrays to Sets for faster lookup
    const unlockedSet = new Set(unlockedCountries);
    const availableSet = new Set(availableCountries.length > 0 ? new Set(availableCountries) : new Set(unlockedCountries));
    const regionSet = regionCountries.length > 0 ? new Set(regionCountries) : null;

    // Use region-specific zoom if provided, otherwise use default world view
    // Higher scales for better visibility of small regions
    const baseScale = regionCenter && regionScale ? regionScale : 147;
    const baseCenter = regionCenter && regionScale ? regionCenter : [0, 20];
    
    const projectionConfig = {
        scale: baseScale * position.zoom,
        center: [
            baseCenter[0] + position.coordinates[0],
            baseCenter[1] + position.coordinates[1]
        ],
    };

    const handleZoomIn = () => {
        setPosition(prev => ({
            ...prev,
            zoom: Math.min(prev.zoom * 1.2, 3)
        }));
    };

    const handleZoomOut = () => {
        setPosition(prev => ({
            ...prev,
            zoom: Math.max(prev.zoom / 1.2, 0.5)
        }));
    };

    const handleResetZoom = () => {
        setPosition({ coordinates: [0, 0], zoom: 1 });
    };

    return (
        <div className="world-map-container w-full max-w-6xl mx-auto overflow-hidden relative">
            {/* Zoom Controls - Bottom Right */}
            <div className="absolute bottom-2 right-2 z-20 flex gap-1">
                <button
                    onClick={handleZoomIn}
                    className="bg-white hover:bg-gray-100 text-gray-700 font-bold w-10 h-10 rounded shadow-md border border-gray-300 transition-colors flex items-center justify-center"
                    title="Zoom In"
                >
                    +
                </button>
                <button
                    onClick={handleZoomOut}
                    className="bg-white hover:bg-gray-100 text-gray-700 font-bold w-10 h-10 rounded shadow-md border border-gray-300 transition-colors flex items-center justify-center"
                    title="Zoom Out"
                >
                    −
                </button>
                {position.zoom !== 1 && (
                    <button
                        onClick={handleResetZoom}
                        className="bg-white hover:bg-gray-100 text-gray-700 text-xs w-10 h-10 rounded shadow-md border border-gray-300 transition-colors flex items-center justify-center"
                        title="Reset Zoom"
                    >
                        ↺
                    </button>
                )}
            </div>
            
            <ComposableMap
                projectionConfig={projectionConfig}
                className="w-full"
                style={{ height: 'auto', maxHeight: '600px' }}
                ref={mapRef}
            >
                <Geographies geography={countriesData}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            // Get country name from TopoJSON
                            const countryName = geo.properties.name || geo.properties.NAME;

                            // Map country name to ISO code
                            const isoCode = countryNameToISO[countryName] ||
                                geo.properties.ISO_A3 ||
                                geo.properties.ISO_A2 ||
                                geo.properties.ISO3 ||
                                geo.properties.ADM0_A3;

                            const isUnlocked = unlockedSet.has(isoCode);
                            const isAvailable = availableSet.has(isoCode);
                            // If region filtering is active, only show countries in that region
                            const isInRegion = regionSet ? regionSet.has(isoCode) : true;
                            const isClickable = isAvailable && isInRegion; // Can click if available (even if not unlocked)
                            
                            // Hide countries not in current region when zoomed
                            if (regionSet && !isInRegion && !isUnlocked && !isAvailable) {
                                return null;
                            }

                            // Color coding:
                            // - Green: Unlocked (quiz passed, can view info)
                            // - Yellow/Orange: Available but not unlocked (needs quiz)
                            // - Grey: Not available
                            const getFillColor = () => {
                                if (isUnlocked) return '#2E8B57'; // Green - unlocked
                                if (isAvailable) return '#FFA500'; // Orange - available but needs quiz
                                return '#D3D3D3'; // Grey - not available
                            };

                            const getHoverColor = () => {
                                if (isUnlocked) return '#3CB371';
                                if (isAvailable) return '#FF8C00';
                                return '#C0C0C0';
                            };

                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (isClickable && onCountrySelect && isoCode) {
                                            onCountrySelect(isoCode);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        if (isClickable) {
                                            e.preventDefault();
                                        }
                                    }}
                                    style={{
                                        default: {
                                            fill: getFillColor(),
                                            outline: 'none',
                                            stroke: '#FFFFFF',
                                            strokeWidth: 0.5,
                                            cursor: isClickable ? 'pointer' : 'default',
                                            pointerEvents: 'all',
                                        },
                                        hover: {
                                            fill: getHoverColor(),
                                            outline: 'none',
                                            stroke: '#FFFFFF',
                                            strokeWidth: 1,
                                            cursor: isClickable ? 'pointer' : 'default',
                                            pointerEvents: 'all',
                                            transition: 'all 0.2s ease',
                                        },
                                        pressed: {
                                            fill: isUnlocked ? '#1E6B47' : isAvailable ? '#FF7F00' : '#A0A0A0',
                                            outline: 'none',
                                            stroke: '#FFFFFF',
                                            strokeWidth: 1,
                                            cursor: isClickable ? 'pointer' : 'default',
                                            pointerEvents: 'all',
                                        },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>
            </ComposableMap>
        </div>
    );
};

export default WorldMap;
