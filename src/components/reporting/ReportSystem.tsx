import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Flag, Shield, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportSystemProps {
  targetType: 'listing' | 'user' | 'message';
  targetId: string;
  onClose: () => void;
}

export function ReportSystem({ targetType, targetId, onClose }: ReportSystemProps) {
  const [reportReason, setReportReason] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const reportReasons = {
    listing: [
      { id: 'fraud', label: 'የማጭበርበር ፍላጎት', description: 'የውሸት ወይም የማታለል መረጃ' },
      { id: 'fake', label: 'የውሸት ማስታወቂያ', description: 'የማይገኝ ወይም የውሸት እንሳት' },
      { id: 'price', label: 'ተገቢ ያልሆነ ዋጋ', description: 'በጣም ከፍተኛ ወይም አጠራጣሪ ዋጋ' },
      { id: 'duplicate', label: 'የተደጋገመ ማስታወቂያ', description: 'ተመሳሳይ ማስታወቂያ ብዙ ጊዜ ተለጥፏል' },
      { id: 'inappropriate', label: 'ተገቢ ያልሆነ ይዘት', description: 'ተገቢ ያልሆነ ምስል ወይም መረጃ' }
    ],
    user: [
      { id: 'harassment', label: 'ማዋከብ', description: 'ማስፈራራት ወይም ማዋከብ' },
      { id: 'scam', label: 'ማጭበርበር', description: 'የማጭበርበር ሙከራ' },
      { id: 'spam', label: 'ስፓም', description: 'ተደጋጋሚ ወይም ተገቢ ያልሆነ መልእክት' },
      { id: 'fake_profile', label: 'የውሸት መለያ', description: 'የውሸት መታወቂያ መረጃ' },
      { id: 'inappropriate', label: 'ተገቢ ያልሆነ ባህሪ', description: 'ተገቢ ያልሆነ ወይም አጸያፊ ባህሪ' }
    ],
    message: [
      { id: 'harassment', label: 'ማዋከብ', description: 'ማስፈራራት ወይም ማዋከብ' },
      { id: 'spam', label: 'ስፓም መልእክት', description: 'ተደጋጋሚ ወይም ተገቢ ያልሆነ መልእክት' },
      { id: 'inappropriate', label: 'ተገቢ ያልሆነ ይዘት', description: 'አጸያፊ ወይም ተገቢ ያልሆነ ይዘት' },
      { id: 'scam', label: 'ማጭበርበር', description: 'የማጭበርበር ወይም የማታለል ሙከራ' }
    ]
  };

  const handleSubmit = async () => {
    if (!reportReason) {
      toast({
        title: "ምክንያት ይምረጡ",
        description: "እባክዎ የሪፖርት ምክንያት ይምረጡ",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "ሪፖርት ተላከ",
        description: "የእርስዎ ሪፖርት በተሳካ ሁኔታ ተላከ። በ24 ሰዓት ውስጥ እንመለከተዋለን።",
      });

      onClose();
    } catch (error) {
      toast({
        title: "ስህተት ተፈጥሯል",
        description: "እባክዎ እንደገና ይሞክሩ",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = () => {
    switch (targetType) {
      case 'listing': return AlertTriangle;
      case 'user': return Flag;
      case 'message': return MessageSquare;
      default: return Shield;
    }
  };

  const Icon = getIcon();
  const reasons = reportReasons[targetType];

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-orange-600" />
          ሪፖርት ይላኩ
        </CardTitle>
        <CardDescription>
          {targetType === 'listing' && 'ለዚህ ማስታወቂያ ችግር ሪፖርት ያድርጉ'}
          {targetType === 'user' && 'ለዚህ ተጠቃሚ ችግር ሪፖርት ያድርጉ'}
          {targetType === 'message' && 'ለዚህ መልእክት ችግር ሪፖርት ያድርጉ'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Report Reasons */}
        <div className="space-y-3">
          <Label className="text-base font-medium">ሪፖርት ማድረግ የሚፈልጉበት ምክንያት ምንድን ነው?</Label>
          <RadioGroup value={reportReason} onValueChange={setReportReason}>
            {reasons.map((reason) => (
              <div key={reason.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value={reason.id} id={reason.id} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={reason.id} className="font-medium cursor-pointer">
                    {reason.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Additional Description */}
        <div className="space-y-2">
          <Label htmlFor="description">ተጨማሪ መረጃ (አማራጭ)</Label>
          <Textarea
            id="description"
            placeholder="ተጨማሪ ዝርዝሮች ካሉዎት እዚህ ይጻፉ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="anonymous" 
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked === true)}
          />
          <Label htmlFor="anonymous" className="text-sm">
            ይህን ሪፖርት በማንነት መሰወር ይፈልጋሉ?
          </Label>
        </div>

        {/* Warning Notice */}
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <div className="font-medium">ማስታወሻ</div>
              <div>የውሸት ሪፖርት ማድረግ የመለያዎን እገዳ ሊያስከትል ይችላል</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1"
            disabled={submitting}
          >
            ይሰርዙ
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!reportReason || submitting}
            className="flex-1"
          >
            {submitting ? 'በመላክ ላይ...' : 'ሪፖርት ላክ'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}