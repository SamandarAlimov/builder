import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import logo from "@/assets/alsamos-logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-dark text-secondary-foreground py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src={logo} alt="Alsamos Construction" className="h-10 w-auto" />
              <div>
                <span className="font-display text-xl text-secondary-foreground tracking-wide">ALSAMOS</span>
                <span className="block text-xs text-secondary-foreground/60 tracking-widest uppercase">Construction</span>
              </div>
            </div>
            <p className="text-secondary-foreground/60 mb-6 leading-relaxed">
              Building excellence for over 25 years. Your trusted partner for construction projects of any scale.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg text-secondary-foreground mb-6 tracking-wide">SERVICES</h4>
            <ul className="space-y-3">
              <li><a href="#services" className="text-secondary-foreground/60 hover:text-primary transition-colors">Commercial Construction</a></li>
              <li><a href="#services" className="text-secondary-foreground/60 hover:text-primary transition-colors">Residential Projects</a></li>
              <li><a href="#services" className="text-secondary-foreground/60 hover:text-primary transition-colors">Industrial Facilities</a></li>
              <li><a href="#services" className="text-secondary-foreground/60 hover:text-primary transition-colors">Renovation</a></li>
              <li><a href="#services" className="text-secondary-foreground/60 hover:text-primary transition-colors">Project Management</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-lg text-secondary-foreground mb-6 tracking-wide">COMPANY</h4>
            <ul className="space-y-3">
              <li><a href="#about" className="text-secondary-foreground/60 hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#projects" className="text-secondary-foreground/60 hover:text-primary transition-colors">Our Projects</a></li>
              <li><a href="#" className="text-secondary-foreground/60 hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-secondary-foreground/60 hover:text-primary transition-colors">News</a></li>
              <li><a href="#contact" className="text-secondary-foreground/60 hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-lg text-secondary-foreground mb-6 tracking-wide">NEWSLETTER</h4>
            <p className="text-secondary-foreground/60 mb-4">
              Subscribe to our newsletter for updates on our latest projects and industry insights.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 min-w-0 px-4 py-3 bg-secondary-foreground/10 border border-secondary-foreground/20 rounded-md text-secondary-foreground placeholder:text-secondary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-foreground/50 text-sm">
            © 2024 Alsamos Construction. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-secondary-foreground/50 hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-secondary-foreground/50 hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-secondary-foreground/50 hover:text-primary transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
