
import React from 'react';
import { motion } from 'framer-motion';

interface TimelineItem {
  week: number;
  milestone: string;
  focus: string;
}

interface PlanTimelineViewProps {
  timeline: TimelineItem[];
  totalWeeks: number;
}

const PlanTimelineView: React.FC<PlanTimelineViewProps> = ({ timeline, totalWeeks }) => {
  // Sort by week
  const sortedTimeline = [...timeline].sort((a, b) => a.week - b.week);
  
  return (
    <div className="relative pb-10">
      {/* Timeline line */}
      <div className="absolute left-4 top-3 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
      
      {/* Week numbers at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Week 1</span>
          <span className="text-xs text-gray-500">Week {Math.floor(totalWeeks / 2)}</span>
          <span className="text-xs text-gray-500">Week {totalWeeks}</span>
        </div>
        <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-1"></div>
      </div>
      
      {/* Timeline events */}
      <div className="space-y-5">
        {sortedTimeline.map((item, index) => {
          // Calculate position as percentage of total timeline
          const position = (item.week / totalWeeks) * 100;
          
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start relative"
              style={{ marginLeft: `${position}%`, maxWidth: '85%' }}
            >
              {/* Timeline dot */}
              <div className="absolute -left-4 w-3 h-3 bg-health-purple rounded-full border-2 border-white dark:border-gray-900"></div>
              
              {/* Content */}
              <div className="ml-4">
                <div className="flex items-baseline">
                  <span className="text-health-purple font-medium text-sm">Week {item.week}</span>
                  <span className="ml-2 text-sm font-medium">{item.milestone}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.focus}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanTimelineView;
