import React, { useMemo } from 'react';

interface MaterialMixChartProps {
  posts: any[];
  isLoading: boolean;
  totalWeight: number;
}

const MaterialMixChart: React.FC<MaterialMixChartProps> = ({ posts, isLoading, totalWeight }) => {
  
  const materialMix = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    let categoryWeights: Record<string, number> = {};
    let calculatedTotalWeight = 0;

    posts.forEach((post: any) => {
      const weight = parseFloat(post.quantity || "0");
      if (weight > 0 && post.status !== "DRAFT" && post.status !== "REJECTED") { 
        
        let catName = "Autre";
        if (post.category?.label) {
            catName = post.category.label;
        } else if (post.category?.name) {
            catName = post.category.name;
        } else if (post.title) {
            catName = post.title.split(' ')[0]; 
        }

        categoryWeights[catName] = (categoryWeights[catName] || 0) + weight;
        calculatedTotalWeight += weight;
      }
    });

    const palette = [
      { text: 'text-green-500', bg: 'bg-green-500' },
      { text: 'text-blue-500', bg: 'bg-blue-500' },
      { text: 'text-yellow-400', bg: 'bg-yellow-400' },
      { text: 'text-orange-500', bg: 'bg-orange-500' },
      { text: 'text-purple-500', bg: 'bg-purple-500' }
    ];

    let currentOffset = 0;
    
    return Object.entries(categoryWeights)
      .sort((a, b) => b[1] - a[1]) 
      .map(([label, weight], index) => {
        const percentage = calculatedTotalWeight > 0 ? (weight / calculatedTotalWeight) * 100 : 0;
        const offset = currentOffset;
        currentOffset -= percentage;

        return {
          label,
          weight,
          percentage,
          offset,
          color: palette[index % palette.length]
        };
      });
  }, [posts]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
      <h3 className="font-bold text-gray-900">Material Mix</h3>
      <p className="text-sm text-gray-500 mb-6">Distribution by weight</p>
      
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {isLoading || materialMix.length === 0 ? (
              <path
                className="text-gray-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            ) : (
              materialMix.map((item, index) => (
                <path
                  key={index}
                  className={item.color.text}
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeDasharray={`${item.percentage} 100`}
                  strokeDashoffset={item.offset}
                />
              ))
            )}
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-400">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : `${(totalWeight || 0).toFixed(1)}kg`}
            </span>
          </div>
        </div>

        <div className="flex justify-center flex-wrap gap-4 w-full mt-6 text-sm">
          {!isLoading && materialMix.length > 0 ? (
            materialMix.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="flex items-center gap-1 font-semibold text-gray-700">
                  <div className={`w-2 h-2 rounded-full ${item.color.bg}`}></div>
                  {item.label}
                </span>
                <span className="text-gray-500">{item.percentage.toFixed(1)}%</span>
              </div>
            ))
          ) : (
            <span className="text-gray-400 italic">No materials yet</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialMixChart;