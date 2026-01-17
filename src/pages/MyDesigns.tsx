import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Loader2, 
  Plus,
  Trash2,
  Download,
  Image as ImageIcon,
  Calendar,
  Home
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/alsamos-logo.png";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface HouseDesign {
  id: string;
  title: string;
  description: string | null;
  style: string | null;
  rooms_count: number | null;
  floors_count: number | null;
  color_scheme: string | null;
  building_type: string | null;
  image_url: string | null;
  created_at: string;
}

const styleLabels: Record<string, string> = {
  modern: "Zamonaviy",
  classic: "Klassik",
  minimalist: "Minimalist",
  traditional_uzbek: "An'anaviy O'zbek",
  mediterranean: "O'rta yer dengizi",
  scandinavian: "Skandinaviya",
};

const buildingTypeLabels: Record<string, string> = {
  house: "Yakka hovli",
  villa: "Villa",
  apartment: "Ko'p qavatli uy",
  townhouse: "Taun-xaus",
};

const MyDesigns = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<HouseDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDesigns();
    }
  }, [user]);

  const fetchDesigns = async () => {
    const { data, error } = await supabase
      .from("house_designs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Dizaynlarni yuklashda xatolik");
    } else {
      setDesigns(data || []);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("house_designs")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error("O'chirishda xatolik");
    } else {
      toast.success("Dizayn o'chirildi");
      setDesigns(designs.filter(d => d.id !== deleteId));
    }
    setDeleteId(null);
  };

  const downloadImage = (imageUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${title}-${Date.now()}.png`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <img src={logo} alt="Alsamos" className="h-10 w-auto" />
                <div>
                  <span className="font-display text-xl text-foreground tracking-wide">ALSAMOS</span>
                  <span className="block text-xs text-muted-foreground tracking-widest uppercase">Mening dizaynlarim</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/design-studio">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi dizayn
                </Button>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Orqaga
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl text-foreground mb-2">Mening dizaynlarim</h1>
              <p className="text-muted-foreground">{designs.length} ta dizayn</p>
            </div>
          </div>

          {designs.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">Hali dizaynlar yo'q</h3>
                <p className="text-muted-foreground mb-6">AI yordamida o'zingizning birinchi uy dizayningizni yarating</p>
                <Link to="/design-studio">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Dizayn yaratish
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Card key={design.id} className="overflow-hidden group">
                  <div className="aspect-video relative">
                    {design.image_url ? (
                      <img
                        src={design.image_url}
                        alt={design.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {design.image_url && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(design.image_url!, design.title)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(design.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">{design.title}</h3>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-2">
                      {design.building_type && (
                        <span className="px-2 py-0.5 bg-muted rounded">
                          {buildingTypeLabels[design.building_type] || design.building_type}
                        </span>
                      )}
                      {design.style && (
                        <span className="px-2 py-0.5 bg-muted rounded">
                          {styleLabels[design.style] || design.style}
                        </span>
                      )}
                      {design.rooms_count && (
                        <span className="px-2 py-0.5 bg-muted rounded">{design.rooms_count} xona</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(design.created_at)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dizaynni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Haqiqatan ham bu dizaynni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyDesigns;