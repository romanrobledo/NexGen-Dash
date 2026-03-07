export const BUCKETS = [
  { key: 'trust', label: 'Trust', color: '#3B82F6', description: 'Building trust & environment' },
  { key: 'learning', label: 'Learning', color: '#22C55E', description: 'Curriculum & development' },
  { key: 'joy', label: 'Joy', color: '#EAB308', description: 'Fun & play moments' },
  { key: 'enrollment', label: 'Enrollment', color: '#F97316', description: 'Marketing & enrollment-focused' },
  { key: 'culture', label: 'Culture', color: '#8B5CF6', description: 'School traditions & celebrations' },
]

export const TIME_BLOCKS = [
  {
    key: 'am',
    label: 'AM Block',
    time: '8:00 – 10:00',
    items: [
      { key: 'arrival', label: 'Arrival' },
      { key: 'circle_time', label: 'Circle Time' },
      { key: 'uniform_check', label: 'Uniform Check' },
    ],
  },
  {
    key: 'midday',
    label: 'Midday Block',
    time: '10:00 – 11:30',
    items: [
      { key: 'curriculum', label: 'Curriculum' },
      { key: 'sensory', label: 'Sensory' },
      { key: 'fine_motor', label: 'Fine Motor' },
    ],
  },
  {
    key: 'pm',
    label: 'PM Block',
    time: '2:30 – 4:30',
    items: [
      { key: 'outdoor', label: 'Outdoor' },
      { key: 'snack', label: 'Snack' },
      { key: 'afterschool', label: 'Afterschool' },
    ],
  },
]

export const PHOTO_TARGET = 20
export const VIDEO_TARGET = 12

export const DEFAULT_CHECKLIST = {
  am: { arrival: false, circle_time: false, uniform_check: false },
  midday: { curriculum: false, sensory: false, fine_motor: false },
  pm: { outdoor: false, snack: false, afterschool: false },
}
