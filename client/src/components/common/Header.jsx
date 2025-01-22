export default function Header({ title }) {
  return (
    <header className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto py-3 sm:py-4 px-3 sm:px-6 lg:px-8 text-gray-100">
        <h1
          className="text-xl sm:text-2xl font-semibold"
          aria-label="Header title"
        >
          {title}
        </h1>
      </div>
    </header>
  );
}
