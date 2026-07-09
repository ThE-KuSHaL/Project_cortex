# Project Cortex
# 08_lighting_pipeline.md

Version: 1.0

Depends On

- 00_context.md
- 01_visual_design_system.md
- 01.5_interaction_architecture.md
- 02_reference_analysis.md
- 03_references/
- 04_mesh_pipeline.md
- 05_material_system.md
- 06_shader_pipeline.md
- 07_animation_pipeline.md

---

# Purpose

This document defines the complete lighting pipeline of Project Cortex.

Lighting exists to reveal engineering, reinforce materials, and guide the viewer's attention toward computation.

Lighting should never overpower the brain.

---

# Lighting Philosophy

Darkness is the default.

Light reveals engineering.

Energy attracts attention.

Every light source must have a functional purpose.

---

# Lighting Priority

Electrical Hotspots

↓

Electrical Routing

↓

Rim Light

↓

Key Light

↓

Fill Light

↓

HDR Environment

↓

Background

---

# Scene Lighting Rig

The scene uses a physically believable lighting setup.

Components

- HDR Environment
- Key Light
- Fill Light
- Rim Light
- Accent Lights
- Ambient Occlusion
- Bloom
- Tone Mapping

---

# HDR Environment

Purpose

Provide realistic reflections.

Requirements

- Neutral
- Soft
- Non-distracting

Should never become visible.

---

# Key Light

Purpose

Reveal the overall brain form.

Characteristics

- Cool white
- Soft shadows
- Medium intensity

---

# Fill Light

Purpose

Lift dark regions.

Characteristics

- Very soft
- Low intensity
- Neutral color

Should never flatten geometry.

---

# Rim Light

Purpose

Separate the brain from the background.

Characteristics

- Bright edge highlights
- Cool temperature
- Narrow spread

Critical for silhouette readability.

---

# Accent Lights

Purpose

Enhance premium appearance.

May illuminate

- Base platform
- Connector origins
- Important interaction zones

Should remain subtle.

---

# Ambient Occlusion

Purpose

Increase depth.

AO should strengthen

- PCB routing
- Chips
- Mechanical seams
- Vias
- Cavities

Never exaggerate AO.

---

# Shadows

Requirements

- Soft
- Stable
- High resolution
- Physically believable

Avoid

- Harsh shadows
- Flickering
- Completely black regions

---

# Bloom

Bloom represents energy.

Allowed

- Electrical packets
- Fiber channels
- Active routing
- White hotspots

Not Allowed

- Graphite
- Titanium
- Ceramic
- Base platform

Bloom should remain controlled.

---

# Tone Mapping

Preferred

Filmic.

Maintain highlight detail.

Avoid clipped whites.

---

# Exposure

Target

Slightly dark overall scene.

Electrical activity should naturally become the brightest element.

---

# Background Lighting

Background should remain subdued.

Allowed

- Soft gradients
- Minimal atmospheric lighting
- Gentle depth

Never compete with the brain.

---

# Knowledge Activation Lighting

Selecting a knowledge region

- Increases routing brightness
- Slightly increases hotspot intensity
- Maintains regional isolation

Previously selected regions remain active.

---

# Full Synchronization Lighting

When all seven regions are active

- Overall illumination increases slightly
- Brain appears fully operational
- Background remains unchanged

Avoid excessive brightness.

---

# Reflection Control

Graphite

Very low.

Titanium

Medium.

Copper

Medium.

Glass

Controlled.

Reflections should reinforce materials.

Never dominate.

---

# Color Temperature

Structural lighting

Neutral cool.

Electrical lighting

Regional colors.

Background

Cool gray-blue.

Maintain consistency throughout the scene.

---

# Performance Rules

Prefer

- HDR environment
- Few high-quality lights
- Baked AO where possible
- Selective bloom

Avoid

- Excessive dynamic lights
- Multiple shadow casters
- Overdraw from bloom

---

# Acceptance Tests

□ Brain clearly separated from background

□ Materials remain readable

□ AO visible

□ Shadows stable

□ Bloom localized

□ Exposure balanced

□ HDR reflections subtle

□ Knowledge activation lighting functional

□ Seven-region synchronization balanced

□ Stable performance

---

# Success Criteria

The Lighting Pipeline succeeds when the brain appears like a premium engineered artifact operating within a controlled environment.

Lighting should support materials, computation, and interaction while preserving the brain as the visual centerpiece.

This document serves as the authoritative lighting specification for Project Cortex.