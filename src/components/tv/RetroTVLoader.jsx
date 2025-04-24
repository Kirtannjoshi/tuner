import React from 'react';

const RetroTVLoader = ({ error, onRetry }) => {
  // SMPTE color bars pattern
  const colorBars = [
    '#c0c0c0', // White
    '#c0af00', // Yellow
    '#00c0c0', // Cyan
    '#00c000', // Green
    '#c000c0', // Magenta
    '#c00000', // Red
    '#0000c0'  // Blue
  ];

  return (
    <div className="relative w-full h-full min-h-[240px] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Color Bars */}
      <div className="w-full h-3/4 flex">
        {colorBars.map((color, index) => (
          <div
            key={index}
            className="flex-1 h-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {/* Static Overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
          animation: 'noise 0.2s infinite'
        }}
      />

      {/* Message Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <div className="bg-black bg-opacity-75 p-4 rounded-lg">
          {error ? (
            <>
              <h3 className="text-red-500 text-xl font-bold mb-2 font-mono">NO SIGNAL</h3>
              <p className="text-gray-300 mb-4 font-mono">{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-mono"
                >
                  RETRY
                </button>
              )}
            </>
          ) : (
            <>
              <h3 className="text-green-500 text-xl font-bold mb-2 font-mono">TUNING CHANNEL</h3>
              <p className="text-gray-300 font-mono">Please wait...</p>
            </>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes noise {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(10%, 5%); }
          30% { transform: translate(-5%, 10%); }
          40% { transform: translate(15%, -5%); }
          50% { transform: translate(-15%, 15%); }
          60% { transform: translate(5%, 5%); }
          70% { transform: translate(-5%, -15%); }
          80% { transform: translate(5%, 15%); }
          90% { transform: translate(-10%, 5%); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
};

export default RetroTVLoader;