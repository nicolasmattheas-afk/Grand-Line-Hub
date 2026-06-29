import React, { useEffect, useRef } from "react";

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
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // We delay the push slightly to ensure the DOM node is rendered and ready.
    // This successfully avoids the "availableWidth=0" error caused by page transitions.
    const timer = setTimeout(() => {
      try {
        if (insRef.current) {
          // Check if AdSense has already processed this specific element
          const status = insRef.current.getAttribute("data-adsbygoogle-status");
          if (status !== "done") {
            const adsbygoogle = (window as any).adsbygoogle || [];
            adsbygoogle.push({});
          }
        }
      } catch (e) {
        console.warn("AdSense push initialization warning or script not loaded yet (expected in development):", e);
      }
    }, 250); // Delay of 250ms is perfect for layout rendering

    return () => clearTimeout(timer);
  }, [slot]);

  // Standard official AdSense Client code
  const publisherId = "ca-pub-2543561141625687";

  return (
    <div className={`w-full max-w-full overflow-hidden flex justify-center items-center ${className}`}>
      {/* Real AdSense tag */}
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={style || { display: "inline-block", width: "100%", minWidth: "250px", height: "90px" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}

