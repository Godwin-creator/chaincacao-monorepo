// Gradient stable basé sur le hash djb2 du nom — même nom = même couleur
function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) ^ str.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}

const GRADIENTS = [
  ['#1A4A5A', '#2196C7'],
  ['#2D5016', '#4FC3E8'],
  ['#5D3A1F', '#D4A574'],
  ['#1A4A5A', '#4A6B2A'],
  ['#2196C7', '#4A6B2A'],
  ['#5D3A1F', '#4FC3E8'],
  ['#2D5016', '#2196C7'],
  ['#1A4A5A', '#E8B547'],
];

function getInitials(name) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const SIZE_MAP = {
  sm: 'w-10 h-10 text-sm rounded-xl',
  md: 'w-16 h-16 text-lg rounded-2xl',
  lg: 'w-20 h-20 text-xl rounded-2xl',
  xl: 'w-24 h-24 text-2xl rounded-3xl',
};

/**
 * Props:
 *   name – prénom + nom complet (ex: "EDOH BEDI Komi Godwin")
 *   size – 'sm' | 'md' | 'lg' | 'xl'  (default: 'md')
 */
export default function TeamAvatar({ name, size = 'md' }) {
  const hash = hashStr(name);
  const [from, to] = GRADIENTS[hash % GRADIENTS.length];
  const initials = getInitials(name);
  const sizeClass = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <div
      className={`${sizeClass} flex items-center justify-center font-bold text-white font-sans flex-shrink-0 shadow-md select-none`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-label={`Avatar de ${name}`}
    >
      {initials}
    </div>
  );
}
