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
            <Card key={service.id} className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-primary/20 animate-fade-in">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Trophy" size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                  <p className="text-3xl font-bold text-primary">{service.price} ₽</p>
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
                      <span className="text-primary mt-0.5">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <Dialog open={isDialogOpen && selectedService?.id === service.id} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    onClick={() => setSelectedService(service)}
                  >
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить запрос
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Заказ услуги: {service.title}</DialogTitle>
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
                      />
                    </div>
                    <Button type="submit" className="w-full">
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