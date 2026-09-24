import { Suspense } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollProgress } from "@/components/animations/ScrollProgress";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/navigation/Navbar";

export function PublicLayout() {
  const location = useLocation();
  // useOutlet() snapshots the element for the current route, so the outgoing page keeps its own
  // content while it animates out instead of flashing the next page early.
  const outlet = useOutlet();

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SmoothScroll />
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <main id="main" className="min-h-screen">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <PageTransition key={location.pathname}>
            <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
              {outlet}
            </Suspense>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
