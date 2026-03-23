import { MoreHorizontal } from "lucide-react";

interface TableRowProps {
  date: string;
  type: string;
  icon: React.ReactNode;
  id: string;
  weight: string;
  price: string;
  status: 'Completed' | 'Processing' | 'Pending';
}

export const TableRow: React.FC<TableRowProps | any> = ({ date, type, icon, id, weight, price, status }) => {
  const getStatusStyle = (s: string) => {
    switch(s) {
      case 'SOLD': return 'bg-green-100 text-green-700'; 
      case 'PUBLISHED': return 'bg-blue-100 text-blue-700'; 
      case 'RESERVED': return 'bg-orange-100 text-orange-700';
      case 'DRAFT': return 'bg-gray-100 text-gray-600'; 
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">{date}</td>
      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3 font-medium text-gray-900">
        {icon}
        {type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-400">{id}</td>
      <td className="px-6 py-4 whitespace-nowrap font-mono">{weight}</td>
      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{price}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <MoreHorizontal size={20} />
        </button>
      </td>
    </tr>
  );
};