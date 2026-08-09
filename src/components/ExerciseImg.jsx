/** Renders the generated illustration for an exercise (or any image). */
export default function ExerciseImg({ src, alt = '', className = '', breathe = false, eager = false }) {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${breathe ? 'limber-breathe' : ''} ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        className="h-full w-full object-cover"
        draggable={false}
      />
    </div>
  );
}
