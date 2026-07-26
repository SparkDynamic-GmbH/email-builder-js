import clsx, { ClassValue } from 'clsx';

export default function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
