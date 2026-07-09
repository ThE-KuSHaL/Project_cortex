# Project Cortex
# 06_shader_pipeline.md

Version: 1.0

Depends On

- 00_context.md
- 01_visual_design_system.md
- 01.5_interaction_architecture.md
- 02_reference_analysis.md
- 03_references/
- 04_mesh_pipeline.md
- 05_material_system.md

---

# Purpose

This document defines how Project Cortex is rendered.

It specifies the shader architecture responsible for transforming the anatomical GLB into the final cybernetic Engineer's Brain.

This document defines rendering logic.

It does not define geometry, materials or animations.

---

# Shader Philosophy

Shaders should reveal engineering.

Not create visual noise.

Every shader should have one responsibility.

Avoid monolithic shaders.

Prefer modular layered rendering.

---

# Rendering Pipeline

Brain_port.glb

↓

Graphite Shader

↓

Titanium Shader

↓

Copper Routing Shader

↓

Fiber Optic Shader

↓

Electrical Packet Shader

↓

Region Mask Shader

↓

Hover Overlay

↓

Selection Overlay

↓

Knowledge Activation

↓

Bloom Mask

↓

Post Processing

↓

Final Frame

---

# Master Brain Shader

Purpose

Coordinates all material layers.

Responsibilities

- Material blending
- Region masking
- Layer ordering
- Uniform distribution

Must remain lightweight.

---

# Graphite Shader

Purpose

Render the insulating substrate.

Characteristics

- Matte finish
- Rough surface
- No emissive
- AO responsive

Never glows.

---

# Titanium Shader

Purpose

Render structural components.

Characteristics

- Brushed reflections
- Edge highlights
- Medium metalness
- Stable appearance

No emissive.

---

# Copper Routing Shader

Purpose

Render conductive pathways.

Characteristics

- Metallic copper
- Fine edge highlights
- Visible while inactive
- Supports emissive overlay

Copper itself should not become neon.

---

# Fiber Optic Shader

Purpose

Render protected routing channels.

Characteristics

- Transparent cover
- Colored optical core
- Slight internal glow

Acts as the conduit for computational activity.

---

# Electrical Packet Shader

Purpose

Represent computation.

Characteristics

- Independent packets
- Variable speed
- Variable spacing
- Variable intensity
- Regional color

Packets travel only inside routing.

Never outside.

---

# Region Mask Shader

Purpose

Separate the seven knowledge regions.

Responsibilities

- Region isolation
- Color isolation
- Packet isolation
- Interaction masks

No color bleeding.

No packet crossover.

---

# Hover Shader

Purpose

Provide immediate interaction feedback.

Effects

- Slight emissive increase
- Rim enhancement
- Packet frequency increase

Hover should remain subtle.

---

# Selection Shader

Purpose

Represent active inspection.

Effects

- Increased routing brightness
- Stronger hotspots
- Stable highlight

Selection should persist until deselected.

---

# Knowledge Activation Shader

Purpose

Represent the activation of knowledge.

Effects

- Increased packet density
- Increased routing activity
- Increased hotspot frequency

Each activated region behaves independently.

The entire brain becomes progressively more alive as additional knowledge regions are activated.

---

# White Hotspot Shader

Purpose

Represent processing intersections.

Characteristics

- Very small
- Extremely bright
- Short-lived
- Rare

Never overused.

---

# Bloom Mask

Purpose

Control bloom eligibility.

Eligible

- Electrical packets
- Fiber optics
- Active nodes
- White hotspots

Excluded

- Graphite
- Titanium
- Copper
- Ceramic

Bloom should remain controlled.

---

# Region Uniforms

Each region exposes

- Active
- Hovered
- Selected
- Packet Density
- Packet Speed
- Emissive Intensity
- Knowledge Color

These values should be independently adjustable.

---

# Global Uniforms

Global Time

↓

Camera Position

↓

Exposure

↓

Bloom Strength

↓

Brain Activity Level

↓

Particle Intensity

↓

Interaction State

These control the overall rendering behaviour.

---

# Layer Priority

Electrical Energy

Highest

↓

Fiber Channels

↓

Copper

↓

Titanium

↓

Graphite

↓

Base

No layer should visually overpower a higher-priority layer.

---

# Shader Performance

Prefer

- GPU calculations
- Uniform animation
- Shared materials
- Minimal branches

Avoid

- Heavy CPU updates
- Multiple identical shaders
- Per-frame geometry changes

---

# Future Shader Slots

Reserved

- Project Preview Overlay
- Timeline Mode
- Research Visualization
- AI Simulation Layer
- Knowledge Graph Mode

These should integrate without replacing existing shaders.

---

# Acceptance Tests

Graphite

□ Never emits

Titanium

□ Never glows

Copper

□ Remains metallic

Packets

□ Stay inside routing

□ Never leave regions

□ Variable speed

Regions

□ Seven independent masks

□ No color bleeding

Interaction

□ Hover isolated

□ Selection isolated

□ Knowledge activation functional

Performance

□ Stable frame rate

□ Minimal shader complexity

□ Modular architecture

---

# Success Criteria

The Shader Pipeline succeeds when every rendered pixel contributes to the illusion that the Engineer's Brain is an actively computing cybernetic system.

Shaders should communicate engineering through light rather than decoration.

This document serves as the authoritative rendering specification for Project Cortex.