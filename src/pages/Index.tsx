import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type NavSection = 'home' | 'events' | 'chat' | 'support' | 'profile';

interface Product {
  id: number;
  seller_name: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  created_at: string;
}

const PRODUCTS_API = 'https://functions.poehali.dev/c0d1fd87-a965-45c6-a6b5-b9048e5527a4';

const Index = () => {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const eventProgress = 65;
  const userPoints = 650;
  
  const [formData, setFormData] = useState({
    seller_name: '',
    title: '',
    description: '',
    price: '',
    card_number: '',
    images: [] as string[]
  });
  
  useEffect(() => {
    loadProducts();
  }, []);
  
  const loadProducts = async () => {
    try {
      const res = await fetch(PRODUCTS_API);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const readers: Promise<string>[] = [];
    Array.from(files).slice(0, 5).forEach(file => {
      readers.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));
    });
    
    Promise.all(readers).then(images => {
      setFormData(prev => ({ ...prev, images }));
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch(PRODUCTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      });
      
      if (res.ok) {
        toast({ title: 'Успех!', description: 'Товар добавлен на маркетплейс' });
        setIsDialogOpen(false);
        setFormData({ seller_name: '', title: '', description: '', price: '', card_number: '', images: [] });
        loadProducts();
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось добавить товар', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Проверьте подключение', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-primary/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center animate-pulse-glow">
              <span className="text-2xl">💎</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Brawl Gems
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary px-4 py-2">
              <Icon name="Gem" size={16} className="mr-2" />
              {userPoints} баллов
            </Badge>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-24 container mx-auto px-4">
        {activeSection === 'home' && (
          <div className="space-y-12 animate-fade-in">
            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 font-bold animate-pulse-glow">
                    <Icon name="Plus" size={20} className="mr-2" />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Добавить товар</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="seller_name">Ваше имя</Label>
                      <Input id="seller_name" value={formData.seller_name} onChange={(e) => setFormData({...formData, seller_name: e.target.value})} placeholder="Имя продавца" />
                    </div>
                    <div>
                      <Label htmlFor="title">Название товара *</Label>
                      <Input id="title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Аккаунт с легендарками" />
                    </div>
                    <div>
                      <Label htmlFor="description">Описание</Label>
                      <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Подробное описание товара..." rows={4} />
                    </div>
                    <div>
                      <Label htmlFor="price">Цена (₽) *</Label>
                      <Input id="price" type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="2500" />
                    </div>
                    <div>
                      <Label htmlFor="card_number">Номер карты для оплаты</Label>
                      <Input id="card_number" value={formData.card_number} onChange={(e) => setFormData({...formData, card_number: e.target.value})} placeholder="1234 5678 9012 3456" maxLength={19} />
                    </div>
                    <div>
                      <Label htmlFor="images">Фотографии (до 5 шт)</Label>
                      <Input id="images" type="file" accept="image/*" multiple onChange={handleImageUpload} />
                      {formData.images.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {formData.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                          ))}
                        </div>
                      )}
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-secondary">
                      {isLoading ? 'Добавление...' : 'Добавить товар'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-12 text-white">
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-5xl font-bold mb-4 animate-scale-in">
                  Добро пожаловать в Brawl Gems!
                </h2>
                <p className="text-xl mb-6 opacity-90">
                  Продавай аккаунты, прокачивай персонажей и участвуй в эксклюзивных ивентах
                </p>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold hover-scale">
                  <Icon name="Sparkles" size={20} className="mr-2" />
                  Начать покупки
                </Button>
              </div>
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute right-32 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold">Все товары</h3>
              </div>
              
              {products.length === 0 ? (
                <Card className="game-card p-12 text-center">
                  <Icon name="Package" size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <h4 className="text-2xl font-bold mb-2">Товаров пока нет</h4>
                  <p className="text-muted-foreground mb-6">Станьте первым, кто добавит товар на маркетплейс!</p>
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-primary to-secondary">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить товар
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="game-card group cursor-pointer">
                      {product.images.length > 0 ? (
                        <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center text-6xl mb-4 group-hover:scale-110 transition-transform">
                          📦
                        </div>
                      )}
                      <h4 className="text-xl font-bold mb-2">{product.title}</h4>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-primary">{product.price.toLocaleString('ru-RU')}₽</span>
                        <span className="text-xs text-muted-foreground">{product.seller_name}</span>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                        <Icon name="ShoppingCart" size={18} className="mr-2" />
                        Купить
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-6">
              <h3 className="text-3xl font-bold">Категории</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Аккаунты', icon: 'User', color: 'from-primary to-purple-600' },
                  { name: 'Прокачка', icon: 'TrendingUp', color: 'from-secondary to-pink-600' },
                  { name: 'Скины', icon: 'Palette', color: 'from-accent to-orange-600' },
                  { name: 'Гемы', icon: 'Gem', color: 'from-blue-500 to-cyan-600' },
                ].map((cat, idx) => (
                  <Card key={idx} className="game-card group cursor-pointer text-center p-8">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform`}>
                      <Icon name={cat.icon} size={32} className="text-white" />
                    </div>
                    <h4 className="font-bold text-lg">{cat.name}</h4>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeSection === 'events' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-block animate-float text-8xl mb-4">💗</div>
              <h2 className="text-4xl font-bold mb-2">Ивент "Сердечко"</h2>
              <p className="text-muted-foreground text-lg">13 февраля - 20 февраля 2026</p>
            </div>

            <Card className="game-card max-w-2xl mx-auto p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Прогресс сообщества</h3>
                    <p className="text-muted-foreground">Соберем вместе — получим скидки!</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{userPoints}</div>
                    <div className="text-sm text-muted-foreground">баллов собрано</div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -top-2 left-0 right-0 flex justify-between text-xs font-semibold">
                    <span className={eventProgress >= 25 ? 'text-primary' : 'text-muted-foreground'}>250</span>
                    <span className={eventProgress >= 50 ? 'text-primary' : 'text-muted-foreground'}>500</span>
                    <span className={eventProgress >= 75 ? 'text-primary' : 'text-muted-foreground'}>750</span>
                    <span className={eventProgress >= 100 ? 'text-primary' : 'text-muted-foreground'}>1000</span>
                  </div>
                  <Progress value={eventProgress} className="h-8 mt-6" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { level: '15%', points: 250, active: eventProgress >= 25 },
                    { level: '30%', points: 500, active: eventProgress >= 50 },
                    { level: '60%', points: 750, active: eventProgress >= 75 },
                    { level: '100%', points: 1000, active: eventProgress >= 100 },
                  ].map((tier, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border-2 text-center transition-all ${
                      tier.active 
                        ? 'bg-primary/20 border-primary animate-pulse-glow' 
                        : 'bg-muted/20 border-muted-foreground/20'
                    }`}>
                      <div className="text-2xl font-bold mb-1">{tier.level}</div>
                      <div className="text-xs text-muted-foreground">скидка</div>
                    </div>
                  ))}
                </div>

                <Button className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-lg py-6 font-bold animate-pulse-glow">
                  <Icon name="Heart" size={24} className="mr-2" />
                  Февральская лихорадка
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Активируй скидку 20% на 2 минуты!
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'chat' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Card className="game-card p-8 text-center">
              <Icon name="MessageCircle" size={64} className="mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-2">Чат с продавцами</h2>
              <p className="text-muted-foreground mb-6">Здесь будет список ваших диалогов</p>
              <Button className="bg-gradient-to-r from-primary to-secondary">
                <Icon name="Plus" size={18} className="mr-2" />
                Новый диалог
              </Button>
            </Card>
          </div>
        )}

        {activeSection === 'support' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <Card className="game-card p-8 text-center">
              <Icon name="Headphones" size={64} className="mx-auto mb-4 text-secondary" />
              <h2 className="text-3xl font-bold mb-2">Поддержка</h2>
              <p className="text-muted-foreground mb-6">Задайте вопрос нашей команде</p>
              <Button className="bg-gradient-to-r from-secondary to-pink-500">
                <Icon name="Mail" size={18} className="mr-2" />
                Написать в поддержку
              </Button>
            </Card>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
            <Card className="game-card p-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-4xl">
                  👤
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">Игрок #12345</h2>
                  <div className="flex items-center gap-2">
                    <Icon name="Star" size={18} className="text-accent fill-accent" />
                    <span className="text-xl font-semibold">Рейтинг: 4.9</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-primary/10 rounded-xl text-center">
                  <div className="text-3xl font-bold text-primary">{userPoints}</div>
                  <div className="text-sm text-muted-foreground">Баллов</div>
                </div>
                <div className="p-4 bg-secondary/10 rounded-xl text-center">
                  <div className="text-3xl font-bold text-secondary">23</div>
                  <div className="text-sm text-muted-foreground">Заказов</div>
                </div>
                <div className="p-4 bg-accent/10 rounded-xl text-center">
                  <div className="text-3xl font-bold text-accent">12</div>
                  <div className="text-sm text-muted-foreground">Отзывов</div>
                </div>
              </div>
            </Card>

            <Card className="game-card p-8">
              <h3 className="text-2xl font-bold mb-4">История покупок</h3>
              <p className="text-muted-foreground">Ваши заказы появятся здесь</p>
            </Card>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-primary/20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-around">
          {[
            { id: 'home', icon: 'Home', label: 'Главная' },
            { id: 'events', icon: 'Calendar', label: 'Ивенты' },
            { id: 'chat', icon: 'MessageCircle', label: 'Чат' },
            { id: 'support', icon: 'Headphones', label: 'Поддержка' },
            { id: 'profile', icon: 'User', label: 'Профиль' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as NavSection)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all hover-scale ${
                activeSection === item.id
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={item.icon} size={24} />
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;