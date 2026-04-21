import { MoreHorizontal, Calendar, Package, Tag, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface TableRowProps {
  date: string;
  type: string;
  icon: React.ReactNode;
  id: string;
  weight: string;
  price: string;
  status: 'SOLD' | 'PUBLISHED' | 'RESERVED' | 'DRAFT' | 'REJECTED';
}

export const TableRow: React.FC<TableRowProps | any> = ({ date, type, icon, id, weight, price, status }) => {
  const getStatusConfig = (s: string) => {
    switch(s) {
      case 'SOLD': 
        return { 
          style: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
          icon: <CheckCircle2 size={12} />, 
          label: 'Sold' 
        }; 
      case 'PUBLISHED': 
        return { 
          style: 'bg-blue-50 text-blue-700 border-blue-100', 
          icon: <Clock size={12} />, 
          label: 'Live' 
        }; 
      case 'RESERVED': 
        return { 
          style: 'bg-orange-50 text-orange-700 border-orange-100', 
          icon: <Tag size={12} />, 
          label: 'Reserved' 
        };
      case 'DRAFT': 
        return { 
          style: 'bg-gray-50 text-gray-500 border-gray-100', 
          icon: <Clock size={12} />, 
          label: 'Draft' 
        }; 
      case 'REJECTED': 
        return { 
          style: 'bg-red-50 text-red-700 border-red-100', 
          icon: <AlertCircle size={12} />, 
          label: 'Rejected' 
        };
      default: 
        return { 
          style: 'bg-gray-50 text-gray-500 border-gray-100', 
          icon: <Clock size={12} />, 
          label: s 
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <tr className="group hover:bg-emerald-50/30 transition-all duration-300 border-b border-gray-50 last:border-0">
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-tighter">
          <Calendar size={14} className="opacity-40" />
          {date}
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <span className="font-bold text-gray-900 tracking-tight">{type}</span>
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{id}</span>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <div className="flex items-center gap-2 text-gray-600 font-mono text-sm font-bold">
          <Package size={14} className="text-gray-300" />
          {weight}
        </div>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <span className="text-sm font-black text-gray-900 tracking-tight">{price}</span>
      </td>
      <td className="px-6 py-5 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded-xl border shadow-sm uppercase tracking-wider transition-all duration-300 ${config.style}`}>
          {config.icon}
          {config.label}
        </span>
      </td>
      <td className="px-6 py-5 whitespace-nowrap text-right">
        <button className="p-2 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
          <MoreHorizontal size={20} />
        </button>
      </td>
    </tr>
  );
};