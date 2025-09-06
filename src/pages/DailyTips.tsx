import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Search, Lightbulb, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DailyTip {
  id: string;
  title_en?: string;
  title_am: string;
  title_om?: string;
  content_en?: string;
  content_am: string;
  content_om?: string;
  category: string;
  animal_types?: string[];
  image_url?: string;
  publish_date?: string;
  created_at: string;
}

export default function DailyTips() {
  const [tips, setTips] = useState<DailyTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAnimalType, setSelectedAnimalType] = useState('all');
  const [language, setLanguage] = useState<'en' | 'am' | 'om'>('en');
  const { toast } = useToast();

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_tips')
        .select('*')
        .eq('is_published', true)
        .order('publish_date', { ascending: false });

      if (error) throw error;
      setTips(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = (tip: DailyTip) => {
    switch (language) {
      case 'am': return tip.title_am;
      case 'om': return tip.title_om || tip.title_am;
      default: return tip.title_en || tip.title_am;
    }
  };

  const getContent = (tip: DailyTip) => {
    switch (language) {
      case 'am': return tip.content_am;
      case 'om': return tip.content_om || tip.content_am;
      default: return tip.content_en || tip.content_am;
    }
  };

  const getAnimalIcon = (type: string) => {
    switch (type) {
      case 'cattle': return '🐄';
      case 'goat': return '🐐';
      case 'sheep': return '🐑';
      case 'chicken': return '🐔';
      case 'camel': return '🐪';
      case 'donkey': return '🫏';
      case 'horse': return '🐎';
      default: return '🐾';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'feeding': return '🌾';
      case 'health': return '🏥';
      case 'breeding': return '👶';
      case 'housing': return '🏠';
      case 'general': return '📚';
      case 'weather': return '🌤️';
      case 'disease_prevention': return '💊';
      default: return '💡';
    }
  };

  const filteredTips = tips.filter(tip => {
    const title = getTitle(tip).toLowerCase();
    const content = getContent(tip).toLowerCase();
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || 
                         content.includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    
    const matchesAnimalType = selectedAnimalType === 'all' || 
                             (tip.animal_types && tip.animal_types.includes(selectedAnimalType));
    
    return matchesSearch && matchesCategory && matchesAnimalType;
  });

  const categories = Array.from(new Set(tips.map(tip => tip.category)));
  const animalTypes = Array.from(new Set(tips.flatMap(tip => tip.animal_types || [])));

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded mb-4"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            💡 Daily Farming Tips
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            {language === 'am' ? 'የእለት ተእለት የግብርና ምክሮች እና ጠቃሚ ምክሮች' : 
             language === 'om' ? 'Gorsawwan qonnaa guyyaa guyyaa fi gorsawwan barbaachisoo' :
             'Daily farming tips and expert advice for Ethiopian farmers'}
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>📚 {tips.length} tips available</span>
            <span>🌾 Expert knowledge</span>
            <span>🇪🇹 Ethiopia-specific content</span>
          </div>
        </div>
        
        <Select value={language} onValueChange={(value: 'en' | 'am' | 'om') => setLanguage(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="am">አማርኛ</SelectItem>
            <SelectItem value="om">Oromiffa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Search and Filters */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'am' ? 'ምክር ፈልግ...' : 
                        language === 'om' ? 'Gorsaa barbaadi...' : 
                        'Search tips...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {getCategoryIcon(category)} {category.replace('_', ' ').toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedAnimalType} onValueChange={setSelectedAnimalType}>
          <SelectTrigger>
            <SelectValue placeholder="Animal Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Animals</SelectItem>
            {animalTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {getAnimalIcon(type)} {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={fetchTips}>
          <Lightbulb className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tips Grid */}
      {filteredTips.length === 0 ? (
        <Card className="text-center py-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-dashed border-2 border-primary/20">
          <CardContent>
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-semibold mb-2 text-primary">
              {language === 'am' ? 'ምንም ምክር አልተገኘም' :
               language === 'om' ? 'Gorsaawwan tokko hin argamne' :
               'No Tips Found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'am' ? 'የተለየ ፍለጋ ቃል ይሞክሩ ወይም ማጣሪያዎቹን ይቀይሩ' :
               language === 'om' ? 'Jechawwan barbaacha biraa yaalii ykn filannoo jijjiiri' :
               'Try different search terms or change the filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTips.map((tip) => (
            <Card 
              key={tip.id} 
              className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-primary/20 hover:border-l-primary overflow-hidden"
            >
              {tip.image_url && (
                <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${tip.image_url})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="bg-white/90 text-black">
                        {getCategoryIcon(tip.category)} {tip.category.replace('_', ' ')}
                      </Badge>
                      {tip.animal_types && tip.animal_types.map((type) => (
                        <Badge key={type} variant="outline" className="bg-white/90 text-black border-white/50">
                          {getAnimalIcon(type)} {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <CardHeader className={!tip.image_url ? 'pb-2' : ''}>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">{getTitle(tip)}</CardTitle>
                  {!tip.image_url && (
                    <div className="flex gap-1 flex-col">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryIcon(tip.category)} {tip.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardDescription className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {tip.publish_date ? 
                    new Date(tip.publish_date).toLocaleDateString() : 
                    new Date(tip.created_at).toLocaleDateString()
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed line-clamp-4">
                  {getContent(tip)}
                </p>
                
                {!tip.image_url && tip.animal_types && tip.animal_types.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {tip.animal_types.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {getAnimalIcon(type)} {type}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <BookOpen className="h-4 w-4" />
                  {language === 'am' ? 'ተጨማሪ አንብብ' :
                   language === 'om' ? 'Dabalata dubbisi' :
                   'Read More'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}