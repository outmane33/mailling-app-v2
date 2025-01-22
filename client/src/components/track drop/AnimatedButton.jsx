export default function AnimatedButton({
  icon: Icon,
  text,
  colorClasses,
  onClick,
}) {
  const { background, hover, gradientFrom, gradientVia, gradientTo } =
    colorClasses;

  return (
    <button
      className={`group relative flex items-center gap-2 p-4 font-semibold ${background} text-white rounded-full px-8 
          ${hover} overflow-hidden transition-all duration-300 ease-in-out
          transform hover:scale-105 hover:shadow-xl
          before:absolute before:inset-0 before:bg-white/20 before:translate-x-[-150%] before:skew-x-[-45deg] before:transition-transform
          hover:before:translate-x-[150%] before:duration-700
          active:scale-95 max-w-fit`}
      onClick={onClick}
    >
      <Icon
        size={20}
        color="white"
        fill="white"
        className="transform transition-transform duration-300 group-hover:rotate-12"
      />
      <p className="relative z-10">{text}</p>
      <div
        className={`absolute inset-0 bg-gradient-to-r from-${gradientFrom} via-${gradientVia} to-${gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
    </button>
  );
}
