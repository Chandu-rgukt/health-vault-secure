import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Share2, Activity, FileText, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl gradient-primary">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">Health Wallet</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button className="gradient-primary">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Shield className="w-4 h-4" />
          Secure & Private Health Records
        </div>
        <h1 className="text-4xl md-6xl font-display font-bold text-foreground max-w-4xl mx-auto leading-tight">
          Your Complete Health History,{' '}
          <span className="text-primary">Accessible Anywhere</span>
        </h1>
        <p className="text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
          Store, track, and share your medical reports and vitals securely. 
          Access your health records anytime, from any device.
        </p>
        <div className="flex flex-col sm-row items-center justify-center gap-4 mt-10">
          <Link to="/register">
            <Button size="lg" className="gradient-primary text-lg px-8 py-6">
              Create Your Health Wallet
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <h2 className="text-3xl font-display font-bold text-center mb-12">
          Everything You Need for Health Management
        </h2>
        <div className="grid grid-cols-1 md-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-card shadow-lg border-0 hover-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">Store Reports</h3>
            <p className="text-muted-foreground">
              Upload and organize all your medical reports, prescriptions, and test results in one secure place.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card shadow-lg border-0 hover-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">Track Vitals</h3>
            <p className="text-muted-foreground">
              Monitor blood pressure, heart rate, blood sugar, and more with beautiful trend charts.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-card shadow-lg border-0 hover-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-info" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">Share Securely</h3>
            <p className="text-muted-foreground">
              Share specific reports with doctors, family, or caregivers with controlled read-only access.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <span className="font-display font-semibold">Health Wallet</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Health Wallet. Your health, your data, your control.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;


