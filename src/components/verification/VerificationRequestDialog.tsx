import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Shield, Star, Upload } from 'lucide-react';
import { MediaUpload } from '@/components/media/MediaUpload';

interface VerificationRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  currentTier?: string;
}

type VerificationTier = 'free' | 'basic' | 'premium';

export const VerificationRequestDialog = ({ open, onOpenChange, listingId, currentTier }: VerificationRequestDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<VerificationTier>('basic');
  const [documents, setDocuments] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const tierInfo = {
    free: {
      name: 'Free',
      icon: CheckCircle,
      color: 'text-gray-500',
      price: 'Free',
      features: ['Basic listing', 'No verification badge', 'Standard visibility']
    },
    basic: {
      name: 'Basic',
      icon: Shield,
      color: 'text-blue-500',
      price: '500 ETB',
      features: ['Verified badge', 'ID verification', 'Higher visibility', 'Trust indicator']
    },
    premium: {
      name: 'Premium',
      icon: Star,
      color: 'text-yellow-500',
      price: '1,500 ETB',
      features: ['Premium badge', 'Full verification', 'Top placement', 'Priority support', 'Featured listing']
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (selectedTier !== 'free' && documents.length === 0) {
      toast({
        title: "Documents Required",
        description: "Please upload verification documents",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('verification_requests')
        .insert({
          listing_id: listingId,
          requester_id: user.id,
          tier: selectedTier,
          documents: documents.length > 0 ? { files: documents, notes } : null
        });

      if (error) throw error;

      // Create notification for admin
      await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_type: 'verification',
        p_title: 'Verification Request Submitted',
        p_message: `Your ${tierInfo[selectedTier].name} verification request has been submitted for review`,
        p_metadata: { listing_id: listingId, tier: selectedTier }
      });

      toast({
        title: "Success",
        description: "Verification request submitted successfully"
      });

      onOpenChange(false);
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

  const handleDocumentsUploaded = (urls: string[]) => {
    setDocuments(urls);
    setShowUpload(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Verification</DialogTitle>
            <DialogDescription>
              Choose a verification tier to enhance your listing's credibility
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Tier */}
            {currentTier && currentTier !== 'free' && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Current tier: <Badge variant="secondary">{currentTier}</Badge>
                </p>
              </div>
            )}

            {/* Tier Selection */}
            <div className="space-y-2">
              <Label>Select Verification Tier</Label>
              <Select value={selectedTier} onValueChange={(value) => setSelectedTier(value as VerificationTier)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tierInfo).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <info.icon className={`h-4 w-4 ${info.color}`} />
                        <span>{info.name} - {info.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tier Features */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                {(() => {
                  const Icon = tierInfo[selectedTier].icon;
                  return <Icon className={`h-5 w-5 ${tierInfo[selectedTier].color}`} />;
                })()}
                <h3 className="font-semibold">{tierInfo[selectedTier].name} Verification</h3>
                <Badge variant="outline">{tierInfo[selectedTier].price}</Badge>
              </div>
              <ul className="space-y-2">
                {tierInfo[selectedTier].features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Document Upload */}
            {selectedTier !== 'free' && (
              <div className="space-y-2">
                <Label>Verification Documents *</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpload(true)}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents ({documents.length} uploaded)
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Required: National ID, Business license, or ownership documents
                  </p>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {selectedTier !== 'free' && (
              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information for the verification team..."
                  rows={3}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Upload Dialog */}
      {showUpload && (
        <MediaUpload
          bucketName="listing-photos"
          onUploadComplete={handleDocumentsUploaded}
          maxFiles={5}
          acceptedFileTypes={{ 'image/*': ['.jpg', '.jpeg', '.png', '.pdf'] }}
        />
      )}
    </>
  );
};