'use client';

interface ProgressBarProps {
  stage: string | null;
  totalStages: number;
  stageNames: { [key: string]: string };
}

const stageOrder: { [key: string]: number } = {
  extracting: 1,
  generating: 2,
  done: 3,
};

export default function ProgressBar({ stage, totalStages, stageNames }: ProgressBarProps) {
  if (!stage) return null;

  const currentStageNumber = stageOrder[stage] || 0;
  const progressPercentage = Math.min(100, Math.max(0, (currentStageNumber / totalStages) * 100));
  const stageText = stageNames[stage] || 'Processing...';

  return (
    <div className="w-full max-w-xl mx-auto my-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{stageText}</span>
        <span className="text-sm font-medium text-gray-700">
          Step {currentStageNumber} of {totalStages}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        >
        </div>
      </div>
    </div>
  );
} 