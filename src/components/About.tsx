import { CheckCircle2 } from "lucide-react";

const values = [
  "Quality craftsmanship in every project",
  "On-time and on-budget delivery",
  "Safety-first work environment",
  "Sustainable building practices",
  "Transparent communication",
  "Long-term client partnerships",
];

const About = () => {
  return (
    <section id="about" className="py-24 bg-gradient-dark text-secondary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">About Us</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-secondary-foreground mt-2 mb-6">
              BUILDING TRUST
              <span className="block text-gradient">SINCE 1998</span>
            </h2>
            <p className="text-secondary-foreground/70 text-lg leading-relaxed mb-8">
              For over 25 years, Alsamos Construction has been a leader in the construction industry, 
              delivering exceptional projects that stand the test of time. Our commitment to excellence, 
              innovation, and client satisfaction has made us the trusted choice for construction projects 
              of all sizes.
            </p>
            <p className="text-secondary-foreground/70 text-lg leading-relaxed mb-8">
              From modest beginnings to becoming a regional construction powerhouse, our journey is 
              marked by landmark projects, satisfied clients, and a team of dedicated professionals 
              who take pride in their craft.
            </p>

            {/* Values List */}
            <div className="grid sm:grid-cols-2 gap-4">
              {values.map((value) => (
                <div key={value} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-secondary-foreground/80">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-secondary/10 backdrop-blur-sm border border-secondary-foreground/10 p-4 sm:p-8 rounded-lg text-center">
              <span className="font-display text-3xl sm:text-5xl md:text-6xl text-gradient">$2B+</span>
              <p className="text-secondary-foreground/60 mt-2 text-sm sm:text-base">Projects Value</p>
            </div>
            <div className="bg-secondary/10 backdrop-blur-sm border border-secondary-foreground/10 p-4 sm:p-8 rounded-lg text-center">
              <span className="font-display text-3xl sm:text-5xl md:text-6xl text-gradient">250+</span>
              <p className="text-secondary-foreground/60 mt-2 text-sm sm:text-base">Completed Projects</p>
            </div>
            <div className="bg-secondary/10 backdrop-blur-sm border border-secondary-foreground/10 p-4 sm:p-8 rounded-lg text-center">
              <span className="font-display text-3xl sm:text-5xl md:text-6xl text-gradient">120+</span>
              <p className="text-secondary-foreground/60 mt-2 text-sm sm:text-base">Team Members</p>
            </div>
            <div className="bg-secondary/10 backdrop-blur-sm border border-secondary-foreground/10 p-4 sm:p-8 rounded-lg text-center">
              <span className="font-display text-3xl sm:text-5xl md:text-6xl text-gradient">98%</span>
              <p className="text-secondary-foreground/60 mt-2 text-sm sm:text-base">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
