import './SectionNav.css';

interface SectionNavItem {
  id: string;
  label: string;
}

const ITEMS: SectionNavItem[] = [
  { id: 'hero', label: 'Overview' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'story', label: 'Story' },
  { id: 'scenes', label: 'Scenes' },
  { id: 'narration', label: 'Narration' },
  { id: 'consistency', label: 'Consistency' },
  { id: 'export', label: 'Export' },
];

export default function SectionNav() {
  return (
    <nav className="section-nav" aria-label="Results sections">
      <div className="container section-nav-inner">
        {ITEMS.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="section-nav-link">
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
