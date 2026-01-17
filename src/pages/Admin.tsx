import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  Users, 
  Mail, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/alsamos-logo.png";
import ProjectsManager from "@/components/admin/ProjectsManager";

interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  project_type: string | null;
  budget: string | null;
  message: string;
  status: string;
  created_at: string;
}

const budgetLabels: Record<string, string> = {
  under_50k: "$50,000 gacha",
  "50k_100k": "$50,000 - $100,000",
  "100k_250k": "$100,000 - $250,000",
  "250k_500k": "$250,000 - $500,000",
  over_500k: "$500,000+",
};

interface VisitorSession {
  id: string;
  session_id: string;
  page_path: string | null;
  user_agent: string | null;
  last_seen_at: string;
  created_at: string;
}

type TabType = "submissions" | "visitors" | "projects";

const Admin = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [visitors, setVisitors] = useState<VisitorSession[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("submissions");
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast.error("Admin huquqi yo'q");
      navigate("/");
    }
  }, [isAdmin, loading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      
      // Subscribe to realtime visitor updates
      const channel = supabase
        .channel("visitor-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "visitor_sessions",
          },
          () => {
            fetchVisitors();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoadingData(true);
    await Promise.all([fetchSubmissions(), fetchVisitors()]);
    setIsLoadingData(false);
  };

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("So'rovlarni yuklashda xatolik");
    } else {
      setSubmissions(data || []);
    }
  };

  const fetchVisitors = async () => {
    // Get visitors active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from("visitor_sessions")
      .select("*")
      .gte("last_seen_at", fiveMinutesAgo)
      .order("last_seen_at", { ascending: false });

    if (error) {
      console.error("Error fetching visitors:", error);
    } else {
      setVisitors(data || []);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Status yangilashda xatolik");
    } else {
      toast.success("Status yangilandi");
      fetchSubmissions();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceType = (userAgent: string | null) => {
    if (!userAgent) return "Noma'lum";
    if (/mobile/i.test(userAgent)) return "📱 Mobil";
    if (/tablet/i.test(userAgent)) return "📱 Planshet";
    return "💻 Desktop";
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Alsamos" className="h-10 w-auto" />
              <div>
                <span className="font-display text-xl text-foreground tracking-wide">ALSAMOS</span>
                <span className="block text-xs text-muted-foreground tracking-widest uppercase">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Chiqish
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border border-border shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display text-foreground">{submissions.length}</p>
                <p className="text-muted-foreground text-sm">Jami so'rovlar</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display text-foreground">{visitors.length}</p>
                <p className="text-muted-foreground text-sm">Hozirgi tashrifchilar</p>
              </div>
            </div>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-display text-foreground">
                  {submissions.filter((s) => s.status === "new").length}
                </p>
                <p className="text-muted-foreground text-sm">Yangi so'rovlar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
              activeTab === "submissions"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Mail className="h-4 w-4 inline-block mr-2" />
            So'rovlar
          </button>
          <button
            onClick={() => setActiveTab("visitors")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
              activeTab === "visitors"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Users className="h-4 w-4 inline-block mr-2" />
            Tashrifchilar
            <span className="ml-2 px-2 py-0.5 bg-green-500 text-primary-foreground text-xs rounded-full">
              {visitors.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
              activeTab === "projects"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <FolderOpen className="h-4 w-4 inline-block mr-2" />
            Loyihalar
          </button>
          <Button variant="ghost" size="sm" onClick={fetchData} className="ml-auto">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        {activeTab === "submissions" ? (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {submissions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Hozircha so'rovlar yo'q</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium text-foreground">Ism</th>
                      <th className="text-left p-4 font-medium text-foreground">Email</th>
                      <th className="text-left p-4 font-medium text-foreground hidden md:table-cell">Loyiha turi</th>
                      <th className="text-left p-4 font-medium text-foreground hidden md:table-cell">Byudjet</th>
                      <th className="text-left p-4 font-medium text-foreground hidden lg:table-cell">Xabar</th>
                      <th className="text-left p-4 font-medium text-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-foreground hidden sm:table-cell">Sana</th>
                      <th className="text-left p-4 font-medium text-foreground">Amallar</th>
                      <th className="text-left p-4 font-medium text-foreground hidden sm:table-cell">Sana</th>
                      <th className="text-left p-4 font-medium text-foreground">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="border-t border-border hover:bg-muted/50">
                        <td className="p-4">
                          <p className="font-medium text-foreground">
                            {submission.first_name} {submission.last_name}
                          </p>
                          {submission.phone && (
                            <p className="text-sm text-muted-foreground">{submission.phone}</p>
                          )}
                        </td>
                        <td className="p-4 text-muted-foreground">{submission.email}</td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          {submission.project_type || "-"}
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          {submission.budget ? budgetLabels[submission.budget] || submission.budget : "-"}
                        </td>
                        <td className="p-4 text-muted-foreground hidden lg:table-cell max-w-xs truncate">
                          {submission.message}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              submission.status === "new"
                                ? "bg-yellow-100 text-yellow-800"
                                : submission.status === "contacted"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {submission.status === "new" && <Clock className="h-3 w-3" />}
                            {submission.status === "contacted" && <Mail className="h-3 w-3" />}
                            {submission.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                            {submission.status === "new" ? "Yangi" : submission.status === "contacted" ? "Bog'lanildi" : "Yakunlandi"}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm hidden sm:table-cell">
                          {formatDate(submission.created_at)}
                        </td>
                        <td className="p-4">
                          <select
                            value={submission.status}
                            onChange={(e) => updateSubmissionStatus(submission.id, e.target.value)}
                            className="px-2 py-1 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            <option value="new">Yangi</option>
                            <option value="contacted">Bog'lanildi</option>
                            <option value="completed">Yakunlandi</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === "visitors" ? (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {visitors.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Hozirda aktiv tashrifchilar yo'q</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium text-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-foreground">Sahifa</th>
                      <th className="text-left p-4 font-medium text-foreground hidden sm:table-cell">Qurilma</th>
                      <th className="text-left p-4 font-medium text-foreground">So'nggi faollik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((visitor) => (
                      <tr key={visitor.id} className="border-t border-border hover:bg-muted/50">
                        <td className="p-4">
                          <span className="inline-flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-green-600 text-sm font-medium">Online</span>
                          </span>
                        </td>
                        <td className="p-4 text-foreground">{visitor.page_path || "/"}</td>
                        <td className="p-4 text-muted-foreground hidden sm:table-cell">
                          {getDeviceType(visitor.user_agent)}
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {formatDate(visitor.last_seen_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <ProjectsManager />
        )}
      </main>
    </div>
  );
};

export default Admin;
