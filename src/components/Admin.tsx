import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/08fa80e3-23c7-4d42-b656-56e81869bdea';
const ADMIN_PASSWORD = '568876Qqq';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_telegram: string;
}

interface Order {
  id: number;
  service_title: string;
  phone: string;
  uid: string;
  telegram: string;
  status: string;
  created_at: string;
}

export const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    site_description: '',
    contact_telegram: ''
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    requirements: '',
    price: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
      loadOrders();
      
      const interval = setInterval(() => {
        loadSettings();
        loadOrders();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API_URL}?action=settings`);
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_URL}?action=orders`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать в админ-панель'
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}?action=settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      toast({
        title: 'Успешно',
        description: 'Настройки сайта обновлены'
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить настройки',
        variant: 'destructive'
      });
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}?action=service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newService,
          price: parseFloat(newService.price)
        })
      });
      toast({
        title: 'Успешно',
        description: 'Услуга создана'
      });
      setNewService({ title: '', description: '', requirements: '', price: '' });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать услугу',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await fetch(`${API_URL}?action=order_status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus })
      });
      toast({
        title: 'Успешно',
        description: 'Статус заявки обновлен'
      });
      loadOrders();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Lock" size={32} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Админ-панель</h2>
              <p className="text-muted-foreground">Введите пароль для входа</p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
            Админ-панель
          </h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Заявки</TabsTrigger>
            <TabsTrigger value="services">Услуги</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{order.service_title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><Icon name="Phone" size={14} className="inline mr-1" /> {order.phone}</p>
                      <p><Icon name="Hash" size={14} className="inline mr-1" /> UID: {order.uid}</p>
                      <p><Icon name="MessageCircle" size={14} className="inline mr-1" /> {order.telegram}</p>
                      <p><Icon name="Calendar" size={14} className="inline mr-1" /> {new Date(order.created_at).toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                        >
                          Принять
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                        >
                          Отклонить
                        </Button>
                      </>
                    )}
                    {order.status === 'accepted' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                        >
                          Выполнено
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                        >
                          Отменено
                        </Button>
                      </>
                    )}
                    {(order.status === 'completed' || order.status === 'cancelled' || order.status === 'rejected') && (
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-muted">
                        {order.status === 'completed' ? 'Выполнено' : order.status === 'cancelled' ? 'Отменено' : 'Отклонено'}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="services">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Создать новую услугу</h2>
              <form onSubmit={handleCreateService} className="space-y-4">
                <div>
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="requirements">Требования (каждое с новой строки)</Label>
                  <Textarea
                    id="requirements"
                    value={newService.requirements}
                    onChange={(e) => setNewService({ ...newService, requirements: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Цена (₽)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать услугу
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Настройки сайта</h2>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div>
                  <Label htmlFor="site_name">Название сайта</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="site_description">Описание сайта</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_telegram">Контакт Telegram</Label>
                  <Input
                    id="contact_telegram"
                    value={settings.contact_telegram}
                    onChange={(e) => setSettings({ ...settings, contact_telegram: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Icon name="Save" size={18} className="mr-2" />
                  Сохранить настройки
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};