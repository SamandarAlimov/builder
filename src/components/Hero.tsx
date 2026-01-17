import { ArrowRight, Award, Users, Building2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-construction.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Construction site"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="opacity-0 animate-slide-in-left">
            <span className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm border border-primary/30">
              Building Excellence Since 1998
            </span>
          </div>

          <h1 className="opacity-0 animate-slide-in-left animation-delay-200 font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-primary-foreground leading-none mb-6">
            BUILDING YOUR
            <span className="block text-gradient">VISION INTO</span>
            REALITY
          </h1>

          <p className="opacity-0 animate-fade-up animation-delay-400 text-primary-foreground/80 text-lg md:text-xl max-w-xl mb-8 leading-relaxed">
            From concept to completion, Alsamos Construction delivers exceptional quality 
            in commercial, residential, and industrial projects across the region.
          </p>

          <div className="opacity-0 animate-fade-up animation-delay-600 flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="xl" className="group" asChild>
              <a href="#contact">
                Start Your Project
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/projects">View Our Work</Link>
            </Button>
            <Button variant="heroOutline" size="xl" className="group" asChild>
              <Link to="/design-studio">
                <Sparkles className="h-5 w-5 mr-1" />
                AI Dizayn
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="opacity-0 animate-fade-up animation-delay-600 mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-lg">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-display text-3xl md:text-4xl text-primary-foreground">250+</span>
              </div>
              <span className="text-primary-foreground/60 text-sm">Projects Completed</span>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-display text-3xl md:text-4xl text-primary-foreground">120+</span>
              </div>
              <span className="text-primary-foreground/60 text-sm">Expert Team</span>
            </div>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-display text-3xl md:text-4xl text-primary-foreground">25+</span>
              </div>
              <span className="text-primary-foreground/60 text-sm">Years Experience</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/40 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary-foreground/60 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
