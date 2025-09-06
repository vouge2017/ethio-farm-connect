import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Phone, Clock, Star, GraduationCap, Stethoscope, Calendar, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface VetProfile {
  id: string;
  user_id: string;
  license_number: string;
  education?: string;
  specializations?: string[];
  years_experience?: number;
  bio?: string;
  consultation_fee?: number;
  service_areas?: string[];
  available_hours?: string;
  is_verified: boolean;
  created_at: string;
  profiles?: {
    display_name: string;
    location_region?: string;
    location_zone?: string;
    phone_number?: string;
  };
}

export default function Veterinarians() {
  const [vets, setVets] = useState<VetProfile[]>([]);
  const [selectedVet, setSelectedVet] = useState<VetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [showBooking, setShowBooking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchVets();
  }, []);

  const fetchVets = async () => {
    try {
      const { data, error } = await supabase
        .from('vet_profiles')
        .select(`
          *,
          profiles!vet_profiles_user_id_fkey(
            display_name,
            location_region,
            location_zone,
            phone_number
          )
        `)
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVets(data || []);
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

  const handleBookConsultation = (vet: VetProfile) => {
    setSelectedVet(vet);
    setShowBooking(true);
  };

  const handleSendMessage = async (vetId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact veterinarians",
        variant: "destructive"
      });
      return;
    }

    // This would typically create a conversation or redirect to messaging
    // For now, we'll show a placeholder
    toast({
      title: "Feature Coming Soon",
      description: "Direct messaging with veterinarians will be available soon",
    });
  };

  const filteredVets = vets.filter(vet => {
    const name = vet.profiles?.display_name?.toLowerCase() || '';
    const bio = vet.bio?.toLowerCase() || '';
    const education = vet.education?.toLowerCase() || '';
    
    const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                         bio.includes(searchTerm.toLowerCase()) ||
                         education.includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || 
                         vet.profiles?.location_region === selectedRegion;
    
    const matchesSpecialization = selectedSpecialization === 'all' ||
                                 (vet.specializations && vet.specializations.includes(selectedSpecialization));
    
    return matchesSearch && matchesRegion && matchesSpecialization;
  });

  const regions = Array.from(new Set(vets.map(vet => vet.profiles?.location_region).filter(Boolean)));
  const specializations = Array.from(new Set(vets.flatMap(vet => vet.specializations || [])));

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            👨‍⚕️ Veterinarians
          </h1>
          <p className="text-lg text-muted-foreground mb-2">Connect with qualified veterinarians across Ethiopia</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>🩺 {vets.length} verified vets</span>
            <span>⭐ Professional service</span>
            <span>📞 Direct consultation</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search veterinarians..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger>
            <SelectValue placeholder="All Regions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {regions.map((region) => (
              <SelectItem key={region} value={region!}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
          <SelectTrigger>
            <SelectValue placeholder="All Specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={fetchVets}>
          <Stethoscope className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Veterinarians Grid */}
      {filteredVets.length === 0 ? (
        <Card className="text-center py-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-dashed border-2 border-primary/20">
          <CardContent>
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold mb-2 text-primary">No Veterinarians Found</h3>
            <p className="text-muted-foreground">
              Try different search terms or change the filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVets.map((vet) => (
            <Card 
              key={vet.id} 
              className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-accent/20 hover:border-l-accent"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-accent" />
                      Dr. {vet.profiles?.display_name || 'Anonymous'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {vet.profiles?.location_region && vet.profiles?.location_zone ? 
                        `${vet.profiles.location_zone}, ${vet.profiles.location_region}` :
                        vet.profiles?.location_region || 'Location not specified'
                      }
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    Verified
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {vet.education && (
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <p className="text-sm">{vet.education}</p>
                  </div>
                )}
                
                {vet.years_experience && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{vet.years_experience} years experience</span>
                  </div>
                )}
                
                {vet.specializations && vet.specializations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Specializations:</p>
                    <div className="flex flex-wrap gap-1">
                      {vet.specializations.slice(0, 3).map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {vet.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{vet.specializations.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {vet.consultation_fee && (
                  <div className="text-sm">
                    <span className="font-medium">Consultation Fee: </span>
                    <span className="text-primary font-semibold">{vet.consultation_fee} ETB</span>
                  </div>
                )}
                
                {vet.available_hours && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{vet.available_hours}</span>
                  </div>
                )}
                
                {vet.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {vet.bio}
                  </p>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleBookConsultation(vet)}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Book Consultation
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSendMessage(vet.user_id)}
                  >
                    <Phone className="h-4 w-4" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Consultation</DialogTitle>
            <DialogDescription>
              Schedule a consultation with Dr. {selectedVet?.profiles?.display_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Veterinarian:</span>
                    <span className="font-medium">Dr. {selectedVet?.profiles?.display_name}</span>
                  </div>
                  {selectedVet?.consultation_fee && (
                    <div className="flex justify-between">
                      <span>Consultation Fee:</span>
                      <span className="font-medium text-primary">{selectedVet.consultation_fee} ETB</span>
                    </div>
                  )}
                  {selectedVet?.available_hours && (
                    <div className="flex justify-between">
                      <span>Available Hours:</span>
                      <span className="font-medium">{selectedVet.available_hours}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Booking system is coming soon. For now, please contact the veterinarian directly.
              </p>
              {selectedVet?.profiles?.phone_number && (
                <p className="mt-2 font-medium">
                  Phone: {selectedVet.profiles.phone_number}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowBooking(false)}>
                Close
              </Button>
              <Button 
                className="flex-1"
                onClick={() => {
                  setShowBooking(false);
                  if (selectedVet) {
                    handleSendMessage(selectedVet.user_id);
                  }
                }}
              >
                Contact Vet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}