import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/alsamos-logo.png";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email noto'g'ri" }).max(255),
  password: z.string().min(6, { message: "Parol kamida 6 ta belgi bo'lishi kerak" }).max(100),
});

const Auth = () => {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) {
      navigate("/admin");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = loginSchema.parse(formData);

      const { error } = await signIn(validatedData.email, validatedData.password);
      if (error) {
        if (error.message.includes("Invalid login")) {
          toast.error("Email yoki parol noto'g'ri");
        } else {
          toast.error(error.message);
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-secondary-foreground/60 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Bosh sahifa</span>
        </a>

        {/* Card */}
        <div className="bg-card p-8 rounded-lg shadow-elevated border border-border">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Alsamos" className="h-12 w-auto" />
              <div>
                <span className="font-display text-2xl text-foreground tracking-wide">ALSAMOS</span>
                <span className="block text-xs text-muted-foreground tracking-widest uppercase">Admin Panel</span>
              </div>
            </div>
          </div>

          <h1 className="font-display text-2xl text-center text-foreground mb-6">
            ADMIN KIRISH
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Parol</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
            </div>

            <Button variant="hero" size="xl" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Kirish"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Faqat ruxsat berilgan foydalanuvchilar kirishi mumkin
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
