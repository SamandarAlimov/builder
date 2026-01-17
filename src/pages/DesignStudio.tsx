import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  Sparkles, 
  MessageSquare, 
  Sliders,
  Image as ImageIcon,
  Save,
  Download,
  Home,
  Box,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/alsamos-logo.png";

// Lazy load the 3D component for better performance
const House3DModel = lazy(() => import("@/components/House3DModel"));
const FloorPlan = lazy(() => import("@/components/FloorPlan"));

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface DesignParams {
  buildingType: string;
  style: string;
  roomsCount: number;
  floorsCount: number;
  colorScheme: string;
  userDescription: string;
}

const buildingTypes = [
  { value: "house", label: "Yakka hovli" },
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Ko'p qavatli uy" },
  { value: "townhouse", label: "Taun-xaus" },
];

const styles = [
  { value: "modern", label: "Zamonaviy" },
  { value: "classic", label: "Klassik" },
  { value: "minimalist", label: "Minimalist" },
  { value: "traditional_uzbek", label: "An'anaviy O'zbek" },
  { value: "mediterranean", label: "O'rta yer dengizi" },
  { value: "scandinavian", label: "Skandinaviya" },
];

const colorSchemes = [
  { value: "warm_neutral", label: "Iliq tabiiy ranglar" },
  { value: "white_modern", label: "Oq zamonaviy" },
  { value: "earth_tones", label: "Yer ranglari" },
  { value: "bold_contrast", label: "Yorqin kontrastlar" },
  { value: "blue_grey", label: "Ko'k-kulrang" },
];

const DesignStudio = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("chat");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [designTitle, setDesignTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [designParams, setDesignParams] = useState<DesignParams>({
    buildingType: "house",
    style: "modern",
    roomsCount: 4,
    floorsCount: 2,
    colorScheme: "warm_neutral",
    userDescription: "",
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChatMessage = async () => {
    if (!inputMessage.trim() || isChatLoading) return;

    const userMessage: ChatMessage = { role: "user", content: inputMessage };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-house-design", {
        body: {
          type: "chat",
          message: [...chatMessages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateImage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-house-design", {
        body: {
          type: "generate_image",
          designParams
        }
      });

      if (error) throw error;

      setGeneratedImage(data.imageUrl);
      toast.success("Uy dizayni muvaffaqiyatli yaratildi!");
      
    } catch (error: any) {
      toast.error(error.message || "Rasm yaratishda xatolik");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDesign = async () => {
    if (!generatedImage || !user) return;
    if (!designTitle.trim()) {
      toast.error("Iltimos, dizayn nomini kiriting");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("house_designs").insert({
        user_id: user.id,
        title: designTitle,
        description: designParams.userDescription,
        style: designParams.style,
        rooms_count: designParams.roomsCount,
        floors_count: designParams.floorsCount,
        color_scheme: designParams.colorScheme,
        building_type: designParams.buildingType,
        image_url: generatedImage,
        prompt_used: JSON.stringify(designParams),
      });

      if (error) throw error;
      toast.success("Dizayn saqlandi!");
      setDesignTitle("");
      
    } catch (error: any) {
      toast.error("Saqlashda xatolik: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `house-design-${Date.now()}.png`;
    link.click();
  };

  if (loading) {
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
                  <span className="block text-xs text-muted-foreground tracking-widest uppercase">AI Design Studio</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/my-designs">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Mening dizaynlarim
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
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
              <Sparkles className="inline-block h-8 w-8 text-primary mr-2" />
              AI Uy Dizayn Studio
            </h1>
            <p className="text-muted-foreground">
              O'zingizning orzu qilgan uyingizni AI yordamida yarating
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-xl mx-auto grid-cols-4">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Suhbat</span>
              </TabsTrigger>
              <TabsTrigger value="params" className="flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                <span className="hidden sm:inline">Parametrlar</span>
              </TabsTrigger>
              <TabsTrigger value="plan" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Plan</span>
              </TabsTrigger>
              <TabsTrigger value="3d" className="flex items-center gap-2">
                <Box className="h-4 w-4" />
                <span className="hidden sm:inline">3D</span>
              </TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Dizayner bilan suhbat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-muted/50 rounded-lg">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-muted-foreground py-12">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Salom! Men sizga orzu qilgan uyingizni tasvirlashda yordam beraman.</p>
                        <p className="text-sm mt-2">Qanday uy qurmoqchisiz? Masalan: "Zamonaviy 2 qavatli hovli"</p>
                      </div>
                    )}
                    {chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-card border border-border"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card border border-border rounded-lg px-4 py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Xabaringizni yozing..."
                      onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                      disabled={isChatLoading}
                    />
                    <Button onClick={sendChatMessage} disabled={isChatLoading || !inputMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Parameters Tab */}
            <TabsContent value="params">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Uy parametrlari</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Uy turi</label>
                      <select
                        value={designParams.buildingType}
                        onChange={(e) => setDesignParams({ ...designParams, buildingType: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      >
                        {buildingTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Stil</label>
                      <select
                        value={designParams.style}
                        onChange={(e) => setDesignParams({ ...designParams, style: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      >
                        {styles.map(style => (
                          <option key={style.value} value={style.value}>{style.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Xonalar soni</label>
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          value={designParams.roomsCount}
                          onChange={(e) => setDesignParams({ ...designParams, roomsCount: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Qavatlar soni</label>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          value={designParams.floorsCount}
                          onChange={(e) => setDesignParams({ ...designParams, floorsCount: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Rang sxemasi</label>
                      <select
                        value={designParams.colorScheme}
                        onChange={(e) => setDesignParams({ ...designParams, colorScheme: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md"
                      >
                        {colorSchemes.map(scheme => (
                          <option key={scheme.value} value={scheme.value}>{scheme.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Qo'shimcha tavsif</label>
                      <Textarea
                        value={designParams.userDescription}
                        onChange={(e) => setDesignParams({ ...designParams, userDescription: e.target.value })}
                        placeholder="Masalan: Katta veranda, bog', hovuz..."
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={generateImage} 
                      disabled={isGenerating}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Yaratilmoqda...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Dizayn yaratish
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Generated Image */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Natija</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedImage ? (
                      <div className="space-y-4">
                        <div className="aspect-video rounded-lg overflow-hidden border border-border">
                          <img
                            src={generatedImage}
                            alt="Generated house design"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <Input
                            value={designTitle}
                            onChange={(e) => setDesignTitle(e.target.value)}
                            placeholder="Dizayn nomi..."
                          />
                          <div className="flex gap-2">
                            <Button onClick={saveDesign} disabled={isSaving || !designTitle.trim()} className="flex-1">
                              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                              Saqlash
                            </Button>
                            <Button variant="outline" onClick={downloadImage}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Parametrlarni to'ldiring va</p>
                          <p>"Dizayn yaratish" tugmasini bosing</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Floor Plan Tab */}
            <TabsContent value="plan">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Uy Plani / Chizma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={
                    <div className="w-full h-64 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  }>
                    <FloorPlan designParams={designParams} />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="3d">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Box className="h-5 w-5 text-primary" />
                    Interaktiv 3D Ko'rinish
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px] rounded-lg overflow-hidden border border-border bg-gradient-to-b from-sky-200 to-sky-50">
                    <Suspense fallback={
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    }>
                      <House3DModel designParams={designParams} />
                    </Suspense>
                  </div>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Joriy sozlamalar:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <span>🏠 {buildingTypes.find(t => t.value === designParams.buildingType)?.label}</span>
                      <span>🎨 {styles.find(s => s.value === designParams.style)?.label}</span>
                      <span>🚪 {designParams.roomsCount} xona</span>
                      <span>📐 {designParams.floorsCount} qavat</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      💡 "Parametrlar" tabida sozlamalarni o'zgartiring va 3D model avtomatik yangilanadi
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default DesignStudio;