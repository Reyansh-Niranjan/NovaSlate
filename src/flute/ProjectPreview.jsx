"use client";
import React from "react";
import { ProjectPreview } from "@webprodigies/flute/preview";
import { sceneModules } from "./catalog";
// Host-owned development flag: no process, Vite or Electron globals in this adapter.
export function FluteProjectPreview({ children, enabled, active, ...props }) {
  if (!enabled) return children;
  return <ProjectPreview {...props} projectId="6754efc0-3214-402d-b681-adfcd79d2a3b" enabled={enabled} active={active} sceneModules={sceneModules}>{children}</ProjectPreview>;
}
