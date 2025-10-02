import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Lightbulb, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DailyTip {
  id: string;
  title_en: string;
  title_am: string;
  title_om?: string;
  content_en: string;
  content_am: string;
  content_om?: string;
  category: string;
  animal_types?: string[];
  image_url?: string;
  publish_date: string;
}

type Language = 'en' | 'am' | 'om';

export function DailyTip() {
  const [tips, setTips] = useState<DailyTip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_tips')
        .select('*')
        .eq('is_published', true)
        .lte('publish_date', today)
        .order('publish_date', { ascending: false })
        .limit(7); // Get last week's tips

      if (error) throw error;
      setTips(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load daily tips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (tips.length === 0) {
    return (
      <Card className="border-dashed border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Daily Farming Tip
          </CardTitle>
          <CardDescription>No tips available at the moment</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentTip = tips[currentIndex];
  
  const getTitle = () => {
    switch (language) {
      case 'am': return currentTip.title_am;
      case 'om': return currentTip.title_om || currentTip.title_en;
      default: return currentTip.title_en;
    }
  };

  const getContent = () => {
    switch (language) {
      case 'am': return currentTip.content_am;
      case 'om': return currentTip.content_om || currentTip.content_en;
      default: return currentTip.content_en;
    }
  };

  const nextTip = () => {
    setCurrentIndex((prev) => (prev + 1) % tips.length);
  };

  const previousTip = () => {
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const getAnimalIcon = (type: string) => {
    const icons: Record<string, string> = {
      cattle: '🐄',
      goat: '🐐',
      sheep: '🐑',
      chicken: '🐔',
      camel: '🐪',
      donkey: '🫏',
      horse: '🐎'
    };
    return icons[type] || '🐾';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary animate-pulse" />
            <CardTitle className="text-lg">Daily Farming Tip</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
              className="h-7 px-2 text-xs"
            >
              EN
            </Button>
            <Button
              variant={language === 'am' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('am')}
              className="h-7 px-2 text-xs"
            >
              አማ
            </Button>
            {currentTip.content_om && (
              <Button
                variant={language === 'om' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('om')}
                className="h-7 px-2 text-xs"
              >
                OM
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(currentTip.publish_date).toLocaleDateString()}</span>
          <Badge variant="secondary" className="ml-auto">
            {currentTip.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {currentTip.image_url && (
          <img 
            src={currentTip.image_url} 
            alt={getTitle()}
            className="w-full h-40 object-cover rounded-md mb-4"
          />
        )}

        <h3 className="font-semibold text-lg mb-2">{getTitle()}</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {getContent()}
        </p>

        {currentTip.animal_types && currentTip.animal_types.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {currentTip.animal_types.map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {getAnimalIcon(type)} {type}
              </Badge>
            ))}
          </div>
        )}

        {tips.length > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousTip}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {tips.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTip}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
