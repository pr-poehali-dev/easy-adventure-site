import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

interface Service {
  id: number;
  title: string;
  description: string;
  requirements: string;
  price: number;
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
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    requirements: '',
    price: ''
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
      loadOrders();
      loadServices();
      
      const interval = setInterval(() => {
        loadSettings();
        loadOrders();
        loadServices();
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

  const loadServices = async () => {
    try {
      const res = await fetch(`${API_URL}?action=services`);
      const data = await res.json();
      setServices(data);
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
      loadServices();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать услугу',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      await fetch(`${API_URL}?action=service`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService)
      });
      toast({
        title: 'Успешно',
        description: 'Услуга обновлена'
      });
      setIsEditDialogOpen(false);
      setEditingService(null);
      loadServices();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить услугу',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту услугу?')) return;

    try {
      await fetch(`${API_URL}?action=service&id=${serviceId}`, {
        method: 'DELETE'
      });
      toast({
        title: 'Успешно',
        description: 'Услуга удалена'
      });
      loadServices();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить услугу',
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
          <Card className="p-8 animate-fade-in bg-gradient-to-br from-white to-blue-50 border-2 border-primary/30 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Icon name="Lock" size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Админ-панель</h2>
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
                    className="border-primary/30"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:scale-105 transition-transform">
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
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Админ-панель
          </h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)} className="border-primary/30 hover:bg-primary/10">
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-100 to-cyan-100">
            <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <Icon name="Package" size={16} className="mr-2" />
              Заявки
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <Icon name="ShoppingBag" size={16} className="mr-2" />
              Услуги
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-2xl transition-all duration-300 border-2 border-primary/20 bg-gradient-to-br from-white to-blue-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">{order.service_title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Icon name="Phone" size={14} className="text-primary" /> {order.phone}</p>
                      <p className="flex items-center gap-2"><Icon name="Hash" size={14} className="text-primary" /> UID: {order.uid}</p>
                      <p className="flex items-center gap-2"><Icon name="MessageCircle" size={14} className="text-primary" /> {order.telegram}</p>
                      <p className="flex items-center gap-2"><Icon name="Calendar" size={14} className="text-primary" /> {new Date(order.created_at).toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {order.status === 'pending' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, 'accepted')}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105"
                        >
                          <Icon name="Check" size={14} className="mr-1" />
                          Принять
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                          className="hover:scale-105"
                        >
                          <Icon name="X" size={14} className="mr-1" />
                          Отклонить
                        </Button>
                      </>
                    )}
                    {order.status === 'accepted' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:scale-105"
                        >
                          <Icon name="CheckCircle2" size={14} className="mr-1" />
                          Выполнено
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                          className="hover:scale-105"
                        >
                          <Icon name="Ban" size={14} className="mr-1" />
                          Отменено
                        </Button>
                      </>
                    )}
                    {(order.status === 'completed' || order.status === 'cancelled' || order.status === 'rejected') && (
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-gradient-to-r from-muted to-muted/50">
                        {order.status === 'completed' ? '✅ Выполнено' : order.status === 'cancelled' ? '🚫 Отменено' : '❌ Отклонено'}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-white to-cyan-50 border-2 border-primary/30 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Создать новую услугу</h2>
              <form onSubmit={handleCreateService} className="space-y-4">
                <div>
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    required
                    className="border-primary/30"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    required
                    className="border-primary/30"
                  />
                </div>
                <div>
                  <Label htmlFor="requirements">Требования (каждое с новой строки)</Label>
                  <Textarea
                    id="requirements"
                    value={newService.requirements}
                    onChange={(e) => setNewService({ ...newService, requirements: e.target.value })}
                    required
                    className="border-primary/30"
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
                    className="border-primary/30"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:scale-105 transition-transform">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать услугу
                </Button>
              </form>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Все услуги</h2>
              {services.map((service) => (
                <Card key={service.id} className="p-6 hover:shadow-2xl transition-all duration-300 border-2 border-primary/20 bg-gradient-to-br from-white to-blue-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-cyan-600 bg-clip-text text-transparent">{service.title}</h3>
                      <p className="text-3xl font-bold text-primary mb-3">{service.price} ₽</p>
                      <p className="text-muted-foreground mb-3">{service.description}</p>
                      <div className="mb-3">
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
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Dialog open={isEditDialogOpen && editingService?.id === service.id} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingService(service)}
                            className="border-primary/30 hover:bg-primary/10"
                          >
                            <Icon name="Edit" size={14} className="mr-1" />
                            Редактировать
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gradient-to-br from-white to-blue-50">
                          <DialogHeader>
                            <DialogTitle className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Редактировать услугу</DialogTitle>
                          </DialogHeader>
                          {editingService && (
                            <form onSubmit={handleUpdateService} className="space-y-4">
                              <div>
                                <Label htmlFor="edit-title">Название</Label>
                                <Input
                                  id="edit-title"
                                  value={editingService.title}
                                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-description">Описание</Label>
                                <Textarea
                                  id="edit-description"
                                  value={editingService.description}
                                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-requirements">Требования</Label>
                                <Textarea
                                  id="edit-requirements"
                                  value={editingService.requirements}
                                  onChange={(e) => setEditingService({ ...editingService, requirements: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-price">Цена (₽)</Label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  step="0.01"
                                  value={editingService.price}
                                  onChange={(e) => setEditingService({ ...editingService, price: parseFloat(e.target.value) })}
                                  required
                                />
                              </div>
                              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-cyan-500">
                                <Icon name="Save" size={18} className="mr-2" />
                                Сохранить
                              </Button>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteService(service.id)}
                        className="hover:scale-105"
                      >
                        <Icon name="Trash2" size={14} className="mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6 bg-gradient-to-br from-white to-cyan-50 border-2 border-primary/30 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Настройки сайта</h2>
              <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div>
                  <Label htmlFor="site_name">Название сайта</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                    required
                    className="border-primary/30"
                  />
                </div>
                <div>
                  <Label htmlFor="site_description">Описание сайта</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                    required
                    className="border-primary/30"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_telegram">Контакт Telegram</Label>
                  <Input
                    id="contact_telegram"
                    value={settings.contact_telegram}
                    onChange={(e) => setSettings({ ...settings, contact_telegram: e.target.value })}
                    required
                    className="border-primary/30"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:scale-105 transition-transform">
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
