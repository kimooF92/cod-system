"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuickCreate } from "./quick-create-provider";
import { KeyboardHelpModal } from "./keyboard-help-modal";

export function KeyboardShortcutsListener() {
  const router = useRouter();
  const { openCreate } = useQuickCreate();
  const [gPressed, setGPressed] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "Escape") {
        setGPressed(false);
        setHelpOpen(false);
        return;
      }

      // ? = open keyboard help
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }

      // c = open quick create menu (standalone, no g prefix)
      if (e.key === "c" && !e.ctrlKey && !e.metaKey && !e.altKey && !gPressed) {
        e.preventDefault();
        // Dispatch a synthetic click on the Create button
        const btn = document.querySelector<HTMLButtonElement>("[data-quick-create-trigger]");
        if (btn) {
          btn.click();
        } else {
          // Fallback: open order form directly
          openCreate("order");
        }
        return;
      }

      if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setGPressed(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => setGPressed(false), 1200);
        return;
      }

      if (gPressed) {
        switch (e.key.toLowerCase()) {
          case "d":
            e.preventDefault();
            router.push("/");
            setGPressed(false);
            break;
          case "p":
            e.preventDefault();
            router.push("/products");
            setGPressed(false);
            break;
          case "t":
            e.preventDefault();
            router.push("/testing");
            setGPressed(false);
            break;
          case "c":
            e.preventDefault();
            router.push("/creatives");
            setGPressed(false);
            break;
          case "o":
            e.preventDefault();
            router.push("/orders");
            setGPressed(false);
            break;
          case "f":
            e.preventDefault();
            router.push("/finance");
            setGPressed(false);
            break;
          case "a":
            e.preventDefault();
            router.push("/analytics");
            setGPressed(false);
            break;
          case "r":
            e.preventDefault();
            router.push("/research");
            setGPressed(false);
            break;
          case "m":
            e.preventDefault();
            router.push("/monthly-review");
            setGPressed(false);
            break;
          case "s":
            e.preventDefault();
            router.push("/settings");
            setGPressed(false);
            break;
          default:
            setGPressed(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, [gPressed, router, openCreate]);

  return (
    <KeyboardHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
  );
}
