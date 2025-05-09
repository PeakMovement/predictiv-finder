
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { AIHealthPlan } from '@/types';

interface ServiceComparisonChartProps {
  plans: AIHealthPlan[];
  categories: string[];
}

const ServiceComparisonChart: React.FC<ServiceComparisonChartProps> = ({ plans, categories }) => {
  // Prepare data for the chart
  const chartData = categories.map(category => {
    const dataPoint: any = {
      name: category.replace('-', ' ')
    };
    
    // Add data for each plan
    plans.forEach(plan => {
      const service = plan.services.find(s => s.type === category);
      dataPoint[plan.name] = service ? service.price : 0;
    });
    
    return dataPoint;
  });
  
  // Generate unique colors for each plan
  const colors = [
    '#8B5CF6', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#3B82F6', // Blue
  ];
  
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 40,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 'dataMax + 100']} label={{ value: 'Cost per Session (R)', position: 'insideBottom', offset: -5 }} />
          <YAxis dataKey="name" type="category" width={120} />
          <Tooltip 
            formatter={(value: number, name: string) => [`R${value}`, name]}
            labelFormatter={(label) => `Service: ${label}`}
          />
          <Legend />
          {plans.map((plan, index) => (
            <Bar 
              key={plan.id}
              dataKey={plan.name} 
              fill={colors[index % colors.length]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServiceComparisonChart;
