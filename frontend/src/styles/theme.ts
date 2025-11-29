// Centralized theme configuration for consistent UI across all pages
export const theme = {
  // Page backgrounds
  page: 'min-h-screen bg-slate-900 p-6',
  
  // Card styles
  card: 'bg-slate-800 border border-slate-700',
  cardHeader: 'bg-slate-800 border-b border-slate-700',
  cardContent: 'p-6',
  
  // Text colors
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-blue-400'
  },
  
  // Input styles
  input: 'bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-blue-500',
  
  // Button styles
  button: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600',
    outline: 'border border-slate-600 bg-slate-700 text-white hover:bg-slate-600'
  },
  
  // Table styles
  table: {
    header: 'bg-slate-900',
    row: 'hover:bg-slate-700',
    cell: 'text-gray-300'
  },
  
  // Modal styles
  modal: {
    overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
    content: 'bg-slate-800 p-6 rounded-lg border border-slate-700'
  },
  
  // Stats card styles
  statsCard: 'bg-slate-800 p-6 rounded-lg border border-slate-700',
  
  // Search input
  searchInput: 'w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
};

// Utility function to combine theme classes
export const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};