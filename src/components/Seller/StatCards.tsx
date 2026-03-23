interface StatCardProps {
  icon: React.ReactNode;
  bg: string;
  title: string;
  value: string;
  trend: string;
  positive: boolean | null;
}


export const StatCard: React.FC<StatCardProps> = ({ icon, bg, title, value, trend, positive }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
    <div className="flex justify-between items-start z-10 relative">
      <div className={`p-3 rounded-xl ${bg}`}>
        {icon}
      </div>
      {/* <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${positive === true ? 'bg-green-100 text-green-700' : positive === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
        {positive === true && <TrendingUp size={12} />}
        {positive === false && <TrendingDown size={12} />}
        {trend}
      </div> */}
    </div>
    <div className="mt-4 z-10 relative">
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);