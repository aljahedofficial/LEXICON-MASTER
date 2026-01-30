// Theme configurations: 20 professional, minimal, modern themes
export interface ThemeConfig {
  id: string
  name: string
  background: string
  font: string
  category: 'classic' | 'grey' | 'blue' | 'paper' | 'lowlight'
}

export const THEMES: ThemeConfig[] = [
  // Classic & High-Contrast
  {
    id: 'pure-white-editorial',
    name: 'Pure White Editorial',
    background: '#FFFFFF',
    font: '#111111',
    category: 'classic',
  },
  {
    id: 'soft-black-inverse',
    name: 'Soft Black Inverse',
    background: '#0F0F0F',
    font: '#F5F5F5',
    category: 'classic',
  },
  {
    id: 'charcoal-minimal',
    name: 'Charcoal Minimal',
    background: '#1C1F24',
    font: '#E6E6E6',
    category: 'classic',
  },
  {
    id: 'graphite-grey',
    name: 'Graphite Grey',
    background: '#2A2A2A',
    font: '#EDEDED',
    category: 'classic',
  },

  // Grey-Based (Neutral & Modern)
  {
    id: 'light-slate',
    name: 'Light Slate',
    background: '#F4F6F8',
    font: '#1E2933',
    category: 'grey',
  },
  {
    id: 'mist-grey',
    name: 'Mist Grey',
    background: '#ECEFF1',
    font: '#263238',
    category: 'grey',
  },
  {
    id: 'cement-grey',
    name: 'Cement Grey',
    background: '#DADDE1',
    font: '#1F2937',
    category: 'grey',
  },
  {
    id: 'iron-grey-dark',
    name: 'Iron Grey Dark',
    background: '#202427',
    font: '#D1D5DB',
    category: 'grey',
  },

  // Blue-Based (Academic & Tech)
  {
    id: 'navy-authority',
    name: 'Navy Authority',
    background: '#0B1C2D',
    font: '#EAF2F8',
    category: 'blue',
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    background: '#0A192F',
    font: '#CCD6F6',
    category: 'blue',
  },
  {
    id: 'slate-blue',
    name: 'Slate Blue',
    background: '#E8EDF3',
    font: '#1F2A44',
    category: 'blue',
  },
  {
    id: 'steel-blue-dark',
    name: 'Steel Blue Dark',
    background: '#1E2A38',
    font: '#E5ECF3',
    category: 'blue',
  },

  // Paper-Like / Eye-Friendly
  {
    id: 'warm-paper',
    name: 'Warm Paper',
    background: '#FAF7F2',
    font: '#2B2B2B',
    category: 'paper',
  },
  {
    id: 'light-beige',
    name: 'Light Beige',
    background: '#F5F1E8',
    font: '#2A2A2A',
    category: 'paper',
  },
  {
    id: 'soft-ivory',
    name: 'Soft Ivory',
    background: '#FFFDF8',
    font: '#1A1A1A',
    category: 'paper',
  },
  {
    id: 'sepia-modern',
    name: 'Sepia Modern',
    background: '#F3EAD9',
    font: '#3B2F2F',
    category: 'paper',
  },

  // Low-Light & Focus Themes
  {
    id: 'charcoal-soft-yellow',
    name: 'Charcoal + Soft Yellow',
    background: '#1F2933',
    font: '#FDE68A',
    category: 'lowlight',
  },
  {
    id: 'dark-brown',
    name: 'Dark Brown',
    background: '#2B2118',
    font: '#F5E6D3',
    category: 'lowlight',
  },
  {
    id: 'deep-green',
    name: 'Deep Green',
    background: '#0F2A1D',
    font: '#D1FAE5',
    category: 'lowlight',
  },
  {
    id: 'olive-grey',
    name: 'Olive Grey',
    background: '#2C2F2A',
    font: '#E7EAE5',
    category: 'lowlight',
  },
]

export const DEFAULT_THEME = THEMES[0] // Pure White Editorial
