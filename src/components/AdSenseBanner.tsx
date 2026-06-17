import React, { useEffect } from "react";

interface AdSenseBannerProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal";
  responsive?: "true" | "false";
  style?: React.CSSProperties;
  className?: string;
}

export default function AdSenseBanner({
  slot,
  format = "auto",
  responsive = "true",
  style,
  className = "",
}: AdSenseBannerProps) {
  useEffect(() => {
    try {
      // Initialize AdSense on component mount
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.warn("AdSense push error or script not loaded yet (expected on local preview):", e);
    }
  }, []);

  // Standard official AdSense Client code
  const publisherId = "ca-pub-2543561141625687";

  return (
    <div className={`my-6 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-800 bg-slate-950/20 p-3 text-center ${className}`}>
      {/* Label indicating it is an advertisement */}
      <div className="mb-2 text-[10px] uppercase tracking-[0.15em] text-slate-500 font-mono font-bold select-none">
        MÉCÉNAT DE GRAND LINE • PUBLICITÉ
      </div>
      
      {/* Container for real AdSense banner */}
      <div className="w-full max-w-full overflow-hidden" style={{ minHeight: "90px" }}>
        {/* Real AdSense tag */}
        <ins
          className="adsbygoogle"
          style={style || { display: "block", textAlign: "center", minWidth: "250px" }}
          data-ad-client={publisherId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
        
        {/* Graceful placeholder/fallback display for Dev / Ad-blockers / Sandbox */}
        <div className="ads-fallback mt-1 p-4 bg-[#0a0c24] border border-violet-900/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-left max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 select-none">
              🏴‍☠️
            </div>
            <div>
              <p className="font-heading font-black text-[11px] text-amber-400 uppercase tracking-wider">
                Sponsor officiel - Grand Line Hub
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 max-w-lg leading-normal">
                Espace publicitaire configuré de manière optimale. Il s'activera dès la validation d'AdSense (ca-pub-2543561141625687, Slot {slot}).
              </p>
            </div>
          </div>
          <div className="text-[9px] text-zinc-500 border border-slate-800 px-2 py-1 rounded bg-slate-950/80 shrink-0 font-mono select-none">
            Slot: {slot}
          </div>
        </div>
      </div>
    </div>
  );
}
