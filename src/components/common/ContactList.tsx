"use client";

import { useLayoutEffect, useRef } from "react";
import { useContactsContext } from "@/context/ContactsContext";
import ContactCard from "./ContactCard";
import ContactHeader from "./ContactHeader";

export default function ContactList() {
  const { contacts } = useContactsContext();

  // Anchor-based scroll preservation:
  // We remember the absolute page Y of each rendered contact element between renders.
  // When the contacts list reorders, we pick an anchor element that was visible
  // (or nearest to the viewport top) in the previous layout, compute the delta
  // between its previous absolute Y and its new absolute Y, and scroll by that
  // delta so the viewport visually stays anchored.
  const prevPositionsRef = useRef<Map<string, number>>(new Map());
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined" || !contacts) return;

    // Helper: measure current absolute tops for visible contact elements
    const measure = () => {
      const m = new Map<string, number>();
      for (const c of contacts) {
        const el = document.querySelector(`[data-contact-id="${c.id}"]`);
        if (el instanceof Element) {
          const rect = el.getBoundingClientRect();
          m.set(c.id, rect.top + window.scrollY);
        }
      }
      return m;
    };

    const prev = prevPositionsRef.current;
    const current = measure();

    // If we have previous measurements and they differ (reorder likely happened),
    // choose an anchor and adjust scroll so the anchor remains visually stationary.
    if (initializedRef.current && prev.size > 0) {
      // Find an anchor id that exists in both maps and was inside the previous viewport.
      const viewportTop = window.scrollY;
      const viewportBottom = viewportTop + window.innerHeight;
      let anchorId: string | null = null;

      for (const [id, oldTop] of prev.entries()) {
        if (!current.has(id)) continue;
        if (oldTop >= viewportTop && oldTop <= viewportBottom) {
          anchorId = id;
          break;
        }
      }

      // If none were in viewport, pick the shared item whose oldTop is closest to viewportTop.
      if (!anchorId) {
        let best = Infinity;
        for (const [id, oldTop] of prev.entries()) {
          if (!current.has(id)) continue;
          const d = Math.abs(oldTop - viewportTop);
          if (d < best) {
            best = d;
            anchorId = id;
          }
        }
      }

      if (anchorId) {
        const oldTop = prev.get(anchorId);
        const newTop = current.get(anchorId);
        if (typeof oldTop === "number" && typeof newTop === "number") {
          const delta = newTop - oldTop;
          if (delta !== 0) {
            // Use scrollBy to move the page so the anchor stays visually in place.
            window.scrollBy({ top: delta, left: 0, behavior: "auto" });
          }
        }
      }
    }

    // Save current positions for the next update
    prevPositionsRef.current = current;
    initializedRef.current = true;
  }, [contacts]);

  return (
    <div className="flex flex-col gap-10 pb-20">
      <ContactHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {contacts?.length === 0 && (
          <div className="col-span-full flex justify-center items-center h-full">
            <p className="text-muted-foreground">Aucun contact</p>
          </div>
        )}
        {contacts?.map((contact) => (
          // Add a stable wrapper with a data attribute so we can measure DOM positions
          // even though `ContactCard` itself is a separate component.
          <div key={contact.id} data-contact-id={contact.id} className="h-full">
            <ContactCard contact={contact} />
          </div>
        ))}
      </div>
    </div>
  );
}
