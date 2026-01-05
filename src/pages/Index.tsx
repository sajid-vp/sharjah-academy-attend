import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, QrCode, Users, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <GraduationCap className="h-5 w-5 text-white" />
              <span className="text-sm font-medium text-white">Sharjah Education Academy</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
              Smart Attendance System
            </h1>
            <p className="mb-8 text-lg text-white/90 md:text-xl">
              Automated QR-based attendance tracking for hybrid academic models. 
              Save time, increase accuracy, and embrace modern education.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:flex-wrap">
              <Link to="/faculty">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-large">
                  <Users className="mr-2 h-5 w-5" />
                  Faculty Dashboard
                </Button>
              </Link>
              <Link to="/student">
                <Button size="lg" variant="outline" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto backdrop-blur-sm">
                  <QrCode className="mr-2 h-5 w-5" />
                  Student Portal
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20 sm:w-auto backdrop-blur-sm">
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Why Choose Our System?
          </h2>
          <p className="text-lg text-muted-foreground">
            Modern attendance management designed for today's hybrid classrooms
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-none p-6 shadow-medium transition-all hover:shadow-large">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              QR Code Technology
            </h3>
            <p className="text-muted-foreground">
              Secure, time-limited QR codes ensure attendance integrity and prevent cheating
            </p>
          </Card>

          <Card className="border-none p-6 shadow-medium transition-all hover:shadow-large">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-secondary">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Real-Time Tracking
            </h3>
            <p className="text-muted-foreground">
              Instant attendance updates with live status monitoring for faculty
            </p>
          </Card>

          <Card className="border-none p-6 shadow-medium transition-all hover:shadow-large">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              Hybrid Support
            </h3>
            <p className="text-muted-foreground">
              Seamlessly handles both in-person and online students simultaneously
            </p>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">90%</div>
              <div className="text-muted-foreground">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-secondary">99%</div>
              <div className="text-muted-foreground">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-accent">15-30s</div>
              <div className="text-muted-foreground">Per Session</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
