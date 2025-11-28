import { TrophyIcon } from '@heroicons/react/24/solid';

const SportPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
                {/* Icon */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-pink-500/25 animate-pulse">
                            <TrophyIcon className="h-16 w-16 text-white" />
                        </div>
                        {/* Glow effect */}
                        <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                    Coming Soon
                </h1>

                {/* Subheading */}
                <p className="text-2xl text-gray-300 mb-6 font-medium">
                    Live Sports Streaming
                </p>

                {/* Description */}
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    We're working on bringing you live sports action from around the world.
                    Watch your favorite matches, tournaments, and sporting events right here on Tuner.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                        <div className="text-4xl mb-3">🏏</div>
                        <h3 className="text-white font-semibold mb-2">Cricket</h3>
                        <p className="text-gray-400 text-sm">IPL, World Cup & more</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                        <div className="text-4xl mb-3">⚽</div>
                        <h3 className="text-white font-semibold mb-2">Football</h3>
                        <p className="text-gray-400 text-sm">Premier League, La Liga</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                        <div className="text-4xl mb-3">🏀</div>
                        <h3 className="text-white font-semibold mb-2">Basketball</h3>
                        <p className="text-gray-400 text-sm">NBA, Euroleague</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-medium shadow-lg shadow-pink-500/25">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span>In Development</span>
                </div>

                {/* Back to Home */}
                <div className="mt-8">
                    <a
                        href="/"
                        className="text-pink-400 hover:text-pink-300 transition-colors font-medium"
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>

            <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
        </div>
    );
};

export default SportPage;
