import { Transform } from 'class-transformer';

export function DefaultNull() {
  return Transform(({ value }) => (value !== undefined ? value : null));
}
