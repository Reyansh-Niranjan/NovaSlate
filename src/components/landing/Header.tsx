import React from 'react';
import { siteContent } from '@/data/content';

interface HeaderProps {
  onOpenContact: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToDashboard?: () => void;
  isLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenContact,
  onNavigateToLogin,
  onNavigateToDashboard,
  isLoggedIn = false,
}) => {
  return (
    <header className="site-head">
      <div className="s__brand">
        <a aria-current="page" href="/" className="router-link-active router-link-exact-active s__logo flex items-center gap-3 group" aria-label="NovaSlate">
          <img
            src="/novaslate_icon.png"
            alt="NovaSlate"
            className="w-9 h-9 object-contain transform group-hover:scale-105 transition-transform duration-200"
          />
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block text-[var(--color-heading)] font-['Proxima_Nova','Montserrat',sans-serif]">
            NovaSlate
          </span>
        </a>
      </div>
      <nav className="s__nav">




                <ul className="s__menu">
                      {siteContent.header.links.map((link) => (
                        <li key={link.label} className="s__menu-item s__menu-item--link">
                          <a href={link.href} className="btn-main btn-main--secondary btn-main--black btn-main--md s__menu-link">
                            <span className="btn-main__outer">
                              <span className="btn-main__inner">
                                <span className="btn-main__text">{link.label}</span>
                              </span>
                              <span className="btn-main__hover" aria-hidden="true">
                                <span className="btn-main__text" data-text={link.label}></span>
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}

                      {isLoggedIn ? (
                        <li className="s__menu-item s__menu-item--link">
                          <button
                            type="button"
                            onClick={onNavigateToDashboard}
                            className="btn-main btn-main--secondary btn-main--black btn-main--md s__menu-link"
                          >
                            <span className="btn-main__outer">
                              <span className="btn-main__inner">
                                <span className="btn-main__text">Dashboard</span>
                              </span>
                              <span className="btn-main__hover" aria-hidden="true">
                                <span className="btn-main__text" data-text="Dashboard"></span>
                              </span>
                            </span>
                          </button>
                        </li>
                      ) : onNavigateToLogin ? (
                        <li className="s__menu-item s__menu-item--link">
                          <button
                            type="button"
                            onClick={onNavigateToLogin}
                            className="btn-main btn-main--secondary btn-main--black btn-main--md s__menu-link"
                          >
                            <span className="btn-main__outer">
                              <span className="btn-main__inner">
                                <span className="btn-main__text">Sign In</span>
                              </span>
                              <span className="btn-main__hover" aria-hidden="true">
                                <span className="btn-main__text" data-text="Sign In"></span>
                              </span>
                            </span>
                          </button>
                        </li>
                      ) : null}

                      <li className="s__menu-item s__menu-item--cta">
                        <button
                          type="button"
                          onClick={onOpenContact}
                          className="btn-main btn-main--primary btn-main--black btn-main--md s__menu-link s__menu-link--cta"
                        >
                          <span className="btn-main__outer">
                            <span className="btn-main__inner">
                              <span className="btn-main__text">{siteContent.header.cta}</span>
                            </span>
                            <span className="btn-main__hover" aria-hidden="true">
                              <span className="btn-main__text" data-text={siteContent.header.cta}></span>
                            </span>
                          </span>
                        </button>
                      </li>
                    </ul>




      </nav>
    </header>
  );
};
