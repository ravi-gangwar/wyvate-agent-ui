export const Header = () => {
  return (
    <header className="pt-8 pb-6">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
          </div>
          <h1 className="text-3xl font-semibold text-white">Wyvate</h1>
        </div>
      </div>
    </header>
  );
};
