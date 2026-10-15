"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { DotLottie } from "@lottiefiles/dotlottie-react";

const ANIMATION_SRC =
  "https://lottie.host/884c5a1f-3d4a-45e5-9b3e-e2da45435c21/XYiwHxXWRj.lottie";

const FADE_MS = 500;
const STALL_TIMEOUT_MS = 8000;
const LOAD_ERROR_TIMEOUT_MS = 2500;

type Phase = "visible" | "fading" | "hidden";

export default function StartupLoader() {
  const [phase, setPhase] = useState<Phase>("visible");
  const animationDone = useRef(false);
  const dismissed = useRef(false);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    setPhase("fading");
    window.setTimeout(() => setPhase("hidden"), FADE_MS);
  }, []);

  // Dismiss only once the animation finished AND the page has loaded.
  // document.readyState is read lazily so the effect body stays side-effect free.
  const tryDismiss = useCallback(() => {
    if (!animationDone.current) return;
    if (document.readyState !== "complete") return;
    dismiss();
  }, [dismiss]);

  // Subscribe to the window load event, and set a hard failsafe so a stalled
  // or missing animation can never trap the visitor on the loading screen.
  useEffect(() => {
    const onPageLoad = () => tryDismiss();

    if (document.readyState !== "complete") {
      window.addEventListener("load", onPageLoad);
    }

    const failsafe = window.setTimeout(dismiss, STALL_TIMEOUT_MS);

    return () => {
      window.removeEventListener("load", onPageLoad);
      window.clearTimeout(failsafe);
    };
  }, [dismiss, tryDismiss]);

  // Block scrolling while the overlay covers the page; restore it afterwards.
  useEffect(() => {
    if (phase === "hidden") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  const handleDotLottieRef = useCallback(
    (instance: DotLottie | null) => {
      if (!instance) return;

      instance.addEventListener("complete", () => {
        animationDone.current = true;
        tryDismiss();
      });

      // The animation could never finish on its own — do not make the visitor
      // wait for it: reveal the site as soon as the page is ready, and force
      // the overlay away after a short grace period regardless.
      instance.addEventListener("loadError", () => {
        animationDone.current = true;
        tryDismiss();
        window.setTimeout(dismiss, LOAD_ERROR_TIMEOUT_MS);
      });
    },
    [dismiss, tryDismiss]
  );

  if (phase === "hidden") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Govt Drish"
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-900 transition-opacity duration-500 ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="h-[min(75vw,75vh,340px)] w-[min(75vw,75vh,340px)]">
        <DotLottieReact
          src={ANIMATION_SRC}
          autoplay
          loop={false}
          dotLottieRefCallback={handleDotLottieRef}
          className="block h-full w-full"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
