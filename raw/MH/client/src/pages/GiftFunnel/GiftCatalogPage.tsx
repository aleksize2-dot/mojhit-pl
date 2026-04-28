import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
const GiftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 12 20 22 4 22 4 12"></polyline>
    <rect x="2" y="7" width="20" height="5"></rect>
    <line x1="12" y1="22" x2="12" y2="7"></line>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

interface Template {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  style_tags: string[];
  mood: string;
}

export function GiftCatalogPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load templates', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Podaruj Muzykę
        </h1>
        <p className="text-xl text-on-surface/80 max-w-2xl mx-auto">
          Wybierz gotowy szablon, spersonalizuj tekst i stwórz wyjątkowy, muzyczny prezent dla bliskiej osoby w kilka sekund!
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Link 
              key={template.id} 
              to={`/upominek/${template.slug}`}
              className="bg-surface-light border border-border/40 rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group flex flex-col"
            >
              <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GiftIcon className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-on-surface group-hover:text-primary transition-colors">
                {template.title}
              </h2>
              <p className="text-on-surface/60 font-medium mb-4">
                {template.subtitle}
              </p>
              <p className="text-sm text-on-surface/80 mb-6 flex-grow">
                {template.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {template.style_tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-surface-dark rounded-md text-on-surface/70 border border-border/50">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex items-center text-primary font-bold">
                <span>Stwórz piosenkę</span>
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
