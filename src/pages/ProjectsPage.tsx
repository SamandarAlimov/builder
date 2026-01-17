import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import ProjectDetailModal from "@/components/ProjectDetailModal";
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

const statusLabels: Record<string, string> = {
  completed: "Tugallangan",
  in_progress: "Jarayonda",
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const getProjectImage = (project: Project) => {
    if (project.image_url) return project.image_url;
    return defaultImages[project.category] || projectResidential;
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ["all", "residential", "commercial", "industrial"];
  const statuses = ["all", "completed", "in_progress"];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary py-20 pt-28">
        <div className="container mx-auto px-4 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>Bosh sahifa</span>
          </Link>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground">
            BARCHA LOYIHALAR
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Bizning bajarilgan va jarayondagi barcha loyihalarimiz bilan tanishing.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Loyihalarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Kategoriya:</span>
            </div>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "all" ? "Barchasi" : categoryLabels[category] || category}
              </Button>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-muted-foreground">Holat:</span>
          {statuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(status)}
            >
              {status === "all" ? "Barchasi" : statusLabels[status] || status}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 lg:px-8 pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>Loyihalar topilmadi</p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              {filteredProjects.length} ta loyiha topildi
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  className="group relative overflow-hidden rounded-lg cursor-pointer bg-card border border-border hover:border-primary/50 transition-all"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={getProjectImage(project)}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex gap-2 mb-3">
                      <span className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-semibold">
                        {categoryLabels[project.category] || project.category}
                      </span>
                      {project.status === "in_progress" && (
                        <span className="inline-block bg-yellow-500 text-white px-3 py-1 rounded text-xs font-semibold">
                          Jarayonda
                        </span>
                      )}
                      {project.featured && (
                        <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded text-xs font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl text-foreground mb-2">{project.title}</h3>
                    <p className="text-muted-foreground text-sm mb-2">
                      {project.location && `${project.location} • `}{project.year}
                    </p>
                    {project.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        getProjectImage={getProjectImage}
      />
    </main>
  );
};

export default ProjectsPage;
