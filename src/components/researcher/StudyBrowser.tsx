import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Star,
  Briefcase,
  Globe,
  X,
  RotateCcw
} from 'lucide-react';

interface CardStudy {
  id: string;
  title: string;
  description: string;
  compensation: number;
  duration: number;
  location: 'remote' | 'in-person' | 'hybrid';
  category: string;
  participants_needed: number;
  participants_current: number;
  requirements: string[];
  rating: number;
  company: string;
  deadline: string;
}

interface FilterState {
  compensationRange: [number, number];
  durationRange: [number, number];
  locations: string[];
  categories: string[];
  sortBy: string;
  showFilledStudies: boolean;
  deadlineFilter: string;
}

interface StudyBrowserProps {
  onBack: () => void;
}

export const StudyBrowser = ({ onBack }: StudyBrowserProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    compensationRange: [0, 200],
    durationRange: [0, 180],
    locations: [],
    categories: [],
    sortBy: 'relevance',
    showFilledStudies: true,
    deadlineFilter: 'all'
  });

  // Mock data - in real app this would come from database
  const studies: CardStudy[] = [
    {
      id: '1',
      title: 'User Interface Design Feedback Study',
      description: 'Help us improve our mobile app interface by providing feedback on new design concepts and navigation patterns.',
      compensation: 75,
      duration: 60,
      location: 'remote',
      category: 'UX Research',
      participants_needed: 20,
      participants_current: 12,
      requirements: ['Age 25-45', 'Mobile app users', 'Design experience helpful'],
      rating: 4.8,
      company: 'TechFlow',
      deadline: '2024-12-15'
    },
    {
      id: '2',
      title: 'Consumer Shopping Behavior Research',
      description: 'Share your online shopping habits and decision-making process to help improve e-commerce experiences.',
      compensation: 50,
      duration: 45,
      location: 'remote',
      category: 'Market Research',
      participants_needed: 15,
      participants_current: 8,
      requirements: ['Age 18+', 'Regular online shopper', 'US resident'],
      rating: 4.6,
      company: 'MarketInsights',
      deadline: '2024-12-20'
    },
    {
      id: '3',
      title: 'Healthcare Technology Usability Study',
      description: 'Test a new patient portal interface and provide feedback on usability and accessibility features.',
      compensation: 100,
      duration: 90,
      location: 'hybrid',
      category: 'Healthcare',
      participants_needed: 12,
      participants_current: 5,
      requirements: ['Age 50+', 'Healthcare experience', 'Technology comfortable'],
      rating: 4.9,
      company: 'HealthTech Solutions',
      deadline: '2024-12-10'
    },
    {
      id: '4',
      title: 'Financial Planning App Beta Test',
      description: 'Help us test our new personal finance app by using it for two weeks and providing detailed feedback.',
      compensation: 125,
      duration: 120,
      location: 'remote',
      category: 'Finance',
      participants_needed: 25,
      participants_current: 18,
      requirements: ['Age 25-55', 'Financial planning interest', 'iOS/Android'],
      rating: 4.7,
      company: 'FinanceFirst',
      deadline: '2024-12-25'
    }
  ];

  const categories = ['all', 'UX Research', 'Market Research', 'Healthcare', 'Finance', 'Technology'];
  const locations = ['remote', 'in-person', 'hybrid'];

  const resetFilters = () => {
    setFilters({
      compensationRange: [0, 200],
      durationRange: [0, 180],
      locations: [],
      categories: [],
      sortBy: 'relevance',
      showFilledStudies: true,
      deadlineFilter: 'all'
    });
    setSelectedCategory('all');
  };

  const applyAdvancedFilters = (study: CardStudy) => {
    // Compensation filter
    if (study.compensation < filters.compensationRange[0] || study.compensation > filters.compensationRange[1]) {
      return false;
    }

    // Duration filter
    if (study.duration < filters.durationRange[0] || study.duration > filters.durationRange[1]) {
      return false;
    }

    // Location filter
    if (filters.locations.length > 0 && !filters.locations.includes(study.location)) {
      return false;
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(study.category)) {
      return false;
    }

    // Filled studies filter
    if (!filters.showFilledStudies && study.participants_current >= study.participants_needed) {
      return false;
    }

    // Deadline filter
    const now = new Date();
    const studyDeadline = new Date(study.deadline);
    const daysDiff = Math.ceil((studyDeadline.getTime() - now.getTime()) / (1000 * 3600 * 24));

    switch (filters.deadlineFilter) {
      case 'week':
        if (daysDiff > 7) return false;
        break;
      case 'month':
        if (daysDiff > 30) return false;
        break;
      case 'urgent':
        if (daysDiff > 3) return false;
        break;
    }

    return true;
  };

  let filteredStudies = studies.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         study.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || study.category === selectedCategory;
    const matchesAdvancedFilters = applyAdvancedFilters(study);
    
    return matchesSearch && matchesCategory && matchesAdvancedFilters;
  });

  // Apply sorting
  switch (filters.sortBy) {
    case 'compensation-high':
      filteredStudies = filteredStudies.sort((a, b) => b.compensation - a.compensation);
      break;
    case 'compensation-low':
      filteredStudies = filteredStudies.sort((a, b) => a.compensation - b.compensation);
      break;
    case 'duration-short':
      filteredStudies = filteredStudies.sort((a, b) => a.duration - b.duration);
      break;
    case 'duration-long':
      filteredStudies = filteredStudies.sort((a, b) => b.duration - a.duration);
      break;
    case 'deadline':
      filteredStudies = filteredStudies.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      break;
    case 'rating':
      filteredStudies = filteredStudies.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filteredStudies = filteredStudies.sort((a, b) => b.id.localeCompare(a.id));
      break;
  }

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.compensationRange[0] > 0 || filters.compensationRange[1] < 200) count++;
    if (filters.durationRange[0] > 0 || filters.durationRange[1] < 180) count++;
    if (filters.locations.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (!filters.showFilledStudies) count++;
    if (filters.deadlineFilter !== 'all') count++;
    if (filters.sortBy !== 'relevance') count++;
    return count;
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'remote':
        return Globe;
      case 'in-person':
        return MapPin;
      case 'hybrid':
        return Briefcase;
      default:
        return Globe;
    }
  };

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'remote':
        return 'bg-success/10 text-success';
      case 'in-person':
        return 'bg-warning/10 text-warning';
      case 'hybrid':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Available Studies</h1>
              <p className="text-muted-foreground">Find research studies that match your interests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search studies by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 relative">
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                  {getActiveFiltersCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    Advanced Filters
                    <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Reset All
                    </Button>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Compensation Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Compensation Range</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.compensationRange}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, compensationRange: value as [number, number] }))}
                        max={200}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>${filters.compensationRange[0]}</span>
                        <span>${filters.compensationRange[1]}+</span>
                      </div>
                    </div>
                  </div>

                  {/* Duration Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Duration (minutes)</Label>
                    <div className="px-2">
                      <Slider
                        value={filters.durationRange}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, durationRange: value as [number, number] }))}
                        max={180}
                        min={0}
                        step={15}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>{filters.durationRange[0]} min</span>
                        <span>{filters.durationRange[1]}+ min</span>
                      </div>
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Location Type</Label>
                    <div className="space-y-2">
                      {locations.map((location) => (
                        <div key={location} className="flex items-center space-x-2">
                          <Checkbox
                            id={`location-${location}`}
                            checked={filters.locations.includes(location)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters(prev => ({
                                  ...prev,
                                  locations: [...prev.locations, location]
                                }));
                              } else {
                                setFilters(prev => ({
                                  ...prev,
                                  locations: prev.locations.filter(l => l !== location)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`location-${location}`} className="capitalize">
                            {location}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Categories</Label>
                    <div className="space-y-2">
                      {categories.filter(c => c !== 'all').map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={filters.categories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFilters(prev => ({
                                  ...prev,
                                  categories: [...prev.categories, category]
                                }));
                              } else {
                                setFilters(prev => ({
                                  ...prev,
                                  categories: prev.categories.filter(c => c !== category)
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`category-${category}`}>
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deadline Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Deadline</Label>
                    <Select value={filters.deadlineFilter} onValueChange={(value) => setFilters(prev => ({ ...prev, deadlineFilter: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select deadline range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All deadlines</SelectItem>
                        <SelectItem value="urgent">Next 3 days</SelectItem>
                        <SelectItem value="week">This week</SelectItem>
                        <SelectItem value="month">This month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Sort By</Label>
                    <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort studies by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="compensation-high">Highest Compensation</SelectItem>
                        <SelectItem value="compensation-low">Lowest Compensation</SelectItem>
                        <SelectItem value="duration-short">Shortest Duration</SelectItem>
                        <SelectItem value="duration-long">Longest Duration</SelectItem>
                        <SelectItem value="deadline">Soonest Deadline</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Show Filled Studies */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-filled"
                      checked={filters.showFilledStudies}
                      onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showFilledStudies: !!checked }))}
                    />
                    <Label htmlFor="show-filled">Show studies that are fully filled</Label>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => setShowAdvancedFilters(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={() => setShowAdvancedFilters(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {(filters.compensationRange[0] > 0 || filters.compensationRange[1] < 200) && (
                <Badge variant="secondary" className="gap-1">
                  ${filters.compensationRange[0]}-${filters.compensationRange[1]}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, compensationRange: [0, 200] }))} />
                </Badge>
              )}
              {(filters.durationRange[0] > 0 || filters.durationRange[1] < 180) && (
                <Badge variant="secondary" className="gap-1">
                  {filters.durationRange[0]}-{filters.durationRange[1]} min
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, durationRange: [0, 180] }))} />
                </Badge>
              )}
              {filters.locations.map(location => (
                <Badge key={location} variant="secondary" className="gap-1 capitalize">
                  {location}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, locations: prev.locations.filter(l => l !== location) }))} />
                </Badge>
              ))}
              {filters.categories.map(category => (
                <Badge key={category} variant="secondary" className="gap-1">
                  {category}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }))} />
                </Badge>
              ))}
              {!filters.showFilledStudies && (
                <Badge variant="secondary" className="gap-1">
                  Hide filled
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, showFilledStudies: true }))} />
                </Badge>
              )}
              {filters.deadlineFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.deadlineFilter === 'urgent' ? 'Next 3 days' : 
                   filters.deadlineFilter === 'week' ? 'This week' : 'This month'}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, deadlineFilter: 'all' }))} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-6 px-2 text-xs">
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            Found {filteredStudies.length} {filteredStudies.length === 1 ? 'study' : 'studies'}
            {getActiveFiltersCount() > 0 && ` with ${getActiveFiltersCount()} ${getActiveFiltersCount() === 1 ? 'filter' : 'filters'} applied`}
          </p>
          {filters.sortBy !== 'relevance' && (
            <p className="text-sm text-muted-foreground">
              Sorted by: {filters.sortBy.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}
            </p>
          )}
        </div>

        {/* Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStudies.map((study) => {
            const LocationIcon = getLocationIcon(study.location);
            const progressPercentage = (study.participants_current / study.participants_needed) * 100;
            
            return (
              <Card key={study.id} className="shadow-card border-0 hover:shadow-form transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {study.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          <span className="text-xs text-muted-foreground">{study.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{study.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">{study.company}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-success">${study.compensation}</div>
                      <div className="text-xs text-muted-foreground">compensation</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {study.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{study.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LocationIcon className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className={`text-xs ${getLocationColor(study.location)}`}>
                        {study.location}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{study.participants_current}/{study.participants_needed} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due {study.deadline}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{progressPercentage.toFixed(0)}% filled</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Requirements:</div>
                    <div className="flex flex-wrap gap-1">
                      {study.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button className="flex-1 bg-gradient-primary hover:opacity-90">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredStudies.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Studies Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find relevant studies.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};