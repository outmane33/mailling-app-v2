export default function StepCounter({ steps, goal = 10000 }) {
  // Calculate percentage for the progress
  const percentage = Math.min((steps / goal) * 100, 100);

  // Increased radius for a larger circle
  const radius = 110; // Increased from 80
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-96 h-96 mx-auto">
      {/* Increased from w-64 h-64 */}
      <div className="relative">
        {/* Background circle */}
        <svg className="w-80 h-80 -rotate-90 transform">
          {/* Increased from w-48 h-48 */}
          <circle
            cx="160" // Increased from 96
            cy="160" // Increased from 96
            r={radius}
            className="stroke-gray-200"
            strokeWidth="16" // Increased from 12
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="160" // Increased from 96
            cy="160" // Increased from 96
            r={radius}
            className="stroke-violet-500"
            strokeWidth="16" // Increased from 12
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
        </svg>

        {/* Steps counter in the middle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-5xl font-bold text-white">
            {/* Increased from text-3xl */}
            {steps}/<span className="text-violet-500 text-lg">{goal}</span>
            {/* Increased from text-sm */}
          </div>
          <div className="text-lg text-gray-400 mt-2">emails</div>
          {/* Increased from text-sm */}
        </div>
      </div>
    </div>
  );
}
