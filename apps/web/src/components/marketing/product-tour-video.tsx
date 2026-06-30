import { useReducedMotion } from "motion/react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/modal.js";

const poster = "/media/insightform-product-tour-poster.webp";

export function ProductTourVideo() {
  const shouldReduceMotion = useReducedMotion();
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-border-subtle bg-foreground shadow-soft">
        <div className="aspect-video">
          {shouldReduceMotion || hasVideoError ? (
            <img
              alt="InsightForm workspace showing a published feedback form and its response metrics"
              className="size-full object-cover"
              height={1080}
              src={poster}
              width={1920}
            />
          ) : (
            <video
              aria-label="A 24-second tour of the InsightForm product"
              autoPlay
              className="size-full object-cover"
              loop
              muted
              onError={() => setHasVideoError(true)}
              playsInline
              poster={poster}
              preload="metadata"
            >
              <source src="/media/insightform-product-tour.webm" type="video/webm" />
              <source src="/media/insightform-product-tour.mp4" type="video/mp4" />
            </video>
          )}
        </div>
        <button
          aria-label="Expand the InsightForm product tour"
          className="absolute inset-0 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          onClick={() => setIsOpen(true)}
          type="button"
        />
      </div>

      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent
          className="w-[calc(100%-1rem)] max-w-6xl gap-0 overflow-hidden border-border-subtle bg-foreground p-0"
          showCloseButton
        >
          <DialogHeader className="sr-only">
            <DialogTitle>InsightForm product tour</DialogTitle>
            <DialogDescription>
              A silent 24-second tour of form creation, editing, responses, insights, and reporting.
            </DialogDescription>
          </DialogHeader>
          <video
            aria-label="InsightForm product tour"
            autoPlay={!shouldReduceMotion}
            className="aspect-video w-full bg-foreground"
            controls
            muted
            playsInline
            poster={poster}
            preload="metadata"
          >
            <source src="/media/insightform-product-tour.webm" type="video/webm" />
            <source src="/media/insightform-product-tour.mp4" type="video/mp4" />
          </video>
        </DialogContent>
      </Dialog>
    </>
  );
}
