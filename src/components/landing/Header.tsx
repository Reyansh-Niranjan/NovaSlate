import React from 'react';

interface HeaderProps {
  onOpenContact: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToDashboard?: () => void;
  isLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
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
          <li className="s__menu-item s__menu-item--cta">
            <button
              type="button"
              onClick={isLoggedIn ? onNavigateToDashboard : (onNavigateToLogin || (() => { window.location.href = '/login'; }))}
              className="btn-main btn-main--primary btn-main--black btn-main--md s__menu-link s__menu-link--cta"
            >
              <span className="btn-main__outer">
                <span className="btn-main__inner">
                  <span className="btn-main__text">{isLoggedIn ? "Dashboard" : "Get Started"}</span>
                </span>
                <span className="btn-main__hover" aria-hidden="true">
                  <span className="btn-main__text" data-text={isLoggedIn ? "Dashboard" : "Get Started"}></span>
                </span>
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};
