import { useRef } from 'react';

/**
 * A number that changes whenever `value` is replaced by anything other than the
 * caller's own last write.
 *
 * The inspector panels are uncontrolled: every input takes a `defaultValue` and
 * then keeps its own state, so a document change made from outside the panel —
 * applying a style preset, an undo — never reaches the fields, and the panel
 * goes on showing the values it was mounted with. Keying the panel on this
 * remounts it exactly then, and never while the user is dragging one of its own
 * sliders, which a key over the data itself would do on every tick.
 *
 * Pass whatever the panel writes to `markOwnWrite`; `setDocument` merges
 * shallowly, so the object identity that comes back is the one that went in.
 */
export default function useExternalRevision(value: unknown): [number, (own: unknown) => void] {
  const seen = useRef(value);
  const revision = useRef(0);

  if (value !== seen.current) {
    revision.current += 1;
    seen.current = value;
  }

  return [
    revision.current,
    (own: unknown) => {
      seen.current = own;
    },
  ];
}
