import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const generateSessionId = () => {
  const stored = sessionStorage.getItem("visitor_session_id");
  if (stored) return stored;
  
  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  sessionStorage.setItem("visitor_session_id", newId);
  return newId;
};

export const useVisitorTracking = () => {
  const sessionId = useRef(generateSessionId());

  useEffect(() => {
    const trackVisitor = async () => {
      const pagePath = window.location.pathname;
      const userAgent = navigator.userAgent;
      const referrer = document.referrer || null;

      try {
        // Try to upsert visitor session
        const { error } = await supabase
          .from("visitor_sessions")
          .upsert(
            {
              session_id: sessionId.current,
              page_path: pagePath,
              user_agent: userAgent,
              referrer: referrer,
              last_seen_at: new Date().toISOString(),
            },
            {
              onConflict: "session_id",
            }
          );

        if (error) {
          console.error("Error tracking visitor:", error);
        }
      } catch (err) {
        console.error("Error tracking visitor:", err);
      }
    };

    trackVisitor();

    // Update last_seen every 30 seconds
    const interval = setInterval(() => {
      trackVisitor();
    }, 30000);

    return () => clearInterval(interval);
  }, []);
};
