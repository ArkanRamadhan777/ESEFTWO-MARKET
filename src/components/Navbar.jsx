import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '/#home' },
    { label: 'About', href: '/#about' },
    { label: 'Produk', href: '/#produk' },
    { label: 'Contact', href: '/#contact' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isLanding
          ? 'bg-primary shadow-lg shadow-primary/20'
          : 'bg-primary/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo — SVG file, left side only */}
          <Link to="/" className="flex-shrink-0 hover:opacity-90 transition-opacity">
            <img
              src="/EL.svg"
              alt="ESEFTWO MARKET"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop Nav — all links aligned right */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/85 hover:text-white hover:bg-white/15 px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-white hover:bg-white/15 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-primary border-t border-white/10 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-white/85 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}
