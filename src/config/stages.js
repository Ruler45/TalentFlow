export const RECRUITMENT_STAGES = [
  {
    id: 'applied',
    label: 'Applied',
    description: 'New applications',
    color: 'gray',
    icon: '📝'
  },
  {
    id: 'screen',
    label: 'Screening',
    description: 'Initial review',
    color: 'blue',
    icon: '👀'
  },
  {
    id: 'interview',
    label: 'Interview',
    description: 'In interview process',
    color: 'indigo',
    icon: '🗣️'
  },
  {
    id: 'tech',
    label: 'Technical',
    description: 'Technical assessment',
    color: 'purple',
    icon: '💻'
  },
  {
    id: 'offer',
    label: 'Offer',
    description: 'Offer extended',
    color: 'yellow',
    icon: '📨'
  },
  {
    id: 'hired',
    label: 'Hired',
    description: 'Successfully hired',
    color: 'green',
    icon: '🎉'
  },
  {
    id: 'rejected',
    label: 'Rejected',
    description: 'Not moving forward',
    color: 'red',
    icon: '✖️'
  }
];

// Helper functions for stage operations
export const getStageById = (stageId) => 
  RECRUITMENT_STAGES.find(stage => stage.id === stageId);

export const getStageColor = (stageId) => 
  getStageById(stageId)?.color || 'gray';

export const getStageLabel = (stageId) =>
  getStageById(stageId)?.label || 'Unknown';

export const getAllStageIds = () =>
  RECRUITMENT_STAGES.map(stage => stage.id);

export const isValidStage = (stageId) =>
  RECRUITMENT_STAGES.some(stage => stage.id === stageId);