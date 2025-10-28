import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/08fa80e3-23c7-4d42-b656-56e81869bdea';

interface Service {
  id: number;
  title: string;
  description: string;
  requirements: string;
  price: number;
}

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [phone, setPhone] = useState('');
  const [uid, setUid] = useState('');
  const [telegram, setTelegram] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadServices = () => {
      fetch(`${API_URL}?action=services`)
        .then(res => res.json())
        .then(data => setServices(data))
        .catch(console.error);
    };

    loadServices();
    const interval = setInterval(loadServices, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !phone || !uid || !telegram) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}?action=order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedService.id,
          phone,
          uid,
          telegram
        })
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setPhone('');
        setUid('');
        setTelegram('');
        
        toast({
          title: 'Ваша заявка отправлена, ожидайте!',
          description: 'Данные для связи: t.me/VirtMG',
          duration: 5000
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
            Наши услуги
          </h1>
          <p className="text-xl text-muted-foreground">
            Выберите подходящий пакет прокачки для вашего аккаунта
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-primary/30 animate-fade-in bg-gradient-to-br from-white via-blue-50 to-cyan-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Icon name="Trophy" size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">{service.title}</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">{service.price} ₽</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">{service.description}</p>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="CheckCircle2" size={16} className="text-primary" />
                  Требования:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {service.requirements.split('\n').map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">⚡</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <Dialog open={isDialogOpen && selectedService?.id === service.id} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:scale-105 transition-transform shadow-lg" 
                    onClick={() => setSelectedService(service)}
                  >
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить запрос
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-white to-blue-50">
                  <DialogHeader>
                    <DialogTitle className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Заказ услуги: {service.title}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Номер телефона</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+7 (999) 123-45-67"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="border-primary/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="uid">UID аккаунта</Label>
                      <Input
                        id="uid"
                        placeholder="123456789"
                        value={uid}
                        onChange={(e) => setUid(e.target.value)}
                        required
                        className="border-primary/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telegram">Telegram</Label>
                      <Input
                        id="telegram"
                        placeholder="@username"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        required
                        className="border-primary/30"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:scale-105 transition-transform">
                      Отправить заявку
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};