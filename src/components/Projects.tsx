import { ArrowUpRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import projectResidential from "@/assets/project-residential.jpg";
import projectCommercial from "@/assets/project-commercial.jpg";
import projectIndustrial from "@/assets/project-industrial.jpg";

interface Project {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  location: string | null;
  year: number | null;
  featured: boolean | null;
  status: string | null;
}

const defaultImages: Record<string, string> = {
  residential: projectResidential,
  commercial: projectCommercial,
  industrial: projectIndustrial,
};

const categoryLabels: Record<string, string> = {
  residential: "Turar-joy",
  commercial: "Tijorat",
  industrial: "Sanoat",
};

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const getProjectImage = (project: Project) => {
    if (project.image_url) return project.image_url;
    return defaultImages[project.category] || projectResidential;
  };

  return (
    <section id="projects" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <span className="text-primary font-semibold text-sm tracking-widest uppercase">Portfolio</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mt-2">
              TANLANGAN LOYIHALAR
            </h2>
          </div>
          <Button variant="outline" size="lg" className="mt-6 md:mt-0 group" asChild>
            <Link to="/projects">
              Barcha loyihalar
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>Hozircha loyihalar yo'q</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative overflow-hidden rounded-lg cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={getProjectImage(project)}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  {/* Always visible category tag */}
                  <div className="flex gap-2 mb-auto mt-4">
                    <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-semibold opacity-90">
                      {categoryLabels[project.category] || project.category}
                    </span>
                    {project.status === "in_progress" && (
                      <span className="inline-block bg-yellow-500 text-primary-foreground px-3 py-1 rounded text-xs font-semibold opacity-90">
                        Jarayonda
                      </span>
                    )}
                  </div>

                  {/* Hover content */}
                  <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="font-display text-2xl text-secondary-foreground mb-1">{project.title}</h3>
                    <p className="text-secondary-foreground/70 text-sm">
                      {project.location && `${project.location} • `}{project.year}
                    </p>
                    {project.description && (
                      <p className="text-secondary-foreground/60 text-sm mt-2 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;