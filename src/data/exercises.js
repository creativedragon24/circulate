// Limber — in-flight stretching.
// Every move is designed to be done seated in an airplane seat.
// Images: AI-generated flat illustrations (public/exercises/*.webp).

export const CATEGORIES = [
  { id: 'neck',      label: 'Neck',      emoji: '🙆', color: '#5B9BFF', soft: '#E6F0FF' },
  { id: 'shoulders', label: 'Shoulders', emoji: '🙌', color: '#FFB84D', soft: '#FFF3DF' },
  { id: 'back',      label: 'Back',      emoji: '🧘', color: '#7B61FF', soft: '#EDE9FF' },
  { id: 'legs',      label: 'Legs',      emoji: '🦵', color: '#2EC4B6', soft: '#DFF7F4' },
  { id: 'wrists',    label: 'Wrists',    emoji: '✍️', color: '#FF6B5B', soft: '#FFE9E4' },
];

export const EXERCISES = [
  {
    id: 'neck-stretch', name: 'Neck Stretch', cat: 'neck', diff: 1, hold: 30, side: 'both',
    img: 'exercises/neck-stretch.webp',
    blurb: 'Ear to shoulder. The classic mid-flight neck rescue.',
    gentle: 'No pulling — let gravity do the leaning.',
    tips: ['Keep the opposite shoulder down.', 'Breathe out as you lean in.'],
  },
  {
    id: 'shoulder-rolls', name: 'Shoulder Rolls', cat: 'shoulders', diff: 1, hold: 15, side: 'repeat',
    img: 'exercises/shoulder-rolls.webp',
    blurb: 'Roll the flight off your shoulders. Literally.',
    gentle: 'Smaller circles. Still circles.',
    tips: ['Up, back, down — never forward.', 'One breath per roll.'],
  },
  {
    id: 'arm-reach', name: 'Sky Reach', cat: 'shoulders', diff: 1, hold: 20, side: 'repeat',
    img: 'exercises/arm-reach.webp',
    blurb: 'Reach for the overhead bin. Minus the bin.',
    gentle: 'Bend the elbows a little if the shoulders say no.',
    tips: ['Stretch tall from the hips first.', 'Palms to the ceiling, fingers laced.'],
  },
  {
    id: 'spinal-twist', name: 'Window Twist', cat: 'back', diff: 2, hold: 40, side: 'both',
    img: 'exercises/spinal-twist.webp',
    blurb: 'Twist toward the window. Wave at the clouds.',
    gentle: 'Twist only as far as the seatbelt allows.',
    tips: ['Sit tall, then twist from the ribs.', 'Hands on the armrests for leverage.'],
  },
  {
    id: 'wrist-stretch', name: 'Wrist Stretch', cat: 'wrists', diff: 1, hold: 30, side: 'both',
    img: 'exercises/wrist-stretch.webp',
    blurb: 'For the thumbs that typed the whole flight.',
    gentle: 'Pull with the fingers only, wrist relaxed.',
    tips: ['Arm straight, palm up.', 'The stretch lives in the forearm.'],
  },
  {
    id: 'ankle-circles', name: 'Ankle Circles', cat: 'legs', diff: 1, hold: 20, side: 'repeat',
    img: 'exercises/ankle-circles.webp',
    blurb: 'Circle the feet, confuse the swelling.',
    gentle: 'Slow, small circles — the size of a coin.',
    tips: ['Lift the foot slightly off the floor.', 'Both directions, both feet.'],
  },
  {
    id: 'knee-hug', name: 'Knee Hug', cat: 'legs', diff: 1, hold: 30, side: 'both',
    img: 'exercises/knee-hug.webp',
    blurb: 'One knee up, both arms in. Gentle hug, real relief.',
    gentle: 'No need to reach the chest — every inch counts.',
    tips: ['Keep the other foot flat on the floor.', 'Rock side to side for bonus points.'],
  },
  {
    id: 'hamstring', name: 'Seated Fold', cat: 'legs', diff: 2, hold: 40, side: 'both',
    img: 'exercises/hamstring.webp',
    blurb: 'Leg out, lean forward. Looks like tying a shoe. Feels like a holiday.',
    gentle: 'Bend the knee a little — heels can stay down.',
    tips: ['Flat back, chest toward the knee.', 'Toes up toward the ceiling.'],
  },
  {
    id: 'chest-open', name: 'Chest Opener', cat: 'back', diff: 2, hold: 30, side: 'static',
    img: 'exercises/chest-open.webp',
    blurb: 'Hands behind the back, chest to the window.',
    gentle: 'Hold a scarf between the hands if they won’t meet.',
    tips: ['Shoulders roll back and down first.', 'Look slightly up, breathe in deep.'],
  },
];

export const SESSIONS = [
  {
    id: 'inflight', name: 'In-Flight Reset', emoji: '🛫', minutes: 5, vibe: 'The full pre-landing refresh.',
    items: [
      ['neck-stretch', 30], ['shoulder-rolls', 15], ['arm-reach', 20], ['spinal-twist', 40],
      ['wrist-stretch', 30], ['ankle-circles', 20], ['knee-hug', 30], ['chest-open', 30],
    ],
  },
  {
    id: 'quick', name: 'Quick Deplane', emoji: '⚡', minutes: 2, vibe: 'For when the seatbelt sign is about to ding.',
    items: [
      ['shoulder-rolls', 15], ['wrist-stretch', 30], ['ankle-circles', 20], ['neck-stretch', 30],
    ],
  },
  {
    id: 'glow', name: 'Landing Glow', emoji: '✨', minutes: 8, vibe: 'Arrive less crunchy. All nine moves.',
    items: EXERCISES.map(e => [e.id, e.hold]),
  },
];

export const ex = id => EXERCISES.find(e => e.id === id);
export const catOf = id => CATEGORIES.find(c => c.id === ex(id).cat);
