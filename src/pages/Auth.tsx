import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { normalizeEthiopianPhone, validateEthiopianPhone, formatEthiopianPhone } from '@/lib/phone';
import { Smartphone, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';

type AuthStep = 'phone' | 'verify';
type OTPChannel = 'sms' | 'telegram';

export default function Auth() {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otpChannel, setOtpChannel] = useState<OTPChannel>('sms');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  
  const { signUp, verifyOTP, resendOTP } = useAuth();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    
    if (!displayName.trim()) {
      setPhoneError('Please enter your name');
      return;
    }
    
    if (!validateEthiopianPhone(phoneNumber)) {
      setPhoneError('Please enter a valid Ethiopian phone number');
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = normalizeEthiopianPhone(phoneNumber);
      await signUp(normalizedPhone, displayName.trim(), otpChannel);
      setPhoneNumber(normalizedPhone);
      setStep('verify');
    } catch (error) {
      // Error is already handled in useAuth
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(phoneNumber, otp);
    } catch (error) {
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (channel: OTPChannel) => {
    setLoading(true);
    try {
      await resendOTP(phoneNumber, channel);
    } catch (error) {
      // Error is already handled in useAuth
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            የገበሬ ገበያ
          </h1>
          <p className="text-lg text-muted-foreground">
            Yegebere Gebeya
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Ethiopia's Trusted Livestock Platform
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {step === 'phone' ? 'Welcome' : 'Verify Your Phone'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'Enter your phone number to get started'
                : `Enter the 6-digit code sent to ${formatEthiopianPhone(phoneNumber)}`
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Enter your full name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={loading}
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="09xx xxx xxx or +251 9x xxx xxxx"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={loading}
                    className="text-base"
                  />
                  {phoneError && (
                    <p className="text-sm text-destructive">{phoneError}</p>
                  )}
                  {phoneNumber && validateEthiopianPhone(phoneNumber) && (
                    <p className="text-sm text-muted-foreground">
                      Formatted: {formatEthiopianPhone(normalizeEthiopianPhone(phoneNumber))}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Preferred verification method</Label>
                  <RadioGroup
                    value={otpChannel}
                    onValueChange={(value: OTPChannel) => setOtpChannel(value)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="sms" id="sms" />
                      <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                        <Smartphone className="h-4 w-4" />
                        SMS
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="telegram" id="telegram" />
                      <Label htmlFor="telegram" className="flex items-center gap-2 cursor-pointer">
                        <MessageSquare className="h-4 w-4" />
                        Telegram
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || !displayName.trim() || !phoneNumber}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP 
                    value={otp} 
                    onChange={setOtp}
                    maxLength={6}
                    disabled={loading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </Button>

                <div className="space-y-2">
                  <p className="text-sm text-center text-muted-foreground">
                    Didn't receive the code?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleResendOTP('sms')}
                      disabled={loading}
                    >
                      <Smartphone className="mr-1 h-3 w-3" />
                      Resend SMS
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleResendOTP('telegram')}
                      disabled={loading}
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Resend Telegram
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setStep('phone')}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Phone Number
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>By continuing, you agree to our Terms of Service</p>
          <p className="mt-1">Trusted by Ethiopian farmers nationwide</p>
        </div>
      </div>
    </div>
  );
}