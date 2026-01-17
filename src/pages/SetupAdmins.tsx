import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const SetupAdmins = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const createAdmins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-admin-users');
      
      if (error) {
        setError(error.message);
      } else {
        setResults(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold">Admin Akkauntlarini Yaratish</h1>
        <p className="text-muted-foreground">
          Bu sahifa samandar@alsamos.com va alsamos@alsamos.com uchun admin akkauntlarini yaratadi.
        </p>
        
        <Button onClick={createAdmins} disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin mr-2" /> : null}
          Admin Akkauntlarini Yaratish
        </Button>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            Xato: {error}
          </div>
        )}

        {results && (
          <div className="p-4 bg-green-100 text-green-800 rounded-lg text-left">
            <pre className="text-xs overflow-auto">{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}

        <Button variant="outline" onClick={() => navigate('/auth')}>
          Login sahifasiga qaytish
        </Button>
      </div>
    </div>
  );
};

export default SetupAdmins;
