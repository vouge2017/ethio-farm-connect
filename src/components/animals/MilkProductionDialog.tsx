import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MilkRecord {
  id: string;
  production_date: string;
  morning_amount: number;
  evening_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
}

interface MilkProductionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId: string;
  animalName: string;
}

export function MilkProductionDialog({ open, onOpenChange, animalId, animalName }: MilkProductionDialogProps) {
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    production_date: new Date().toISOString().split('T')[0],
    morning_amount: '',
    evening_amount: '',
    notes: ''
  });

  useEffect(() => {
    if (open) {
      fetchRecords();
    }
  }, [open, animalId]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('milk_records')
        .select('*')
        .eq('animal_id', animalId)
        .order('production_date', { ascending: false })
        .limit(30);

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
    
    const morningAmount = parseFloat(formData.morning_amount) || 0;
    const eveningAmount = parseFloat(formData.evening_amount) || 0;
    const totalAmount = morningAmount + eveningAmount;

    try {
      const { error } = await supabase
        .from('milk_records')
        .insert({
          animal_id: animalId,
          production_date: formData.production_date,
          morning_amount: morningAmount,
          evening_amount: eveningAmount,
          total_amount: totalAmount,
          notes: formData.notes || null,
          created_by: (await supabase.auth.getUser()).data.user?.id!
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Milk production recorded successfully"
      });

      setFormData({
        production_date: new Date().toISOString().split('T')[0],
        morning_amount: '',
        evening_amount: '',
        notes: ''
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

  // Calculate statistics
  const totalProduction = records.reduce((sum, r) => sum + r.total_amount, 0);
  const avgDaily = records.length > 0 ? (totalProduction / records.length).toFixed(1) : 0;
  const last7Days = records.slice(0, 7);
  const weeklyAvg = last7Days.length > 0 
    ? (last7Days.reduce((sum, r) => sum + r.total_amount, 0) / last7Days.length).toFixed(1) 
    : 0;

  // Prepare chart data (reverse for chronological order)
  const chartData = [...records].reverse().slice(-14).map(record => ({
    date: new Date(record.production_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    morning: record.morning_amount,
    evening: record.evening_amount,
    total: record.total_amount
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🥛 Milk Production - {animalName}</DialogTitle>
          <DialogDescription>
            Track daily milk production and analyze trends
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Production</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProduction.toFixed(1)} L</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgDaily} L</div>
                <p className="text-xs text-muted-foreground">Per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">7-Day Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weeklyAvg} L</div>
                <p className="text-xs text-muted-foreground">Last week</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {records.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Production Trend (Last 14 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} label={{ value: 'Liters', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="morning" stroke="#8884d8" name="Morning" />
                    <Line type="monotone" dataKey="evening" stroke="#82ca9d" name="Evening" />
                    <Line type="monotone" dataKey="total" stroke="#ffc658" name="Total" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Add Record Form */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Daily Records</h3>
            <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </div>

          {showForm && (
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="production_date">Date *</Label>
                      <Input
                        id="production_date"
                        type="date"
                        value={formData.production_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, production_date: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="morning_amount">Morning (Liters) *</Label>
                      <Input
                        id="morning_amount"
                        type="number"
                        step="0.1"
                        value={formData.morning_amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, morning_amount: e.target.value }))}
                        placeholder="0.0"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="evening_amount">Evening (Liters) *</Label>
                      <Input
                        id="evening_amount"
                        type="number"
                        step="0.1"
                        value={formData.evening_amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, evening_amount: e.target.value }))}
                        placeholder="0.0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any observations..."
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

          {/* Records List */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <Card className="text-center py-8 border-dashed border-2">
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No production records yet</p>
                <p className="text-sm text-muted-foreground">Start tracking daily milk production</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <Card key={record.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {new Date(record.production_date).toLocaleDateString()}
                          </div>
                          {record.notes && (
                            <p className="text-sm text-muted-foreground">{record.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{record.total_amount.toFixed(1)} L</div>
                        <div className="text-xs text-muted-foreground">
                          Morning: {record.morning_amount}L • Evening: {record.evening_amount}L
                        </div>
                      </div>
                    </div>
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
