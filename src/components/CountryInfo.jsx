import React, { useEffect, useState } from 'react';

const CountryInfo = ({ isoCode }) => {
    const [countryData, setCountryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isoCode) {
            setCountryData(null);
            return;
        }

        setLoading(true);
        setError(null);

        fetch(`https://restcountries.com/v3.1/alpha/${isoCode}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Country not found');
                }
                return response.json();
            })
            .then((data) => {
                setCountryData(data[0]);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching country data:', err);
                setError(err.message);
                setLoading(false);
            });
    }, [isoCode]);

    if (!isoCode) {
        return (
            <div className="p-4 border rounded shadow bg-gray-50">
                <p className="text-gray-500">Select a country to see details</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-4 border rounded shadow bg-gray-50">
                <p className="text-gray-500">Loading country data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 border rounded shadow bg-red-50">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    if (!countryData) {
        return null;
    }

    return (
        <div className="p-6 border rounded-lg shadow-lg bg-white mt-4 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">{countryData.name.common}</h2>

            {countryData.flags?.svg && (
                <img
                    src={countryData.flags.svg}
                    alt={`Flag of ${countryData.name.common}`}
                    className="w-48 h-32 object-cover border rounded my-3"
                />
            )}

            <div className="space-y-2">
                <p>
                    <strong className="text-gray-700">Capital:</strong>{' '}
                    <span className="text-gray-900">
                        {countryData.capital?.[0] || 'N/A'}
                    </span>
                </p>

                <p>
                    <strong className="text-gray-700">Population:</strong>{' '}
                    <span className="text-gray-900">
                        {countryData.population?.toLocaleString() || 'N/A'}
                    </span>
                </p>

                <p>
                    <strong className="text-gray-700">Languages:</strong>{' '}
                    <span className="text-gray-900">
                        {countryData.languages
                            ? Object.values(countryData.languages).join(', ')
                            : 'N/A'}
                    </span>
                </p>

                <p>
                    <strong className="text-gray-700">Neighbors:</strong>{' '}
                    <span className="text-gray-900">
                        {countryData.borders?.length > 0
                            ? countryData.borders.join(', ')
                            : 'None'}
                    </span>
                </p>

                {countryData.region && (
                    <p>
                        <strong className="text-gray-700">Region:</strong>{' '}
                        <span className="text-gray-900">{countryData.region}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default CountryInfo;

