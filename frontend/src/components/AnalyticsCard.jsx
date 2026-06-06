import { TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsCard({ title, value, icon: Icon, trend, color }) {
  const accentColor = color || 'bg-brand-500';
  const iconBg = color ? color.replace('bg-', 'bg-') + '/10' : 'bg-brand-50';

  return (
    <div className="glass-card rounded-xl p-5 relative overflow-hidden group hover:translate-y-[-2px] transition-all duration-300">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor} rounded-l-xl`} />

      <div className="flex items-start justify-between">
        <div className="pl-3">
          <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{title}</p>

          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
              trend.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
            }`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${iconBg} dark:bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${accentColor.replace('bg-', 'text-')}`} />
          </div>
        )}
      </div>
    </div>
  );
}
