import { Building2, Home, Factory, Hammer, HardHat, Ruler } from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "Commercial Construction",
    description: "Office buildings, retail spaces, and mixed-use developments built to the highest standards.",
  },
  {
    icon: Home,
    title: "Residential Projects",
    description: "Custom homes and residential complexes that combine comfort with modern design.",
  },
  {
    icon: Factory,
    title: "Industrial Facilities",
    description: "Warehouses, manufacturing plants, and logistics centers optimized for efficiency.",
  },
  {
    icon: Hammer,
    title: "Renovation & Remodeling",
    description: "Transform existing spaces with expert renovation and modernization services.",
  },
  {
    icon: HardHat,
    title: "Project Management",
    description: "End-to-end project oversight ensuring timely delivery and budget compliance.",
  },
  {
    icon: Ruler,
    title: "Design & Planning",
    description: "Comprehensive architectural and engineering planning for any scale of project.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-muted">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">What We Do</span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mt-2 mb-4">
            OUR SERVICES
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Comprehensive construction solutions tailored to meet the unique needs of every project, 
            from initial concept through final completion.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group bg-card p-8 rounded-lg shadow-soft hover:shadow-elevated transition-all duration-300 border border-border hover:border-primary/30"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 bg-gradient-primary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
