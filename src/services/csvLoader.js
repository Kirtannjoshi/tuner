import Papa from 'papaparse';

/**
 * Load and parse CSV file
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} - Parsed CSV data
 */
export const loadCSV = async (filePath) => {
    try {
        const response = await fetch(filePath);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error loading CSV:', error);
        return [];
    }
};

/**
 * Load all IPTV sources from main playlists CSV
 * @returns {Promise<Array>} - Array of IPTV sources
 */
export const loadIPTVSources = async () => {
    try {
        const sources = await loadCSV('/sours/iptv_main_playlists.csv');
        return sources.map(source => ({
            name: source.Source,
            url: source.URL,
            count: source.Channels,
            description: source.Description
        }));
    } catch (error) {
        console.error('Error loading IPTV sources:', error);
        return [];
    }
};

/**
 * Load all categories from categories CSV
 * @returns {Promise<Array>} - Array of categories
 */
export const loadCategories = async () => {
    try {
        const categories = await loadCSV('/sours/iptv_categories.csv');
        return categories.map(cat => ({
            name: cat.Category,
            url: cat.URL
        }));
    } catch (error) {
        console.error('Error loading categories:', error);
        return [];
    }
};

/**
 * Load all countries from countries CSV
 * @returns {Promise<Array>} - Array of countries
 */
export const loadCountries = async () => {
    try {
        const countries = await loadCSV('/sours/iptv_countries_complete.csv');
        return countries;
    } catch (error) {
        console.error('Error loading countries:', error);
        return [];
    }
};
