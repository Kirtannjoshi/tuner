# Tuner

A modern streaming platform for radio stations and TV channels with a sleek, responsive UI.

## Features

- **Radio Streaming**: Listen to radio stations from around the world
- **TV Channel Streaming**: Watch live TV channels with HLS support
- **Favorites**: Save your favorite stations and channels for quick access
- **Universal Player**: Background playback continues as you browse
- **Picture-in-Picture**: Watch TV channels in a floating window while browsing
- **Responsive Design**: Optimized for both desktop and mobile devices

## Technology Stack

- React for UI components
- React Router for navigation
- Context API for state management
- HLS.js for streaming HLS content
- TailwindCSS for styling

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/tuner.git
   cd tuner
   ```

2. Install dependencies
   ```
   npm install
   # or 
   yarn
   ```

3. Start the development server
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Building for Production

```
npm run build
# or
yarn build
```

## Deployment

### Firebase Deployment

This project is configured for Firebase Hosting deployment.

1. Install Firebase CLI (if not already installed)
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase
   ```
   firebase login
   ```

3. Build the project
   ```
   npm run build
   ```

4. Deploy to Firebase
   ```
   firebase deploy --only hosting
   ```

The app is currently deployed at: https://tuneo-app-kj23.web.app

### Continuous Deployment

This project uses GitHub Actions for continuous deployment to Firebase Hosting. Any push to the main branch will trigger an automatic build and deployment.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All India Radio for stream sources
- Public domain radio stations and TV channels
