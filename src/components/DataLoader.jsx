import { useEffect, useState } from 'react';

export default function DataLoader() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/updateData', {
                    method: 'POST',
                });

                if (!response.ok) {
                    throw new Error('Failed to update data');
                }

                const data = await response.json();
                console.log(data.message); // Log the success message
            } catch (err) {
                setError(err.message);
                console.error('Error:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Only run on component mount

    return (
        <div>
            {loading && <p>Loading data...</p>}
            {error && <p>Error: {error}</p>}
            {!loading && !error && <p>Data has been refreshed on load.</p>}
        </div>
    );
}