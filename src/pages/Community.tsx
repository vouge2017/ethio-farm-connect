import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MessageSquare, Eye, User, Calendar, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaUpload } from '@/components/media/MediaUpload';

interface Question {
  id: string;
  title: string;
  content: string;
  animal_type?: string;
  status: 'open' | 'answered' | 'closed';
  view_count: number;
  photos?: string[];
  audio_url?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string;
  };
  answers?: { count: number }[];
}

interface Answer {
  id: string;
  content: string;
  question_id: string;
  author_id: string;
  is_vet_answer: boolean;
  helpful_count: number;
  created_at: string;
  profiles?: {
    display_name: string;
    role: string;
  };
}

type AnimalType = 'cattle' | 'goat' | 'sheep' | 'chicken' | 'camel' | 'donkey' | 'horse';

export default function Community() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [newAnswer, setNewAnswer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [questionForm, setQuestionForm] = useState({
    title: '',
    content: '',
    animal_type: '' as AnimalType | '',
    photos: [] as string[]
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles!questions_author_id_fkey(display_name),
          answers(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
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

  const fetchAnswers = async (questionId: string) => {
    try {
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          profiles!answers_author_id_fkey(display_name, role)
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAnswers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.title || !questionForm.content) return;

    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          title: questionForm.title,
          content: questionForm.content,
          animal_type: questionForm.animal_type || null,
          photos: questionForm.photos.length > 0 ? questionForm.photos : null,
          author_id: user?.id!
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question posted successfully!"
      });

      setQuestionForm({
        title: '',
        content: '',
        animal_type: '',
        photos: []
      });
      setShowNewQuestion(false);
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer || !selectedQuestion) return;

    try {
      const { error } = await supabase
        .from('answers')
        .insert({
          content: newAnswer,
          question_id: selectedQuestion.id,
          author_id: user?.id!
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Answer posted successfully!"
      });

      setNewAnswer('');
      fetchAnswers(selectedQuestion.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const incrementViewCount = async (questionId: string) => {
    // Update view count directly since RPC function doesn't exist yet
    await supabase
      .from('questions')
      .update({ view_count: questions.find(q => q.id === questionId)?.view_count + 1 || 1 })
      .eq('id', questionId);
  };

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
    fetchAnswers(question.id);
    incrementViewCount(question.id);
  };

  const handlePhotoUpload = (urls: string[]) => {
    setQuestionForm(prev => ({ ...prev, photos: urls }));
    setShowPhotoUpload(false);
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

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || question.animal_type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (selectedQuestion) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedQuestion(null)}>
            ← Back to Questions
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{selectedQuestion.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedQuestion.profiles?.display_name || 'Anonymous'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedQuestion.created_at).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {selectedQuestion.view_count} views
                  </span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {selectedQuestion.animal_type && (
                  <Badge variant="secondary">
                    {getAnimalIcon(selectedQuestion.animal_type)} {selectedQuestion.animal_type}
                  </Badge>
                )}
                <Badge variant={selectedQuestion.status === 'answered' ? 'default' : 'outline'}>
                  {selectedQuestion.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{selectedQuestion.content}</p>
            {selectedQuestion.photos && selectedQuestion.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {selectedQuestion.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Question photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Answers */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Answers ({answers.length})
          </h3>
          
          {answers.map((answer) => (
            <Card key={answer.id} className={answer.is_vet_answer ? 'border-l-4 border-l-accent' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{answer.profiles?.display_name || 'Anonymous'}</span>
                    {answer.is_vet_answer && (
                      <Badge variant="destructive">Veterinarian</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {answer.helpful_count}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{answer.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Answer Form */}
        {user && (
          <Card>
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAnswer} className="space-y-4">
                <Textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Share your knowledge and help the community..."
                  rows={4}
                  required
                />
                <Button type="submit">Post Answer</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Community Q&A
          </h1>
          <p className="text-muted-foreground">Ask questions and share knowledge with fellow farmers</p>
        </div>
        
        {user && (
          <Dialog open={showNewQuestion} onOpenChange={setShowNewQuestion}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ask Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ask a Question</DialogTitle>
                <DialogDescription>
                  Get help from the farming community
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Question Title *</Label>
                  <Input
                    id="title"
                    value={questionForm.title}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What's your question?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animal_type">Animal Type</Label>
                  <Select 
                    value={questionForm.animal_type} 
                    onValueChange={(value: AnimalType) => setQuestionForm(prev => ({ ...prev, animal_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select animal type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cattle">{getAnimalIcon('cattle')} Cattle</SelectItem>
                      <SelectItem value="goat">{getAnimalIcon('goat')} Goat</SelectItem>
                      <SelectItem value="sheep">{getAnimalIcon('sheep')} Sheep</SelectItem>
                      <SelectItem value="chicken">{getAnimalIcon('chicken')} Chicken</SelectItem>
                      <SelectItem value="camel">{getAnimalIcon('camel')} Camel</SelectItem>
                      <SelectItem value="donkey">{getAnimalIcon('donkey')} Donkey</SelectItem>
                      <SelectItem value="horse">{getAnimalIcon('horse')} Horse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Description *</Label>
                  <Textarea
                    id="content"
                    value={questionForm.content}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Describe your question in detail..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Photos (optional)</Label>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowPhotoUpload(true)}
                    >
                      Add Photos
                    </Button>
                    {questionForm.photos.length > 0 && (
                      <Badge variant="secondary">{questionForm.photos.length} photos added</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Post Question</Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewQuestion(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Animals</SelectItem>
            <SelectItem value="cattle">🐄 Cattle</SelectItem>
            <SelectItem value="goat">🐐 Goat</SelectItem>
            <SelectItem value="sheep">🐑 Sheep</SelectItem>
            <SelectItem value="chicken">🐔 Chicken</SelectItem>
            <SelectItem value="camel">🐪 Camel</SelectItem>
            <SelectItem value="donkey">🫏 Donkey</SelectItem>
            <SelectItem value="horse">🐎 Horse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card 
            key={question.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleQuestionClick(question)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{question.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {question.profiles?.display_name || 'Anonymous'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(question.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {question.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {question.answers?.[0]?.count || 0} answers
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {question.animal_type && (
                    <Badge variant="secondary">
                      {getAnimalIcon(question.animal_type)} {question.animal_type}
                    </Badge>
                  )}
                  <Badge variant={question.status === 'answered' ? 'default' : 'outline'}>
                    {question.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-muted-foreground">{question.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-semibold mb-2">No Questions Found</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to ask a question or try different search terms
            </p>
            {user && (
              <Button onClick={() => setShowNewQuestion(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Ask First Question
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Photo Upload Dialog */}
      <Dialog open={showPhotoUpload} onOpenChange={setShowPhotoUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photos</DialogTitle>
            <DialogDescription>Add photos to help explain your question</DialogDescription>
          </DialogHeader>
          <MediaUpload
            bucket="animal-photos"
            onUpload={handlePhotoUpload}
            maxFiles={3}
            accept="images"
            existingFiles={questionForm.photos}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}