import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModernSidebar } from '@/components/ui/modern-side-bar';
import { ConversationsView } from './ConversationsView';
import { ParticipantGroupsView } from './ParticipantGroupsView';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  BarChart3, 
  Users, 
  Calendar, 
  DollarSign, 
  Settings,
  Eye,
  Edit,
  Download,
  Clock,
  FileText, 
  CheckCircle, 
  Search
} from 'lucide-react';
import { StudyCreator } from './StudyCreator';
import { StudyBrowser } from './StudyBrowser';
import { DashboardHeader } from './DashboardHeader';
import { StudyDataView } from './StudyDataView';
import { Navigate, useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { exportFormResponsesToCSV, getResponseCount } from '@/services/csvExportService';

interface Study {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  participants_target: number;
  participants_current: number;
  applications: number;
  compensation: number;
  duration: number;
  location: 'remote' | 'in-person' | 'hybrid';
  created_date: string;
  deadline: string;
}

interface DashboardProps {
  onBack?: () => void;
}

export const Dashboard = ({ onBack }: DashboardProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'conversations' | 'participant-groups'>('dashboard');
  const [showStudyBrowser, setShowStudyBrowser] = useState(false);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'researcher' | 'participant'>('participant');
  const [selectedStudyForData, setSelectedStudyForData] = useState<Study | null>(null);
  const [exportingStudyId, setExportingStudyId] = useState<string | null>(null);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    loadStudies();
  }, [user]);

  useEffect(() => {
    const loadResponseCounts = async () => {
      if (studies.length === 0) return;

      const counts: Record<string, number> = {};
      await Promise.all(
        studies.map(async (study) => {
          const count = await getResponseCount(study.id);
          counts[study.id] = count;
        })
      );
      setResponseCounts(counts);
    };

    loadResponseCounts();
  }, [studies]);

  const notifications = [
    { id: 1, message: "New message from John" },
    { id: 2, message: "Your report is ready" },
  ]

  const loadStudies = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('studies')
        .select('*')
        .eq('researcher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading studies:', error);
        return;
      }

      // Transform the data to match our interface
      const transformedStudies: Study[] = (data || []).map(study => ({
        id: study.id,
        title: study.title,
        description: study.description || '',
        status: study.status as Study['status'],
        participants_target: study.participants_needed || 0,
        participants_current: 0, // This would be calculated from participants table
        applications: 0, // This would be calculated from participants table
        compensation: study.compensation || 0,
        duration: study.duration || 0,
        location: study.location as Study['location'],
        created_date: new Date(study.created_at).toLocaleDateString(),
        deadline: study.deadline || ''
      }));

      setStudies(transformedStudies);
    } catch (error) {
      console.error('Error loading studies:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total_studies: studies.length,
    active_studies: studies.filter(s => s.status === 'active').length,
    total_participants: studies.reduce((sum, s) => sum + s.participants_current, 0),
    total_spent: studies.reduce((sum, s) => sum + (s.participants_current * s.compensation), 0)
  };

  const handleExportResponses = async (study: Study) => {
    try {
      setExportingStudyId(study.id);
      await exportFormResponsesToCSV(study.id, study.title);
      toast({
        title: 'Export successful',
        description: `Form responses exported to CSV file`
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: error.message || 'Failed to export responses',
        variant: 'destructive'
      });
    } finally {
      setExportingStudyId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      case 'draft':
        return 'bg-warning text-warning-foreground';
      case 'paused':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (showStudyBrowser) {
    return <StudyBrowser onBack={() => setShowStudyBrowser(false)} />;
  }

  const renderDashboardContent = () => {
    return (
      <div className="space-y-6">
        {/* Dashboard Header */}
        {role === 'researcher' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Studies</p>
                      <p className="text-2xl font-bold">{stats.total_studies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                      <Users className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Studies</p>
                      <p className="text-2xl font-bold">{stats.active_studies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                      <Users className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Participants</p>
                      <p className="text-2xl font-bold">{stats.total_participants}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                      <DollarSign className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold">${stats.total_spent}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Study cards */}
            <Button onClick={() => {
              const study_id = crypto.randomUUID();
              navigate(`/study/${study_id}`);
            }} className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Create Study
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading studies...</p>
                </div>
              ) : studies.length === 0 ? (
                <div className="col-span-full">
                  <Card className="border-dashed border-2 border-border bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No Studies Yet
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        Create your first research study to start collecting valuable insights from participants.
                      </p>
                      <Button onClick={() => {
                        const study_id = crypto.randomUUID();
                        navigate(`/study/${study_id}`);
                      }} className="bg-gradient-primary hover:opacity-90">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Study
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                studies.map((study) => {
                const progressPercentage = (study.participants_current / study.participants_target) * 100;
                
                return (
                  <Card key={study.id} className="shadow-card border-0">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(study.status)}>
                              {study.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Created {study.created_date}
                            </span>
                          </div>
                          <CardTitle className="text-lg">{study.title}</CardTitle>
                          <CardDescription className="mt-1">{study.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              navigate(`/study/${study.id}`);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{study.participants_current}/{study.participants_target}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${study.compensation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{study.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{study.deadline}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Participants Progress</span>
                          <span>{progressPercentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleExportResponses(study)}
                          disabled={exportingStudyId === study.id || (responseCounts[study.id] || 0) === 0}
                        >
                          {exportingStudyId === study.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                              Exporting...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Export Data ({responseCounts[study.id] || 0})
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedStudyForData(study)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Data Files
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
            </div>
          </>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Studies</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Studies you can join
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">
                    Studies you're participating in
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    Studies you've completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Study Browser Section */}
            <Card>
              <CardHeader>
                <CardTitle>Available Studies</CardTitle>
                <CardDescription>
                  Browse and join studies that match your interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">User Experience Study</h3>
                      <p className="text-sm text-muted-foreground">Evaluating mobile app interfaces</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-secondary px-2 py-1 rounded">30 minutes</span>
                        <span className="text-xs bg-secondary px-2 py-1 rounded">$15 reward</span>
                      </div>
                    </div>
                    <Button variant="outline">View Details</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Survey: Technology Usage</h3>
                      <p className="text-sm text-muted-foreground">Understanding daily technology habits</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-secondary px-2 py-1 rounded">15 minutes</span>
                        <span className="text-xs bg-secondary px-2 py-1 rounded">$10 reward</span>
                      </div>
                    </div>
                    <Button variant="outline">View Details</Button>
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <Button 
                      onClick={() => setShowStudyBrowser(true)}
                      className="w-full bg-gradient-primary hover:opacity-90"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Browse All Studies
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (activeSection) {
      case 'conversations':
        return <ConversationsView />;
      case 'participant-groups':
        return <ParticipantGroupsView />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <>
      <div className="w-full flex bg-background">
        <ModernSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={onBack}
        />

        <main className="p-6 w-full">
          <DashboardHeader role={role} setRole={setRole}/>
          {renderCurrentView()}
        </main>
      </div>

      <Dialog open={!!selectedStudyForData} onOpenChange={() => setSelectedStudyForData(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Study Data Files - {selectedStudyForData?.title}</DialogTitle>
          </DialogHeader>
          {selectedStudyForData && (
            <StudyDataView
              studyId={selectedStudyForData.id}
              studyTitle={selectedStudyForData.title}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};