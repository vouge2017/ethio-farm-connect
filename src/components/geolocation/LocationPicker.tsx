import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface LocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  className?: string;
}

// Ethiopian administrative divisions data
const ethiopianRegions = [
  'አዲስ አበባ',
  'ኦሮሚያ',
  'አማራ',
  'ትግራይ',
  'ደቡብ ምዕራብ የኢትዮጵያ ህዝቦች',
  'አፋር',
  'ቤንሻንጉል ጉሙዝ',
  'ጋምቤላ',
  'ሀረሪ',
  'ሲዳማ',
  'ሶማሌ'
];

const zonesByRegion: Record<string, string[]> = {
  'አዲስ አበባ': ['አዲስ ከተማ'],
  'ኦሮሚያ': ['ሸዋ', 'አርሲ', 'ባሌ', 'ቦረና', 'ወለጋ', 'ጅማ', 'ሃረርጌ'],
  'አማራ': ['ሰሜን ጎንደር', 'ደቡብ ጎንደር', 'ሰሜን ሸዋ', 'ኦሮሚያ', 'ሰሜን ወሎ', 'ደቡብ ወሎ'],
  'ትግራይ': ['መካሌ', 'ኣድዋ', 'ሸሬ', 'ሃውዜን']
};

export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const [location, setLocation] = useState<LocationData>(
    value || {
      region: '',
      zone: '',
      woreda: '',
      kebele: ''
    }
  );
  const [gettingLocation, setGettingLocation] = useState(false);
  const { toast } = useToast();

  const updateLocation = (updates: Partial<LocationData>) => {
    const newLocation = { ...location, ...updates };
    setLocation(newLocation);
    onChange(newLocation);
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "ቦታ ማግኘት አይችልም",
        description: "የእርስዎ አሳሽ GPS አይደግፍም",
        variant: "destructive"
      });
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // In a real app, you'd use a reverse geocoding service
          // For now, we'll simulate getting the address
          const mockAddress = `ንግድ አካባቢ, አዲስ አበባ`;
          
          updateLocation({
            ...location,
            latitude,
            longitude,
            address: mockAddress
          });

          toast({
            title: "ቦታ ተገኘ",
            description: "የአሁኑ ቦታዎ በተሳካ ሁኔታ ተገኝቷል",
          });
        } catch (error) {
          toast({
            title: "አድራሻ ማግኘት አልተሳካም",
            description: "እባክዎ በእጅ ይሙሉ",
            variant: "destructive"
          });
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setGettingLocation(false);
        toast({
          title: "ቦታ ማግኘት አልተሳካም",
          description: "እባክዎ GPS ባለበት እርሳዎን ለሚያስችል ቦታ ይሄዱ",
          variant: "destructive"
        });
      }
    );
  };

  const availableZones = location.region ? zonesByRegion[location.region] || [] : [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          ቦታ ምረጡ
        </CardTitle>
        <CardDescription>
          የእንስሳቶዎ ቦታ በትክክል ይምረጡ
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Location Button */}
        <Button
          variant="outline"
          onClick={getCurrentLocation}
          disabled={gettingLocation}
          className="w-full"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {gettingLocation ? 'ቦታ በማግኘት ላይ...' : 'የአሁኑን ቦታ ተጠቀም'}
        </Button>

        {/* Region Selection */}
        <div className="space-y-2">
          <Label htmlFor="region">ክልል *</Label>
          <Select value={location.region} onValueChange={(value) => updateLocation({ region: value, zone: '', woreda: '', kebele: '' })}>
            <SelectTrigger>
              <SelectValue placeholder="ክልል ይምረጡ" />
            </SelectTrigger>
            <SelectContent>
              {ethiopianRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Zone Selection */}
        <div className="space-y-2">
          <Label htmlFor="zone">ዞን *</Label>
          <Select 
            value={location.zone} 
            onValueChange={(value) => updateLocation({ zone: value, woreda: '', kebele: '' })}
            disabled={!location.region}
          >
            <SelectTrigger>
              <SelectValue placeholder="ዞን ይምረጡ" />
            </SelectTrigger>
            <SelectContent>
              {availableZones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Woreda Input */}
        <div className="space-y-2">
          <Label htmlFor="woreda">ወረዳ *</Label>
          <Input
            id="woreda"
            placeholder="ወረዳ ይጻፉ"
            value={location.woreda}
            onChange={(e) => updateLocation({ woreda: e.target.value })}
            disabled={!location.zone}
          />
        </div>

        {/* Kebele Input */}
        <div className="space-y-2">
          <Label htmlFor="kebele">ቀበሌ</Label>
          <Input
            id="kebele"
            placeholder="ቀበሌ ይጻፉ (አማራጭ)"
            value={location.kebele}
            onChange={(e) => updateLocation({ kebele: e.target.value })}
          />
        </div>

        {/* Address Input */}
        <div className="space-y-2">
          <Label htmlFor="address">ዝርዝር አድራሻ</Label>
          <Input
            id="address"
            placeholder="ለምሳሌ: መንደር ስም፣ የተለየ ምልክት"
            value={location.address || ''}
            onChange={(e) => updateLocation({ address: e.target.value })}
          />
        </div>

        {/* Location Summary */}
        {location.region && location.zone && location.woreda && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-1">የተመረጠ ቦታ:</div>
            <div className="text-sm text-muted-foreground">
              {[location.kebele, location.woreda, location.zone, location.region]
                .filter(Boolean)
                .join(', ')}
              {location.address && `, ${location.address}`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}