import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, Banknote, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentGatewayProps {
  amount: number;
  listingId: string;
  sellerId: string;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentCancel: () => void;
}

export function PaymentGateway({
  amount,
  listingId,
  sellerId,
  onPaymentSuccess,
  onPaymentCancel
}: PaymentGatewayProps) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "የመክፈያ ዘዴ ይምረጡ",
        description: "እባክዎ የመክፈያ ዘዴ ይምረጡ",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    
    try {
      // Simulate payment processing for Ethiopian payment methods
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      toast({
        title: "ክፍያ ተሳክቷል",
        description: `የንግድ መለያ ID: ${transactionId}`,
      });
      
      onPaymentSuccess(transactionId);
    } catch (error) {
      toast({
        title: "ክፍያ አልተሳካም",
        description: "እባክዎ እንደገና ይሞክሩ",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('am-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          የአስተማማኝ ክፍያ
        </CardTitle>
        <CardDescription>
          በእንስሳት ገበያ የተጠበቀ የክፍያ ስርዓት
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Amount Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>ጠቅላላ ገንዘብ:</span>
            <span>{formatCurrency(amount)}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            የአገልግሎት ወጪ ተካትቷል
          </div>
        </div>

        <Separator />

        {/* Payment Methods */}
        <div className="space-y-4">
          <Label className="text-base font-medium">የመክፈያ ዘዴ ይምረጡ</Label>
          
          <div className="grid gap-3">
            {/* Mobile Money */}
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'mobile' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setPaymentMethod('mobile')}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-medium">የሞባይል ገንዘብ</div>
                  <div className="text-sm text-muted-foreground">
                    M-Birr, HelloCash, AmolePay
                  </div>
                </div>
                <Badge variant="secondary">ታዋቂ</Badge>
              </div>
            </div>

            {/* Bank Transfer */}
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setPaymentMethod('bank')}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-medium">የባንክ ዝውውር</div>
                  <div className="text-sm text-muted-foreground">
                    CBE Birr, Telebirr, AwashBirr
                  </div>
                </div>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => setPaymentMethod('cash')}
            >
              <div className="flex items-center gap-3">
                <Banknote className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-medium">በመድረሻ ክፍያ</div>
                  <div className="text-sm text-muted-foreground">
                    እንስሳው ሲደርስ ይክፈሉ
                  </div>
                </div>
                <Badge variant="outline">አስተማማኝ</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Number Input for Mobile Money */}
        {paymentMethod === 'mobile' && (
          <div className="space-y-2">
            <Label htmlFor="phone">የስልክ ቁጥር</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+251 9XX XXX XXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-left"
            />
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-medium">የመረጃ ጥበቃ</div>
              <div>ገንዘብዎ እስኪያረጋግጡት ድረስ ለሻጩ አይላክም</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onPaymentCancel}
            className="flex-1"
            disabled={processing}
          >
            ይሰርዙ
          </Button>
          <Button 
            onClick={handlePayment}
            disabled={!paymentMethod || processing}
            className="flex-1"
          >
            {processing ? 'በሂደት ላይ...' : `${formatCurrency(amount)} ይክፈሉ`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}