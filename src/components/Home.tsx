import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/08fa80e3-23c7-4d42-b656-56e81869bdea';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_telegram: string;
}

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'EasyAdventure',
    site_description: 'Профессиональная прокачка аккаунтов Henshin Impact',
    contact_telegram: 't.me/VirtMG'
  });

  useEffect(() => {
    fetch(`${API_URL}?action=settings`)
      .then(res => res.json())
      .then(data => {
        if (data.site_name) {
          setSettings(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-cyan-500 bg-clip-text text-transparent">
            {settings.site_name}
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {settings.site_description}
          </p>
          <Button 
            size="lg" 
            onClick={() => onNavigate('services')}
            className="text-lg px-8 py-6 hover:scale-105 transition-transform"
          >
            <Icon name="Zap" size={20} className="mr-2" />
            Выбрать услугу
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow animate-fade-in border-2 border-primary/20">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Shield" size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Безопасность</h3>
            <p className="text-muted-foreground">
              Гарантия безопасности вашего аккаунта на всех этапах работы
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow animate-fade-in border-2 border-primary/20">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Clock" size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Быстро</h3>
            <p className="text-muted-foreground">
              Выполнение заказов в кратчайшие сроки с максимальным качеством
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow animate-fade-in border-2 border-primary/20">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Star" size={32} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Качество</h3>
            <p className="text-muted-foreground">
              Профессиональный подход и внимание к деталям в каждом заказе
            </p>
          </Card>
        </div>

        <Card className="p-8 bg-gradient-to-r from-primary/5 to-cyan-500/5 border-2 border-primary/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Icon name="MessageCircle" size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Нужна помощь?</h3>
              <p className="text-muted-foreground">
                Свяжитесь с нами в Telegram: <a href={`https://${settings.contact_telegram}`} className="text-primary hover:underline font-medium">{settings.contact_telegram}</a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
