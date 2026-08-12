/**
 * Join class names, dropping anything falsy.
 * Lets components write `cx('base', isActive && 'active', className)`.
 */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ')
}
