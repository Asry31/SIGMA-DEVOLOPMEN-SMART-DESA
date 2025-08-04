
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  return (
    <div className="bg-secondary rounded-xl p-6 flex items-center space-x-6 shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300">
      <div className={`p-4 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-medium text-sm font-semibold">{title}</p>
        <p className="text-2xl font-bold text-light">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;