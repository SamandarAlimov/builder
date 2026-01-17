import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Building2 } from "lucide-react";

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

interface ProjectDetailModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getProjectImage: (project: Project) => string;
}

const categoryLabels: Record<string, string> = {
  residential: "Turar-joy",
  commercial: "Tijorat",
  industrial: "Sanoat",
};

const statusLabels: Record<string, string> = {
  completed: "Tugallangan",
  in_progress: "Jarayonda",
};

const ProjectDetailModal = ({ project, open, onOpenChange, getProjectImage }: ProjectDetailModalProps) => {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="aspect-video rounded-lg overflow-hidden">
            <img
              src={getProjectImage(project)}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">
              {categoryLabels[project.category] || project.category}
            </Badge>
            {project.status && (
              <Badge variant={project.status === "completed" ? "secondary" : "outline"}>
                {statusLabels[project.status] || project.status}
              </Badge>
            )}
            {project.featured && (
              <Badge variant="destructive">Featured</Badge>
            )}
          </div>

          {/* Details */}
          <div className="grid sm:grid-cols-2 gap-4">
            {project.location && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{project.location}</span>
              </div>
            )}
            {project.year && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{project.year}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-muted-foreground">
              <Building2 className="h-5 w-5 text-primary" />
              <span>{categoryLabels[project.category] || project.category}</span>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Loyiha haqida</h3>
              <p className="text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailModal;