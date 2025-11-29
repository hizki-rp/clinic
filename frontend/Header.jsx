import React from 'react';

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-white border-b-2 border-gray-200">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      <div className="flex items-center">
        <span className="text-gray-600">John Doe</span>
        <img className="h-8 w-8 rounded-full ml-2" src="https://via.placeholder.com/150" alt="User" />
      </div>
    </header>
  );
};

export default Header;