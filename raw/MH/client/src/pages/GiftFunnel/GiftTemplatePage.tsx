import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Generator } from '../../components/Generator';

export function GiftTemplatePage() {
  const { slug } = useParams();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/templates/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Template not found');
        return res.json();
      })
      .then(data => {
        setTemplate(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Nie znaleziono szablonu</h2>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {template.title}
        </h1>
        <p className="text-on-surface/80 mt-1">{template.subtitle}</p>
      </div>
      
      {/* Pass giftMode and template to Generator */}
      <Generator giftMode={true} giftTemplate={template} />
    </div>
  );
}
