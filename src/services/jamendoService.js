const JAMENDO_API_KEY = '7eae231f';
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';

async function fetchTracks(limit = 10, offset = 0) {
  try {
    const response = await fetch(
      `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_API_KEY}&format=json&limit=${limit}&offset=${offset}&include=musicinfo&imagesize=600`
    );
    if (!response.ok) throw new Error('Failed to fetch tracks');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching tracks:', error);
    return [];
  }
}

async function searchTracks(query, limit = 10) {
  try {
    const response = await fetch(
      `${JAMENDO_API_BASE}/tracks/search/?client_id=${JAMENDO_API_KEY}&format=json&limit=${limit}&search=${encodeURIComponent(query)}&include=musicinfo&imagesize=600`
    );
    if (!response.ok) throw new Error('Failed to search tracks');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}

export { fetchTracks, searchTracks };