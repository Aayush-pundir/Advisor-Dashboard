import Link from "next/link";

export function LandingHeader() {
  return (
    <div className="sticky top-0 z-40 border-b border-[#1B1714]/10 bg-[#FAF9F7]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-8">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-tight text-[#171310]"
          style={{ fontFamily: "var(--font-plex-serif)" }}
        >
          OmniCard <span className="text-[#D6362B]">Advisor</span>
        </Link>
        <div className="flex flex-wrap items-center gap-5 overflow-x-auto sm:gap-7">
          <Link
            href="#mission"
            className="whitespace-nowrap text-[13.5px] font-medium text-[#1B1714]/75 hover:text-[#171310]"
          >
            The mission
          </Link>
          <Link
            href="#calculator"
            className="whitespace-nowrap text-[13.5px] font-medium text-[#1B1714]/75 hover:text-[#171310]"
          >
            Earnings calculator
          </Link>
          <Link
            href="#how-it-works"
            className="whitespace-nowrap text-[13.5px] font-medium text-[#1B1714]/75 hover:text-[#171310]"
          >
            How it works
          </Link>
          <Link
            href="/directory"
            className="whitespace-nowrap text-[13.5px] font-medium text-[#1B1714]/75 hover:text-[#171310]"
          >
            Advisor Directory
          </Link>
          <Link
            href="/login"
            className="whitespace-nowrap text-[13.5px] font-medium text-[#1B1714]/75 hover:text-[#171310]"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="whitespace-nowrap rounded-[4px] bg-[#D6362B] px-4 py-2.5 text-[13.5px] font-semibold text-[#FAF9F7] hover:bg-[#B22C22]"
          >
            Join the Initiative
          </Link>
        </div>
      </div>
    </div>
  );
}
