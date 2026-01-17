import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  FolderOpen,
  Star,
  StarOff,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

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
  created_at: string;
}

const categories = [
  { value: "residential", label: "Turar-joy" },
  { value: "commercial", label: "Tijorat" },
  { value: "industrial", label: "Sanoat" },
];

const statuses = [
  { value: "completed", label: "Yakunlangan" },
  { value: "in_progress", label: "Jarayonda" },
  { value: "planned", label: "Rejalashtirilgan" },
];

const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "residential",
    image_url: "",
    location: "",
    year: new Date().getFullYear(),
    featured: false,
    status: "completed",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Loyihalarni yuklashda xatolik");
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "residential",
      image_url: "",
      location: "",
      year: new Date().getFullYear(),
      featured: false,
      status: "completed",
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || "",
      category: project.category,
      image_url: project.image_url || "",
      location: project.location || "",
      year: project.year || new Date().getFullYear(),
      featured: project.featured || false,
      status: project.status || "completed",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const projectData = {
      title: formData.title,
      description: formData.description || null,
      category: formData.category,
      image_url: formData.image_url || null,
      location: formData.location || null,
      year: formData.year,
      featured: formData.featured,
      status: formData.status,
    };

    let error;

    if (editingProject) {
      const result = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", editingProject.id);
      error = result.error;
    } else {
      const result = await supabase.from("projects").insert([projectData]);
      error = result.error;
    }

    if (error) {
      toast.error(editingProject ? "Yangilashda xatolik" : "Qo'shishda xatolik");
    } else {
      toast.success(editingProject ? "Loyiha yangilandi" : "Loyiha qo'shildi");
      resetForm();
      fetchProjects();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu loyihani o'chirishni tasdiqlaysizmi?")) return;

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      toast.error("O'chirishda xatolik");
    } else {
      toast.success("Loyiha o'chirildi");
      fetchProjects();
    }
  };

  const toggleFeatured = async (project: Project) => {
    const { error } = await supabase
      .from("projects")
      .update({ featured: !project.featured })
      .eq("id", project.id);

    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      fetchProjects();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari yuklanishi mumkin");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5MB dan oshmasligi kerak");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: urlData.publicUrl });
      toast.success("Rasm yuklandi");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Rasm yuklashda xatolik");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getCategoryLabel = (value: string) => {
    return categories.find((c) => c.value === value)?.label || value;
  };

  const getStatusLabel = (value: string | null) => {
    return statuses.find((s) => s.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display text-foreground">
          Loyihalar ({projects.length})
        </h2>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4 mr-2" />
          Yangi loyiha
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-muted p-6 rounded-lg border border-border space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">
              {editingProject ? "Loyihani tahrirlash" : "Yangi loyiha"}
            </h3>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Nomi *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="Loyiha nomi"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Joylashuv
              </label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Shahar/Hudud"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Tavsif
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Loyiha haqida qisqacha..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Kategoriya
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              >
                {statuses.map((stat) => (
                  <option key={stat.value} value={stat.value}>
                    {stat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Yil
              </label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                min={2000}
                max={2100}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground">Tanlangan</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Loyiha rasmi
            </label>
            <div className="space-y-3">
              {/* Image preview */}
              {formData.image_url && (
                <div className="relative w-full max-w-xs">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: "" })}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {/* Upload button */}
              <div className="flex gap-3 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                </Button>
                
                <span className="text-sm text-muted-foreground">yoki</span>
                
                <Input
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="URL kiriting..."
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingProject ? "Yangilash" : "Qo'shish"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Bekor qilish
            </Button>
          </div>
        </form>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center text-muted-foreground">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Hozircha loyihalar yo'q</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">
                    Loyiha
                  </th>
                  <th className="text-left p-4 font-medium text-foreground hidden md:table-cell">
                    Kategoriya
                  </th>
                  <th className="text-left p-4 font-medium text-foreground hidden sm:table-cell">
                    Joylashuv
                  </th>
                  <th className="text-left p-4 font-medium text-foreground hidden lg:table-cell">
                    Status
                  </th>
                  <th className="text-left p-4 font-medium text-foreground">
                    Tanlangan
                  </th>
                  <th className="text-left p-4 font-medium text-foreground">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-t border-border hover:bg-muted/50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">
                            {project.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {project.year}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {getCategoryLabel(project.category)}
                    </td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">
                      {project.location || "-"}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : project.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleFeatured(project)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {project.featured ? (
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ) : (
                          <StarOff className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManager;