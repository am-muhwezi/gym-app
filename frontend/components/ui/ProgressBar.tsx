import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  label,
  showPercentage = true,
  color = 'primary',
  className = '',
}) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  const colorStyles = {
    primary: 'bg-brand-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm font-semibold text-white">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${colorStyles[color]} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {current !== undefined && target !== undefined && (
        <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
          <span>Current: {current}</span>
          <span>Target: {target}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
