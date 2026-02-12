import football from '../assets/football.jpg';

export default function Home() {
  return (
    <>
      <div className="relative min-h-screen">
        <div className="relative h-screen">
          <div className="absolute inset-0">
            <img
              src={football}
              alt="Football Stadium"
              className="w-full h-full object-cover"
            />
            <p className="absolute top-2 left-2 text-xs text-white z-10">
              Photo by{' '}
              <a
                href="https://unsplash.com/@24ameer?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white underline transition-colors"
              >
                Ameer Basheer
              </a>
              {' '}on{' '}
              <a
                href="https://unsplash.com/photos/aerial-photography-of-football-field-KXfl8fHJLkY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white underline transition-colors"
              >
                Unsplash
              </a>
            </p>
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/60 to-neutral-900"></div>
          </div>

          <div className="relative z-9 flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8 text-shadow-lg text-shadow-black font-mono">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                NFL Stats Hub
              </h1>
              <p className="text-xl sm:text-2xl text-white mb-8 font-light">
                Team/Player Analytics & Historical Data
              </p>
              <p className="text-lg sm:text-xl text-white mb-12 max-w-2xl mx-auto">
                Data-driven insights for football. Access comprehensive player stats, and trends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}