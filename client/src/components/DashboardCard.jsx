import React, { useState } from 'react';
import '../styles/interactivity.css';
import { Icon } from './Icons';

/**
 * DashboardCard component
 * A stylish, interactive card for displaying financial data and insights
 */
const DashboardCard = ({
  title,
  value,
  description,
  change,
  changeTimeframe = 'since last month',
  icon,
  color = 'blue',
  showExpand = true,
  children = null
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Define color classes based on prop
  const colorClasses = {
    blue: 'from-indigo-400 to-sky-400',
    green: 'from-emerald-400 to-teal-500',
    purple: 'from-violet-400 to-indigo-500',
    amber: 'from-amber-400 to-orange-500',
    rose: 'from-rose-400 to-pink-500',
  };
  
  const bgGradient = colorClasses[color] || colorClasses.blue;
  const isPositive = change > 0;
  
  return (
    <div className={`card-3d relative overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 ${isExpanded ? 'h-auto' : 'h-[180px]'}`}>
      {/* Header with gradient background */}
      <div className={`bg-gradient-to-r ${bgGradient} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="rounded-full bg-white/20 p-1.5">
            {icon || <Icon name="chartBar" className="h-4 w-4" />}
          </div>
        </div>
        
        {/* Main value */}
        <div className="mt-4 text-2xl font-bold">{value}</div>
        
        {/* Change indicator */}
        {change !== undefined && (
          <div className="mt-1 flex items-center text-xs">
            <span className={`mr-1 ${isPositive ? 'text-white' : 'text-white/90'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-white/80">{changeTimeframe}</span>
          </div>
        )}
      </div>
      
      {/* Card body */}
      <div className="p-4">
        <p className="text-sm text-slate-600">{description}</p>
        
        {/* Expandable content */}
        {children && (
          <div className={`mt-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
            {children}
          </div>
        )}
      </div>
      
      {/* Expand button */}
      {showExpand && children && (
        <button 
          className="btn-interactive absolute bottom-2 right-2 rounded-full border border-slate-100 bg-white p-1.5 shadow-sm hover:bg-slate-50"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Show less' : 'Show more'}
        >
          <Icon name={isExpanded ? 'chevronUp' : 'chevronDown'} className="h-4 w-4 text-slate-400" />
        </button>
      )}
    </div>
  );
};

export default DashboardCard;