export async function getWeatherData(lat, lon) {
    try {
        const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
            throw new Error("Kunde inte hämta väderdata");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}
