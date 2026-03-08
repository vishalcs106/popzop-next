'use client';

import { ThemePreset, THEME_CONFIGS } from '@/types';
import { cn } from '@/utils/helpers';
import { Check } from 'lucide-react';

interface ThemePickerProps {
  value: ThemePreset;
  onChange: (theme: ThemePreset) => void;
}

const THEME_GROUPS: {
  label: string;
  emoji: string;
  themes: { id: ThemePreset; name: string }[];
}[] = [
  {
    label: 'Classic',
    emoji: '✦',
    themes: [
      { id: 'minimal', name: 'Minimal' },
      { id: 'boutique', name: 'Boutique' },
      { id: 'bold', name: 'Bold' },
      { id: 'pop', name: 'Pop' },
      { id: 'sakura', name: 'Sakura' },
    ],
  },
  {
    label: 'Dark',
    emoji: '🌑',
    themes: [
      { id: 'neon', name: 'Neon' },
      { id: 'midnight', name: 'Midnight' },
      { id: 'cyberpunk', name: 'Cyberpunk' },
    ],
  },
  {
    label: 'Seasonal',
    emoji: '🎉',
    themes: [
      { id: 'summer', name: 'Summer' },
      { id: 'halloween', name: 'Halloween' },
      { id: 'christmas', name: 'Christmas' },
      { id: 'diwali', name: 'Diwali' },
      { id: 'holi', name: 'Holi' },
    ],
  },
];

function ThemeCard({
  id,
  name,
  selected,
  onClick,
}: {
  id: ThemePreset;
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  const cfg = THEME_CONFIGS[id];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all text-left group',
        selected
          ? 'border-gray-900 shadow-lg scale-[1.02]'
          : 'border-gray-150 hover:border-gray-300 hover:shadow-md'
      )}
    >
      {/* Color swatch bar */}
      <div
        className="h-14 w-full flex items-end pb-2 px-2.5 gap-1.5"
        style={{ backgroundColor: cfg.background }}
      >
        {/* Mini product card mockups */}
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex-1 h-8 flex flex-col overflow-hidden"
            style={{
              backgroundColor: cfg.surface,
              borderRadius: `calc(${cfg.radius} * 0.6)`,
              border: cfg.cardStyle === 'outline' || cfg.cardStyle === 'flat'
                ? `1px solid ${cfg.border}`
                : undefined,
              boxShadow: cfg.cardStyle === 'elevated'
                ? '0 1px 4px rgba(0,0,0,0.1)'
                : undefined,
            }}
          >
            <div
              className="flex-1"
              style={{ backgroundColor: cfg.background, opacity: 0.6 }}
            />
            <div className="px-1 py-0.5">
              <div
                className="w-full h-1 rounded-full mb-0.5"
                style={{ backgroundColor: cfg.text, opacity: 0.5 }}
              />
              <div
                className="w-2/3 h-1 rounded-full"
                style={{ backgroundColor: cfg.primary, opacity: 0.9 }}
              />
            </div>
          </div>
        ))}
        {/* CTA button mockup */}
        <div
          className="h-5 px-2 flex items-center justify-center self-end mb-0.5"
          style={{
            backgroundColor: cfg.primary,
            borderRadius: `calc(${cfg.radius} * 0.5)`,
          }}
        >
          <div className="w-4 h-1 rounded-full" style={{ backgroundColor: cfg.primaryFg, opacity: 0.9 }} />
        </div>
      </div>

      {/* Color palette strip */}
      <div className="flex h-2">
        {[cfg.primary, cfg.background, cfg.surface, cfg.muted].map((color, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: color }} />
        ))}
      </div>

      {/* Label */}
      <div
        className="px-3 py-2.5"
        style={{ backgroundColor: cfg.surface }}
      >
        <p
          className="text-xs font-bold"
          style={{ color: cfg.text }}
        >
          {name}
        </p>
      </div>

      {/* Selected badge */}
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center shadow">
          <Check size={10} color="white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div className="space-y-5">
      {THEME_GROUPS.map((group) => (
        <div key={group.label}>
          {/* Group header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">{group.emoji}</span>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {group.label}
            </p>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Themes grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {group.themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                id={theme.id}
                name={theme.name}
                selected={value === theme.id}
                onClick={() => onChange(theme.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
