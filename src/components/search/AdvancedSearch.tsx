import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { MapPin, Filter, ChevronDown, X } from 'lucide-react';

interface SearchFilters {
  searchTerm: string;
  category: string;
  region: string;
  priceRange: [number, number];
  distanceRadius: number;
  animalType?: string;
  breed?: string;
  ageRange?: [number, number];
  gender?: string;
  sortBy: string;
  savedSearches: SavedSearch[];
}

interface SavedSearch {
  id: string;
  name: string;
  filters: Partial<SearchFilters>;
  createdAt: string;
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  onSaveSearch: (name: string) => void;
}

export const AdvancedSearch = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  onSaveSearch 
}: AdvancedSearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  const ethiopianRegions = [
    'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
    'Gambela', 'Harari', 'Oromia', 'Sidama', 'SNNP', 'Somali', 'Tigray'
  ];

  const animalTypes = ['cattle', 'goat', 'sheep', 'chicken', 'camel', 'donkey', 'horse'];
  const cattleBreeds = ['Holstein', 'Zebu', 'Boran', 'Horro', 'Arsi'];
  const goatBreeds = ['Boer', 'Somali', 'Afar', 'Arsi-Bale', 'Woyto-Guji'];

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.category !== 'all-categories') count++;
    if (filters.region !== 'all-regions') count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) count++;
    if (filters.animalType && filters.animalType !== 'all-animals') count++;
    if (filters.breed) count++;
    if (filters.gender && filters.gender !== 'all') count++;
    if (filters.ageRange && (filters.ageRange[0] > 0 || filters.ageRange[1] < 120)) count++;
    return count;
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim()) {
      onSaveSearch(saveSearchName);
      setSaveSearchName('');
    }
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    onFiltersChange({ ...filters, ...savedSearch.filters });
  };

  return (
    <Card className="mb-6">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Advanced Search
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary">{getActiveFiltersCount()} active</Badge>
                )}
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Basic Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Term</Label>
                <Input
                  id="search"
                  placeholder="Search listings..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">All Categories</SelectItem>
                    <SelectItem value="livestock">Livestock</SelectItem>
                    <SelectItem value="machinery">Machinery</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="feed">Feed</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="region">Region</Label>
                <Select value={filters.region} onValueChange={(value) => updateFilter('region', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-regions">All Regions</SelectItem>
                    {ethiopianRegions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <Label>Price Range (ETB)</Label>
              <div className="px-3 py-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                  max={1000000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>{filters.priceRange[0].toLocaleString()} ETB</span>
                  <span>{filters.priceRange[1].toLocaleString()} ETB</span>
                </div>
              </div>
            </div>

            {/* Distance Radius */}
            <div>
              <Label>Distance Radius (km)</Label>
              <div className="px-3 py-2">
                <Slider
                  value={[filters.distanceRadius]}
                  onValueChange={(value) => updateFilter('distanceRadius', value[0])}
                  max={500}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Any distance</span>
                  <span>Within {filters.distanceRadius} km</span>
                </div>
              </div>
            </div>

            {/* Livestock-specific filters */}
            {filters.category === 'livestock' && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-sm">Livestock Filters</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="animalType">Animal Type</Label>
                    <Select value={filters.animalType || ''} onValueChange={(value) => updateFilter('animalType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Animals" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-animals">All Animals</SelectItem>
                        {animalTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {filters.animalType && filters.animalType !== 'all-animals' && (
                    <div>
                      <Label htmlFor="breed">Breed</Label>
                      <Select value={filters.breed || ''} onValueChange={(value) => updateFilter('breed', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any Breed" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Breed</SelectItem>
                          {(filters.animalType === 'cattle' ? cattleBreeds : goatBreeds).map((breed) => (
                            <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={filters.gender || ''} onValueChange={(value) => updateFilter('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Gender</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Age Range (months)</Label>
                  <div className="px-3 py-2">
                    <Slider
                      value={filters.ageRange || [0, 120]}
                      onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
                      max={120}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{filters.ageRange?.[0] || 0} months</span>
                      <span>{filters.ageRange?.[1] || 120} months</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at_desc">Newest First</SelectItem>
                  <SelectItem value="created_at_asc">Oldest First</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="view_count_desc">Most Viewed</SelectItem>
                  <SelectItem value="distance_asc">Nearest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Saved Searches */}
            {filters.savedSearches.length > 0 && (
              <div className="border-t pt-4">
                <Label>Saved Searches</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.savedSearches.map((savedSearch) => (
                    <Button
                      key={savedSearch.id}
                      variant="outline"
                      size="sm"
                      onClick={() => loadSavedSearch(savedSearch)}
                      className="gap-2"
                    >
                      <MapPin className="h-3 w-3" />
                      {savedSearch.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Save Current Search */}
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Save this search as..."
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                />
                <Button onClick={handleSaveSearch} disabled={!saveSearchName.trim()}>
                  Save Search
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end border-t pt-4">
              <Button variant="outline" onClick={onClearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};