import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Award, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VerificationLevel = 'unverified' | 'phone' | 'identity' | 'premium';

interface VerificationBadgeProps {
  level: VerificationLevel;
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

const verificationConfig = {
  unverified: {
    label: 'አልተረጋገጠም',
    icon: Clock,
    variant: 'secondary' as const,
    color: 'text-muted-foreground'
  },
  phone: {
    label: 'ስልክ ተረጋግጧል',
    icon: CheckCircle,
    variant: 'default' as const,
    color: 'text-blue-600'
  },
  identity: {
    label: 'መታወቂያ ተረጋግጧል',
    icon: Shield,
    variant: 'default' as const,
    color: 'text-green-600'
  },
  premium: {
    label: 'የተመረጠ ነጋዴ',
    icon: Award,
    variant: 'default' as const,
    color: 'text-amber-600'
  }
};

export function VerificationBadge({
  level,
  className,
  showIcon = true,
  showText = true
}: VerificationBadgeProps) {
  const config = verificationConfig[level];
  const Icon = config.icon;

  if (level === 'unverified') {
    return null; // Don't show badge for unverified users
  }

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        "flex items-center gap-1",
        config.color,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {showText && <span>{config.label}</span>}
    </Badge>
  );
}

interface VerificationStatusProps {
  level: VerificationLevel;
  className?: string;
}

export function VerificationStatus({ level, className }: VerificationStatusProps) {
  const getStatusMessage = (level: VerificationLevel) => {
    switch (level) {
      case 'unverified':
        return {
          title: 'መለያዎ አልተረጋገጠም',
          description: 'የስልክ ቁጥርዎን ያረጋግጡ',
          color: 'text-muted-foreground'
        };
      case 'phone':
        return {
          title: 'የስልክ ቁጥር ተረጋግጧል',
          description: 'መታወቂያዎን ይላኩ',
          color: 'text-blue-600'
        };
      case 'identity':
        return {
          title: 'መታወቂያ ተረጋግጧል',
          description: 'የተረጋገጠ ሻጭ ነዎት',
          color: 'text-green-600'
        };
      case 'premium':
        return {
          title: 'የተመረጠ ነጋዴ',
          description: 'ልዩ ጥቅሞች አለዎት',
          color: 'text-amber-600'
        };
    }
  };

  const status = getStatusMessage(level);

  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn("font-medium", status.color)}>
        {status.title}
      </div>
      <div className="text-sm text-muted-foreground">
        {status.description}
      </div>
    </div>
  );
}