import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/ipl';

// IPL Teams metadata with logos and colors
const TEAMS = {
  'Mumbai Indians': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png',
    color: '#004f91'
  },
  'Chennai Super Kings': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png',
    color: '#fdb913'
  },
  'Royal Challengers Bangalore': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bangalore_2020.svg/1200px-Royal_Challengers_Bangalore_2020.svg.png',
    color: '#ec1c24'
  },
  'Kolkata Knight Riders': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/1200px-Kolkata_Knight_Riders_Logo.svg.png',
    color: '#552583'
  },
  'Delhi Capitals': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/1200px-Delhi_Capitals_Logo.svg.png',
    color: '#0078bc'
  },
  'Rajasthan Royals': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/1200px-Rajasthan_Royals_Logo.svg.png',
    color: '#254aa5'
  },
  'Sunrisers Hyderabad': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad.svg/1200px-Sunrisers_Hyderabad.svg.png',
    color: '#ff822a'
  },
  'Punjab Kings': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo.svg/1200px-Punjab_Kings_Logo.svg.png',
    color: '#ed1b24'
  },
  'Gujarat Titans': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/1200px-Gujarat_Titans_Logo.svg.png',
    color: '#1d428a'
  },
  'Lucknow Super Giants': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Lucknow_Super_Giants_Logo.svg/1200px-Lucknow_Super_Giants_Logo.svg.png',
    color: '#a72056'
  }
};

export const getTeams = () => {
  return TEAMS;
};

export const getUpcomingMatches = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/matches/upcoming`);
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    throw error;
  }
};

export const getPastMatches = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/matches/past`);
    return response.data;
  } catch (error) {
    console.error('Error fetching past matches:', error);
    throw error;
  }
};

export const getLiveMatches = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/matches/live`);
    return response.data;
  } catch (error) {
    console.error('Error fetching live matches:', error);
    throw error;
  }
};

export const getPointsTable = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/points-table`);
    return response.data;
  } catch (error) {
    console.error('Error fetching points table:', error);
    throw error;
  }
};