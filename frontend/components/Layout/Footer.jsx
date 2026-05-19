'use client';

import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';

const footerStyles = {
  heading: "text-sm font-bold uppercase tracking-[0.18em] text-amber-300",
  link: "text-sm font-medium text-white/70 transition hover:text-amber-200 focus:outline-none focus:text-amber-200",
  iconLink:
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#120f0b]",
  primaryButton:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-amber-400 px-5 text-sm font-bold text-stone-950 shadow-sm shadow-amber-900/10 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#120f0b]",
  input:
    "min-h-11 flex-1 rounded-full border border-white/10 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-amber-300 focus:ring-2 focus:ring-amber-200/30 sm:w-72",
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, href: 'https://www.facebook.com/profile.php?id=61563690991747' },
    { name: 'Twitter', icon: FaTwitter, href: 'https://X.com/' },
    { name: 'Instagram', icon: FaInstagram, href: 'https://instagram.com/' },
    { name: 'LinkedIn', icon: FaLinkedin, href: 'https://linkedin.com/company/' },
    { name: 'YouTube', icon: FaYoutube, href: 'https://youtube.com/' },
  ];

  const quickLinks = [
    { name: 'About Us', href: '/#about' },
    { name: 'Our Mission', href: '/#mission' },
    { name: 'Success Stories', href: '/#success' },
    { name: 'Volunteer', href: '/#volunteer' },
    { name: 'Contact', href: '/#contact' },
  ];

  const supportLinks = [
    { name: 'Donate', href: '/donate' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Events', href: '/events' },
    { name: 'Careers', href: '/careers' },
    { name: 'Admin Login', href: '/login' },
  ];

  return (
    <footer className="bg-[#120f0b] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.7fr_0.7fr_1fr]">
          <div>
            <Link href="/#top" className="inline-flex items-center gap-3">
              <img
                src="/assets/brand/raushni-logo.png"
                alt="Raushni Educational and Social Welfare Trust logo"
                className="h-16 w-16 rounded-2xl object-contain"
              />
              <span className="text-base font-black uppercase leading-tight tracking-wide">
                Raushni
                <span className="block text-xs font-semibold text-amber-200">
                  Educational & Social Welfare Trust
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
              Empowering underserved communities through education, healthcare access,
              livelihood development, and social welfare programs.
            </p>

            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={footerStyles.iconLink}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className={footerStyles.heading}>Explore</h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className={footerStyles.link}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={footerStyles.heading}>Links</h3>
            <ul className="mt-5 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className={footerStyles.link}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={footerStyles.heading}>Contact</h3>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="mt-0.5 flex-none text-amber-300" />
                <p className="text-sm leading-6 text-white/70">
                  Rauzah Apartment, Bhatauna Road, Marwan Khurd, Muzaffarpur, Bihar 843113
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="flex-none text-amber-300" />
                <a href="tel:+9199739557600" className={footerStyles.link}>
                  +91 997 3955 7600
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="flex-none text-amber-300" />
                <a href="mailto:info@raushni.com" className={footerStyles.link}>
                  info@raushni.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h4 className="text-lg font-black text-white">Stay connected with Raushni</h4>
              <p className="mt-1 text-sm text-white/60">Get updates about programs, events, relief work, and volunteer opportunities.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className={footerStyles.input}
              />
              <button className={footerStyles.primaryButton}>
                <Send size={16} />
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {currentYear} Raushni Educational & Social Welfare Trust. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-2 text-xs">
            Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted
            <ArrowRight size={14} aria-hidden="true" />
          </p>
        </div>
      </div>
    </footer>
  );
}
