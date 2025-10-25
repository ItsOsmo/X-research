import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, Clock, CheckCircle, Search } from 'lucide-react';
import { StudyBrowser } from '../researcher/StudyBrowser';

const ParticipantDashboard = () => {
  const [showStudyBrowser, setShowStudyBrowser] = useState(false);

  if (showStudyBrowser) {
    return <StudyBrowser onBack={() => setShowStudyBrowser(false)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Participant Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome to your participant dashboard. Browse available studies and manage your participation.
            </p>
          </div>

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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ParticipantDashboard;