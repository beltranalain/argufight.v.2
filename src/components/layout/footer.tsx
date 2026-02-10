import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-white/80 hover:text-white transition-colors text-base">Home</Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-white/80 hover:text-white transition-colors text-base">How It Works</Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-white/80 hover:text-white transition-colors text-base">Leaderboard</Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/80 hover:text-white transition-colors text-base">Blog</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-white/80 hover:text-white transition-colors text-base">Pricing</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/80 hover:text-white transition-colors text-base">About Us</Link>
              </li>
              <li>
                <Link href="/faq" className="text-white/80 hover:text-white transition-colors text-base">FAQ</Link>
              </li>
              <li>
                <Link href="/debate-practice" className="text-white/80 hover:text-white transition-colors text-base">Debate Practice</Link>
              </li>
              <li>
                <Link href="/ai-debate" className="text-white/80 hover:text-white transition-colors text-base">AI Debate</Link>
              </li>
              <li>
                <Link href="/debate-simulator" className="text-white/80 hover:text-white transition-colors text-base">Debate Simulator</Link>
              </li>
              <li>
                <Link href="/argument-checker" className="text-white/80 hover:text-white transition-colors text-base">Argument Checker</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-white/80 hover:text-white transition-colors text-base">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/80 hover:text-white transition-colors text-base">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Contact</h3>
            <p className="text-white/80 text-base">info@argufight.com</p>
          </div>
        </div>

        <div className="text-center text-white/60 text-sm pt-8 border-t border-white/10">
          <p>&copy; {new Date().getFullYear()} Argu Fight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
