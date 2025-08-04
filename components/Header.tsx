
import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="h-20 bg-secondary flex items-center justify-between px-6 md:px-8 border-b border-primary">
      <h2 className="text-2xl font-bold text-light animate-fade-in-down">{title}</h2>
      <div>
        <input
          type="text"
          placeholder="Cari..."
          className="hidden md:block w-64 px-4 py-2 rounded-lg bg-primary text-light focus:outline-none focus:ring-2 focus:ring-accent animate-fade-in-down"
          style={{ animationDelay: '100ms' }}
        />
      </div>
    </header>
  );
};

export default Header;