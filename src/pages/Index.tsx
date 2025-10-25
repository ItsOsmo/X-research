import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Search, 
  Calendar, 
  CreditCard, 
  ArrowRight, 
  Sparkles, 
  Globe, 
  Shield, 
  Clock,
  TrendingUp,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const platformFeatures = [
    {
      icon: Search,
      title: 'Smart Participant Matching',
      description: 'AI-powered screening connects researchers with the perfect participants for their studies.'
    },
    {
      icon: Calendar,
      title: 'Seamless Scheduling',
      description: 'Automated scheduling system with calendar integration and timezone support.'
    },
    {
      icon: CreditCard,
      title: 'Automated Payouts',
      description: 'Secure payment processing with instant payouts via Stripe integration.'
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Verified participant profiles and quality scoring to ensure reliable data.'
    }
  ];

  const participantBenefits = [
    { icon: DollarSign, title: 'Earn Money', description: 'Get paid for sharing your opinions and insights' },
    { icon: Clock, title: 'Flexible Timing', description: 'Participate on your own schedule' },
    { icon: Globe, title: 'Remote & Local', description: 'Join studies from anywhere or in-person' },
    { icon: UserCheck, title: 'Verified Studies', description: 'All studies are vetted for legitimacy' }
  ];

  const researcherBenefits = [
    { icon: Users, title: 'Quality Participants', description: 'Access pre-screened, verified participants' },
    { icon: TrendingUp, title: 'Faster Recruitment', description: 'Reduce recruitment time by up to 80%' },
    { icon: Shield, title: 'Data Protection', description: 'GDPR-compliant data handling and storage' },
    { icon: Sparkles, title: 'AI-Powered Insights', description: 'Smart recommendations for better studies' }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, they'll be redirected by useEffect above
  // This component only shows the landing page for non-authenticated users

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <div className="p-4 bg-primary">
        <Navbar 
          logoText="xResearch"
          navLinks={[
            { text: "Features", href: "#features" },
            { text: "How It Works", href: "#learn-more" },
            { text: "About", href: "#learn-more" }
          ]}
          authLinks={[
            { type: 'link', text: "Sign In", href: "/auth" },
            { type: 'button-primary', text: "Get Started", href: "/auth" }
          ]}
        />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Spline 3D Background */}
        <div className="absolute inset-0 w-full h-full">
          <iframe 
            src='https://my.spline.design/orb-FZgc51U9N7ZBYNOIsVCghiUa/' 
            frameBorder='0' 
            width='100%' 
            height='100%'
            className="w-full h-full"
          />
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 z-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl drop-shadow-lg">
              The AI-Powered Research Platform
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/95 drop-shadow-md">
              Empower your team with an AI-powered platform to build forms, recruit participants, and get actionable insights fast. 
              It's the all-in-one collaborative workspace for researchers and participants.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                onClick={() => navigate('/auth')}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="test" 
                size="lg"
                className="border-white/30 text-white backdrop-blur-sm bg-white/10 hover:bg-white/20"
                onClick={() => document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id='features' className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Powerful Research Platform
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to run successful research studies, from recruitment to payment.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden shadow-card border-0 bg-card">
                <CardHeader className="pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="mt-4 text-lg font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-6">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dual User Experience */}
      <section className="py-16 sm:py-24 bg-form-builder">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for Both Sides
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you're conducting research or participating in studies, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Participants */}
            <Card className="border-0 shadow-form bg-card">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">For Participants</CardTitle>
                    <CardDescription>Earn money sharing your insights</CardDescription>
                  </div>
                </div>
                <div className="space-y-4">
                  {participantBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                        <benefit.icon className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <h4 className="font-medium">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-success hover:opacity-90"
                  onClick={() => navigate('/auth')}
                >
                  Browse Available Studies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Researchers */}
            <Card className="border-0 shadow-form bg-card">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">For Researchers</CardTitle>
                    <CardDescription>Find quality participants faster</CardDescription>
                  </div>
                </div>
                <div className="space-y-4">
                  {researcherBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <benefit.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  onClick={() => navigate('/auth')}
                >
                  Start Recruiting Participants
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Learn More Section */}
      <section id="learn-more" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our platform streamlines the entire research process, from participant recruitment to data collection and analysis.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-primary mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Create or Browse Studies</h3>
                <p className="text-muted-foreground">
                  Researchers create studies with AI-powered screening questions. Participants browse and apply to studies that match their interests and qualifications.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-primary mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Smart Matching & Scheduling</h3>
                <p className="text-muted-foreground">
                  Our AI-powered system matches qualified participants with researchers. Automated scheduling handles timezone coordination and calendar integration.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-primary mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Conduct & Get Paid</h3>
                <p className="text-muted-foreground">
                  Complete your research sessions with verified participants. Automatic payment processing ensures researchers get quality data and participants get paid instantly.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-gradient-primary hover:opacity-90"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;