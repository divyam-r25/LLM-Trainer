import { useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trialPersonaName, setTrialPersonaName] = useState("");
  const [trialIntent, setTrialIntent] = useState("");
  const [trialExample, setTrialExample] = useState("");
  const [trialResponse, setTrialResponse] = useState("");

  const trialSectionRef = useRef<HTMLDivElement>(null);

  const scrollToTrial = () => {
    trialSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSimulatePersona = () => {
    if (!trialPersonaName || !trialIntent) {
      setTrialResponse("Please fill in persona name and intent to see a preview.");
      return;
    }

    const samplePrompt = `You are ${trialPersonaName}. ${trialIntent}${
      trialExample ? `\n\nExample interaction:\n${trialExample}` : ""
    }`;

    setTrialResponse(
      `System Prompt Preview:\n\n"${samplePrompt}"\n\nThis persona is ready to be tested in the sandbox and deployed as an API!`
    );
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
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
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
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-dashboard">
                Dashboard
              </Link>
              <Button asChild data-testid="button-get-started-nav">
                <Link href="/dashboard">Get Started</Link>
              </Button>
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
                <Link href="/dashboard" className="text-sm text-muted-foreground" data-testid="link-mobile-dashboard">
                  Dashboard
                </Link>
                <Button asChild size="sm" className="w-full" data-testid="button-mobile-get-started">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit" data-testid="badge-hero">
                  <Sparkles className="w-3 h-3 mr-1" />
                  No Fine-Tuning Required
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-title">
                  Train. Test. Deploy custom AI personas — in minutes.
                </h1>
                <p className="text-xl text-muted-foreground" data-testid="text-hero-subtitle">
                  ForgeAI lets you build specialized AI assistants for your business or app — no fine-tuning required.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild data-testid="button-start-trial">
                  <Link href="/dashboard">
                    Start Free Trial
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" onClick={scrollToTrial} data-testid="button-view-demo">
                  View Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Deploy in 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Right Column - Persona Cards */}
            <div className="relative space-y-4">
              <Card className="hover-elevate transition-all" data-testid="card-persona-preview-1">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Customer Support Bot</div>
                      <div className="text-sm text-muted-foreground">Published • Ready</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                      Live
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate transition-all" data-testid="card-persona-preview-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-purple-500 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Code Review Assistant</div>
                      <div className="text-sm text-muted-foreground">Testing</div>
                    </div>
                    <Badge variant="secondary">
                      Draft
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-elevate transition-all" data-testid="card-persona-preview-3">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-orange-500 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Sales Assistant</div>
                      <div className="text-sm text-muted-foreground">Published • Ready</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                      Live
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>
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
              See how easy it is to create a custom AI persona — no signup required for this preview.
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
                  <div className="p-4 rounded-lg bg-muted border border-border">
                    <pre className="text-sm whitespace-pre-wrap font-mono" data-testid="text-trial-response">
                      {trialResponse}
                    </pre>
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
            <p className="text-muted-foreground mb-4">Ready to build for real?</p>
            <Button size="lg" asChild data-testid="button-create-account">
              <Link href="/dashboard">
                Create Free Account
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
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
                <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
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
