import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GovButton } from '@/components/ui/gov-button';
import { 
  Shield, 
  Camera, 
  MapPin, 
  Award, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Users,
  FileCheck,
  TrendingUp
} from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/types';

export default function Landing() {
  const stats = [
    { label: 'Complaints Resolved', value: '15,000+', icon: CheckCircle },
    { label: 'Active Citizens', value: '50,000+', icon: Users },
    { label: 'Average Resolution', value: '48 hrs', icon: Clock },
    { label: 'Satisfaction Rate', value: '94%', icon: TrendingUp },
  ];

  const features = [
    {
      icon: Camera,
      title: 'Live Photo Capture',
      description: 'Capture issues in real-time directly from your camera for authentic reporting.'
    },
    {
      icon: MapPin,
      title: 'GPS Location',
      description: 'Automatic location tagging ensures precise complaint placement on the map.'
    },
    {
      icon: Award,
      title: 'Earn Rewards',
      description: 'Get 10 reward points for each resolved complaint, redeemable for government services.'
    },
    {
      icon: FileCheck,
      title: 'Track Status',
      description: 'Real-time tracking of your complaint status from submission to resolution.'
    },
  ];

  const categories = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({
    key,
    label,
    icon: CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS]
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative gov-hero-gradient text-primary-foreground py-20 md:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Government of Gujarat Initiative</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in">
              Smart Citizen
              <span className="block text-secondary">Complaint Portal</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-slide-up">
              Report civic issues instantly with live photos and GPS location. 
              Track resolution progress and earn rewards for your contribution to a better Gujarat.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/register">
                <GovButton variant="hero" size="xl">
                  Register Complaint
                  <ArrowRight className="w-5 h-5" />
                </GovButton>
              </Link>
              <Link to="/login">
                <GovButton variant="hero-outline" size="xl">
                  Track Status
                </GovButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple, transparent, and efficient civic complaint management for all citizens of Gujarat
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="gov-card p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-primary-foreground mb-4">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complaint Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Report issues across various civic categories for quick resolution
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div 
                key={category.key}
                className="gov-card p-4 text-center hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="text-sm font-medium text-foreground">{category.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status Legend */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Complaint Status Tracking
              </h2>
              <p className="text-muted-foreground">
                Monitor your complaint through every stage of resolution
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-pending/10 border border-pending/20">
                <AlertTriangle className="w-6 h-6 text-pending" />
                <div>
                  <div className="font-semibold text-pending">Pending</div>
                  <div className="text-xs text-muted-foreground">Awaiting Review</div>
                </div>
              </div>
              
              <div className="hidden md:block text-2xl text-muted-foreground">→</div>
              
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-inprogress/10 border border-inprogress/20">
                <Clock className="w-6 h-6 text-inprogress" />
                <div>
                  <div className="font-semibold text-inprogress">In Progress</div>
                  <div className="text-xs text-muted-foreground">Being Resolved</div>
                </div>
              </div>
              
              <div className="hidden md:block text-2xl text-muted-foreground">→</div>
              
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-completed/10 border border-completed/20">
                <CheckCircle className="w-6 h-6 text-completed" />
                <div>
                  <div className="font-semibold text-completed">Completed</div>
                  <div className="text-xs text-muted-foreground">+10 Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Be the Change Gujarat Needs
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join thousands of active citizens making Gujarat cleaner, safer, and better. 
            Your voice matters in building a smarter city.
          </p>
          <Link to="/register">
            <GovButton variant="secondary" size="xl">
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </GovButton>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
