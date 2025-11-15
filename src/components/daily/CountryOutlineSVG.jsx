import React, { useEffect, useState } from 'react';
import { geoPath, geoMercator } from 'd3-geo';
import { feature } from 'topojson-client';
import countriesData from '../../data/countries-110m.json';
import countryNameToISO from '../../data/countryNameToISO';

const CountryOutlineSVG = ({ countryCode, countryName }) => {
  const [pathData, setPathData] = useState(null);
  const [viewBox, setViewBox] = useState('0 0 400 300');

  useEffect(() => {
    if (!countryCode && !countryName) return;

    try {
      // Convert TopoJSON to GeoJSON
      const countries = feature(countriesData, countriesData.objects.countries);
      
      // Find the country geometry
      const countryFeature = countries.features.find(f => {
        const name = f.properties?.name || f.properties?.NAME;
        const iso = countryNameToISO[name] || f.properties?.ISO_A3 || f.properties?.ISO_A2;
        return iso === countryCode || name === countryName;
      });

      if (countryFeature) {
        // Create projection centered on this country
        const projection = geoMercator()
          .fitSize([400, 300], countryFeature);
        
        const pathGenerator = geoPath().projection(projection);
        const pathString = pathGenerator(countryFeature);
        
        if (pathString) {
          setPathData(pathString);
          setViewBox('0 0 400 300');
        }
      }
    } catch (error) {
      console.error('Error rendering country outline:', error);
    }
  }, [countryCode, countryName]);

  if (!pathData) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-400 text-sm">Loading outline...</div>
      </div>
    );
  }

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-48 mx-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={pathData}
        fill="#1a1a1a"
        stroke="#000"
        strokeWidth="1.5"
        className="country-outline"
      />
    </svg>
  );
};

export default CountryOutlineSVG;

