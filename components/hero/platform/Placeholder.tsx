// What the frame shows until the scene can draw: the outline of the sheet, drawn as a
// plan would be, with its three lanes, repeating quietly. It is the same idea the scene
// opens with, so the hand-over from this to the real plan reads as one motion. Plain
// SVG and CSS, so it costs nothing and is on screen before any script runs.
export function Placeholder() {
  return (
    <div className="platform-placeholder" aria-hidden="true">
      <svg viewBox="0 0 400 300" fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
        <path className="platform-placeholderSheet" pathLength={1} d="M78 118 L296 72 L342 196 L96 246 Z" />
        <g className="platform-placeholderLanes" pathLength={1}>
          <path pathLength={1} d="M132 107 L180 220" />
          <path pathLength={1} d="M187 95 L236 208" />
          <path pathLength={1} d="M242 84 L292 196" />
        </g>
      </svg>
      <span className="platform-placeholderCaption">Drawing the plan</span>
    </div>
  );
}
