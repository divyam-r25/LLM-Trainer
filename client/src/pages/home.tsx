import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Zap,
  Rocket,
  Brain,
  Clock,
  GitBranch,
  Code2,
  BarChart3,
  Check,
  X,
  Menu,
  ChevronRight,
  Github,
  Linkedin,
  Twitter,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import logoImage from "@assets/8bfed827-52ba-46fb-8296-0158062c5b28_1762612473771.jpg";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trialPersonaName, setTrialPersonaName] = useState("");
  const [trialIntent, setTrialIntent] = useState("");
  const [trialExample, setTrialExample] = useState("");
  const [trialResponse, setTrialResponse] = useState("");

  const trialSectionRef = useRef<HTMLDivElement>(null);

  const scrollToTrial = () => {
    trialSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // If we have trial data, prefill the persona form
      if (trialPersonaName || trialIntent) {
        const params = new URLSearchParams();
        if (trialPersonaName) params.set("name", trialPersonaName);
        if (trialIntent) params.set("intent", trialIntent);
        if (trialExample) params.set("example", trialExample);
        setLocation(`/personas/new?${params.toString()}`);
      } else {
        setLocation("/dashboard");
      }
    } else {
      // If not authenticated, redirect to login with returnTo
      if (trialPersonaName || trialIntent) {
        const params = new URLSearchParams();
        if (trialPersonaName) params.set("name", trialPersonaName);
        if (trialIntent) params.set("intent", trialIntent);
        if (trialExample) params.set("example", trialExample);
        window.location.href = `/api/login?returnTo=${encodeURIComponent(`/personas/new?${params.toString()}`)}`;
      } else {
        window.location.href = "/api/login";
      }
    }
  };

  const handleSimulatePersona = () => {
    if (!trialPersonaName || !trialIntent) {
      setTrialResponse("Please fill in persona name and intent to see a preview.");
      return;
    }

    // If authenticated, redirect to /personas/new with prefilled data
    if (isAuthenticated) {
      const params = new URLSearchParams({
        name: trialPersonaName,
        intent: trialIntent,
        ...(trialExample && { example: trialExample }),
      });
      setLocation(`/personas/new?${params.toString()}`);
      return;
    }

    // If not authenticated, show preview
    const samplePrompt = `You are ${trialPersonaName}. ${trialIntent}${
      trialExample ? `\n\nExample interaction:\n${trialExample}` : ""
    }`;

    setTrialResponse(
      `System Prompt Preview:\n\n"${samplePrompt}"\n\nThis persona is ready to be tested in the sandbox and deployed as an API!`
    );
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const features = [
    {
      icon: Brain,
      title: "No Fine-Tuning Needed",
      description: "Build specialized AI behavior instantly with intent descriptions and examples. No ML expertise required.",
    },
    {
      icon: Zap,
      title: "Real-Time Testing",
      description: "Test your persona live in our chat sandbox before deployment. Iterate quickly and refine behavior.",
    },
    {
      icon: Rocket,
      title: "API-Ready Deployment",
      description: "Publish with one click and get a secure REST API endpoint. Integrate anywhere in minutes.",
    },
  ];

  const comparisonData = [
    { criteria: "Setup Time", forgeAI: "Minutes", manual: "Hours" },
    { criteria: "Consistency", forgeAI: "Always identical output", manual: "Varies per prompt" },
    { criteria: "Versioning", forgeAI: "Automatic", manual: "Manual tracking" },
    { criteria: "API Integration", forgeAI: "Built-in", manual: "Custom scripting" },
    { criteria: "Reusability", forgeAI: "One-click", manual: "Copy-paste every time" },
    { criteria: "Analytics", forgeAI: "Included", manual: "None" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Founder @ TechStart",
      avatar: "SC",
      quote: "ForgeAI cut our AI integration time from weeks to hours. The persona system is brilliant.",
    },
    {
      name: "Marcus Rodriguez",
      role: "Lead Developer @ AppCo",
      avatar: "MR",
      quote: "Finally, a platform that makes custom AI accessible without the ML complexity. Game changer.",
    },
    {
      name: "Emily Watson",
      role: "Product Manager @ InnovateLab",
      avatar: "EW",
      quote: "The testing sandbox and instant deployment saved us countless development cycles.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover-elevate" data-testid="link-home-logo">
              <img src={logoImage} alt="ForgeAI" className="w-8 h-8 object-contain" />
              <span className="text-lg font-semibold">ForgeAI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-features"
              >
                Features
              </a>
              <a
                href="#comparison"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-comparison"
              >
                Comparison
              </a>
              <a
                href="#testimonials"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-testimonials"
              >
                Testimonials
              </a>
              
              {!isLoading && !isAuthenticated && (
                <>
                  <Button variant="ghost" onClick={() => window.location.href = "/api/login"} data-testid="button-login">
                    Login
                  </Button>
                  <Button onClick={handleGetStarted} data-testid="button-get-started-nav">
                    Get Started
                  </Button>
                </>
              )}
              
              {!isLoading && isAuthenticated && (
                <>
                  <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-dashboard">
                    Dashboard
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.email || "User"} />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" data-testid="menu-user-dropdown">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "User"}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" data-testid="menu-item-dashboard">
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = "/api/logout"} data-testid="menu-item-logout">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-sm text-muted-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-features"
                >
                  Features
                </a>
                <a
                  href="#comparison"
                  className="text-sm text-muted-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-comparison"
                >
                  Comparison
                </a>
                <a
                  href="#testimonials"
                  className="text-sm text-muted-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="link-mobile-testimonials"
                >
                  Testimonials
                </a>
                
                {!isLoading && !isAuthenticated && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start" 
                      onClick={() => window.location.href = "/api/login"} 
                      data-testid="button-mobile-login"
                    >
                      Login
                    </Button>
                    <Button size="sm" className="w-full" onClick={handleGetStarted} data-testid="button-mobile-get-started">
                      Get Started
                    </Button>
                  </>
                )}
                
                {!isLoading && isAuthenticated && (
                  <>
                    <Link href="/dashboard" className="text-sm text-muted-foreground" data-testid="link-mobile-dashboard">
                      Dashboard
                    </Link>
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.email || "User"} />
                          <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user?.email}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-destructive hover:text-destructive" 
                        onClick={() => window.location.href = "/api/logout"} 
                        data-testid="button-mobile-logout"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-delayed"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
          
          {/* Animated Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-gradient"></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit border border-primary/20 bg-primary/5 hover-elevate" data-testid="badge-hero">
                  <Sparkles className="w-3 h-3 mr-1 text-primary" />
                  <span className="font-medium">No Fine-Tuning Required</span>
                </Badge>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight" data-testid="text-hero-title">
                  <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent text-[64px] text-center">Train.Test. Deploy</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent text-[64px] text-center">
                    custom AI personas
                  </span>
                  <br />
                  <span className="text-foreground text-[64px]">in minutes.</span>
                </h1>
                
                <p className="lg:text-2xl text-muted-foreground max-w-xl text-[20px]" data-testid="text-hero-subtitle">
                  ForgeAI lets you build specialized AI assistants for your business or app - no fine-tuning required.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow" onClick={handleGetStarted} data-testid="button-start-trial">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2" onClick={scrollToTrial} data-testid="button-view-demo">
                  <Zap className="w-5 h-5 mr-2" />
                  View Demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium">Deploy in 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative flex items-center justify-center h-96 lg:h-[500px]">
              {/* Floating Cards Animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Card 1 */}
                  <div className="absolute top-0 left-1/4 w-48 h-32 bg-card border border-border rounded-lg p-4 shadow-xl animate-float-card-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold">AI Persona</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-primary/20 rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="absolute top-1/3 right-1/4 w-40 h-28 bg-card border border-border rounded-lg p-3 shadow-xl animate-float-card-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Code2 className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold">API Ready</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-primary/20 rounded w-full"></div>
                      <div className="h-2 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                  
                  {/* Card 3 */}
                  <div className="absolute bottom-1/4 left-1/3 w-44 h-30 bg-card border border-border rounded-lg p-3 shadow-xl animate-float-card-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold">Analytics</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-primary/20 rounded w-5/6"></div>
                      <div className="h-2 bg-muted rounded w-3/5"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow Effects */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
            </div>
          </div>
        </div>
      </section>
      {/* Why ForgeAI Section */}
      <section id="features" className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold" data-testid="text-features-title">
              Why ForgeAI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build production-ready AI personas without the complexity of fine-tuning or ML infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate transition-all" data-testid={`card-feature-${index}`}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Feature Comparison Section */}
      <section id="comparison" className="py-20 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold" data-testid="text-comparison-title">
              Why ForgeAI Beats Manual Prompting
            </h2>
            <p className="text-xl text-muted-foreground">
              See how ForgeAI compares to traditional manual prompt engineering.
            </p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-semibold">Criteria</th>
                      <th className="text-left p-4 font-semibold bg-primary/5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          ForgeAI
                        </div>
                      </th>
                      <th className="text-left p-4 font-semibold text-muted-foreground">Manual Prompting</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr key={index} className="border-b border-border last:border-0" data-testid={`row-comparison-${index}`}>
                        <td className="p-4 font-medium">{row.criteria}</td>
                        <td className="p-4 bg-primary/5">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-medium text-primary">{row.forgeAI}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <X className="w-4 h-4 flex-shrink-0" />
                            <span>{row.manual}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Trial Section */}
      <section ref={trialSectionRef} className="py-20 px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold" data-testid="text-trial-title">
              Try It Yourself
            </h2>
            <p className="text-xl text-muted-foreground">
              See how easy it is to create a custom AI persona - no signup required for this preview.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left - Input */}
            <Card data-testid="card-trial-input">
              <CardHeader>
                <CardTitle>Create Your Persona</CardTitle>
                <CardDescription>Define your AI's behavior in plain English</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Persona Name</label>
                  <Input
                    placeholder="e.g., Customer Support Assistant"
                    value={trialPersonaName}
                    onChange={(e) => setTrialPersonaName(e.target.value)}
                    data-testid="input-trial-name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Intent</label>
                  <Textarea
                    placeholder="e.g., Help customers troubleshoot technical issues with empathy and clarity"
                    value={trialIntent}
                    onChange={(e) => setTrialIntent(e.target.value)}
                    rows={3}
                    data-testid="input-trial-intent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Few-Shot Example (Optional)</label>
                  <Textarea
                    placeholder="User: My app won't open&#10;Assistant: I'd be happy to help! Let's start by..."
                    value={trialExample}
                    onChange={(e) => setTrialExample(e.target.value)}
                    rows={3}
                    data-testid="input-trial-example"
                  />
                </div>
                <Button onClick={handleSimulatePersona} className="w-full" data-testid="button-simulate">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Simulate Persona
                </Button>
              </CardContent>
            </Card>

            {/* Right - Output */}
            <Card data-testid="card-trial-output">
              <CardHeader>
                <CardTitle>Persona Preview</CardTitle>
                <CardDescription>See the generated system prompt</CardDescription>
              </CardHeader>
              <CardContent>
                {trialResponse ? (
                  <div className="p-4 rounded-lg bg-muted border border-border prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} data-testid="text-trial-response">
                      {trialResponse}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Fill in the form and click "Simulate Persona" to see a preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              {isAuthenticated ? "Start creating your personas!" : "Ready to build for real?"}
            </p>
            <Button size="lg" onClick={handleGetStarted} data-testid="button-create-account">
              {isAuthenticated ? "Go to Dashboard" : "Create Free Account"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold" data-testid="text-testimonials-title">
              Trusted by developers, startups, and creators
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-elevate transition-all" data-testid={`card-testimonial-${index}`}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logoImage} alt="ForgeAI" className="w-8 h-8 object-contain" />
                <span className="text-lg font-semibold">ForgeAI</span>
              </div>
              <p className="text-sm text-muted-foreground">Shape how your AI thinks.</p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-sm">
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground block" data-testid="link-footer-dashboard">
                  Dashboard
                </Link>
                <a href="#features" className="text-muted-foreground hover:text-foreground block">
                  Features
                </a>
                <a href="#comparison" className="text-muted-foreground hover:text-foreground block">
                  Comparison
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground block">
                  Documentation
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground block">
                  API Reference
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground block">
                  GitHub
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-md border border-border flex items-center justify-center hover-elevate transition-all"
                  data-testid="link-github"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-md border border-border flex items-center justify-center hover-elevate transition-all"
                  data-testid="link-linkedin"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-md border border-border flex items-center justify-center hover-elevate transition-all"
                  data-testid="link-twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p data-testid="text-footer-copyright">
              © 2025 ForgeAI. Built with ❤️ during Vibeathon Hackathon.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
