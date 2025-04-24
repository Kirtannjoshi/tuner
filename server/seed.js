const mongoose = require('mongoose');
const Match = require('./models/Match');
const Team = require('./models/Team');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tuner', {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
}).then(() => {
  console.log('Connected to MongoDB');
  seedDatabase();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const teams = [
  {
    name: 'Mumbai Indians',
    matches: 8,
    won: 5,
    lost: 3,
    tied: 0,
    points: 10,
    netRunRate: 0.733
  },
  {
    name: 'Chennai Super Kings',
    matches: 8,
    won: 6,
    lost: 2,
    tied: 0,
    points: 12,
    netRunRate: 0.812
  },
  {
    name: 'Royal Challengers Bangalore',
    matches: 8,
    won: 4,
    lost: 4,
    tied: 0,
    points: 8,
    netRunRate: -0.139
  }
];

const matches = [
  {
    matchId: 'IPL2024_01',
    teams: [
      {
        name: 'Chennai Super Kings',
        score: 182,
        wickets: 6,
        overs: 20
      },
      {
        name: 'Royal Challengers Bangalore',
        score: 156,
        wickets: 8,
        overs: 20
      }
    ],
    date: new Date('2024-04-15T14:00:00Z'),
    time: '19:30',
    venue: 'M. A. Chidambaram Stadium, Chennai',
    status: 'completed',
    result: 'Chennai Super Kings won by 26 runs'
  },
  {
    matchId: 'IPL2024_02',
    teams: [
      {
        name: 'Mumbai Indians',
        score: 89,
        wickets: 2,
        overs: 8.4
      },
      {
        name: 'Royal Challengers Bangalore',
        score: 165,
        wickets: 7,
        overs: 20
      }
    ],
    date: new Date(),
    time: '19:30',
    venue: 'Wankhede Stadium, Mumbai',
    status: 'live'
  },
  {
    matchId: 'IPL2024_03',
    teams: [
      { name: 'Chennai Super Kings' },
      { name: 'Mumbai Indians' }
    ],
    date: new Date('2024-04-17T14:00:00Z'),
    time: '19:30',
    venue: 'M. A. Chidambaram Stadium, Chennai',
    status: 'upcoming'
  }
];

async function seedDatabase() {
  try {
    // Clear existing data
    await Promise.all([
      Match.deleteMany({}),
      Team.deleteMany({})
    ]);

    // Insert new data
    await Promise.all([
      Match.insertMany(matches),
      Team.insertMany(teams)
    ]);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}