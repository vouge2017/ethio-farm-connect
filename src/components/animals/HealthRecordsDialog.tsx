import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, FileText, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HealthRecord {
  id: string;
  record_date: string;
  record_type: string;
  description: string;
  vet_name?: string;
  medications?: string;
  next_checkup_date?: string;
  photos?: string[];
  created_at: string;
}

interface HealthRecordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
}

export function HealthRecordsDialog({ open, onOpenChange, animalId, animalName }: HealthRecordsDialogProps) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    record_type: '',
    description: '',
    vet_name: '',
    medications: '',
    record_date: new Date().toISOString().split('T')[0],
    next_checkup_date: ''
  });

  useEffect(() => {
    if (open) {
      fetchRecords();
    }
  }, [open, animalId]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('animal_id', animalId)
        .order('record_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('health_records')
        .insert({
          animal_id: animalId,
          ...formData,
          next_checkup_date: formData.next_checkup_date || null,
          vet_name: formData.vet_name || null,
          medications: formData.medications || null,
          created_by: (await supabase.auth.getUser()).data.user?.id!
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Health record added successfully"
      });

      setFormData({
        record_type: '',
        description: '',
        vet_name: '',
        medications: '',
        record_date: new Date().toISOString().split('T')[0],
        next_checkup_date: ''
      });
      setShowForm(false);
      fetchRecords();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checkup':
        return '🩺';
      case 'vaccination':
        return '💉';
      case 'treatment':
        return '💊';
      case 'surgery':
        return '🏥';
      default:
        return '📋';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Health Records - {animalName}</DialogTitle>
          <DialogDescription>
            Track medical history, vaccinations, and checkups
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Medical History</h3>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </div>

          {showForm && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">New Health Record</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="record_type">Record Type *</Label>
                      <Select 
                        value={formData.record_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, record_type: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checkup">🩺 Checkup</SelectItem>
                          <SelectItem value="vaccination">💉 Vaccination</SelectItem>
                          <SelectItem value="treatment">💊 Treatment</SelectItem>
                          <SelectItem value="surgery">🏥 Surgery</SelectItem>
                          <SelectItem value="other">📋 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="record_date">Date *</Label>
                      <Input
                        id="record_date"
                        type="date"
                        value={formData.record_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, record_date: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What happened during this visit..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vet_name">Veterinarian Name</Label>
                      <Input
                        id="vet_name"
                        value={formData.vet_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, vet_name: e.target.value }))}
                        placeholder="Dr. Ahmed..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="next_checkup_date">Next Checkup</Label>
                      <Input
                        id="next_checkup_date"
                        type="date"
                        value={formData.next_checkup_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, next_checkup_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Medications</Label>
                    <Textarea
                      id="medications"
                      value={formData.medications}
                      onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                      placeholder="List medications given..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">Save Record</Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <Card className="text-center py-8 border-dashed border-2">
              <CardContent className="pt-6">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No health records yet</p>
                <p className="text-sm text-muted-foreground">Add the first health record for this animal</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <Card key={record.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{getRecordTypeIcon(record.record_type)}</span>
                        <div>
                          <CardTitle className="text-base capitalize">
                            {record.record_type}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(record.record_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {record.next_checkup_date && (
                        <Badge variant="outline" className="gap-1">
                          Next: {new Date(record.next_checkup_date).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{record.description}</p>
                    
                    {record.vet_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        Vet: {record.vet_name}
                      </div>
                    )}
                    
                    {record.medications && (
                      <div className="text-sm">
                        <span className="font-medium">Medications:</span> {record.medications}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
