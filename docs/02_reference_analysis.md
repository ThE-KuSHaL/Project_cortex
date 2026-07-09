# Project Cortex
# 02_reference_analysis.md

Version: 1.0

Depends On

- 00_context.md
- 01_visual_design_system.md
- 01.5_interaction_architecture.md

---

# Purpose

This document reverse engineers the supplied reference artwork into an engineering specification.

The purpose is NOT to reproduce the artwork.

The purpose is to understand WHY the artwork feels premium and HOW those principles can be recreated using a completely different implementation built around an actual 3D GLB brain model.

This document intentionally avoids discussing implementation details such as React, Three.js, Blender, GLSL or shaders.

Those belong to later documents.

This document exists only to answer one question.

> "What exactly are we trying to build?"

Everything implemented later must trace its design decisions back to this document.

---

# Scope

This document IS

• Visual analysis

• Composition analysis

• Material observations

• Lighting observations

• Color analysis

• Design language extraction

• Reverse engineering

This document IS NOT

• Blender guide

• React documentation

• Shader implementation

• Material implementation

• Animation implementation

• Programming guide

---

# Executive Summary

The supplied artwork depicts a cybernetic representation of an engineer's brain.

It should not be interpreted as an anatomical illustration.

Instead it should be viewed as an engineered object whose silhouette resembles a human brain.

The brain acts as the central visual metaphor for technical knowledge.

Every visible element contributes toward communicating engineering rather than biology.

The circuitry is the subject.

The brain is merely the structure that contains it.

The objective is therefore not to recreate anatomy.

The objective is to recreate engineered intelligence.

---

# First Visual Impression

When viewing the artwork the human eye immediately notices

1.

Large illuminated cybernetic object

↓

2.

Brain silhouette

↓

3.

Colored computational regions

↓

4.

Information cards

↓

5.

Detailed circuitry

↓

6.

Fine mechanical details

↓

7.

Typography

The reading order is intentional.

The viewer first experiences emotion before reading information.

Project Cortex should preserve this order.

---

# Overall Composition

The composition is strongly centered.

The brain occupies approximately forty to fifty percent of the entire frame.

It dominates every other interface element.

Everything else exists to support it.

The left side contains explanatory content.

The right side contains complementary knowledge panels.

Neither side competes with the centerpiece.

Large amounts of negative space are deliberately preserved.

This prevents visual clutter.

The overall composition communicates confidence.

Nothing feels crowded.

Nothing appears accidental.

---

# Visual Hierarchy

Priority One

Brain

Priority Two

Electrical activity

Priority Three

Knowledge cards

Priority Four

Connector lines

Priority Five

Background atmosphere

Priority Six

Typography

If at any point another element visually competes with the brain, the hierarchy has been violated.

---

# Camera Analysis

The camera is positioned in a three-quarter perspective.

Neither perfectly side-on nor perfectly front-on.

The viewpoint allows both hemispheres to remain visually readable.

The brainstem remains visible.

The cerebellum remains visible.

The perspective communicates depth without exaggeration.

The field of view appears moderate.

Approximately equivalent to a 35–50 mm camera lens.

This minimizes distortion while preserving volume.

The object should never feel flattened.

---

# Brain Silhouette Analysis

The silhouette remains recognizably anatomical.

However, it has clearly been stylized.

Characteristics include

• Enlarged hemispheres

• Pronounced frontal mass

• Clear cerebellum

• Mechanical brainstem

• Strong overall outline

The silhouette contributes more to recognition than internal anatomy.

Therefore the GLB should preserve

overall proportions

major folds

hemisphere balance

brainstem

cerebellum

while allowing surface detail to become highly engineered.

---

# Surface Engineering Analysis

This is the defining characteristic of the artwork.

The surface is not painted.

It is constructed.

Every region appears fabricated from electronic hardware.

The following elements are visible.

Raised conductive traces

Recessed routing channels

Mechanical plates

Integrated chips

Copper pathways

Vias

Connector pads

Electronic junctions

Embedded components

Surface segmentation

There are almost no empty areas.

The object rewards close inspection.

Zooming in continuously reveals additional detail.

This perceived complexity is a primary contributor to realism.

---

# Circuit Routing Analysis

The routing resembles professional PCB design.

It does not resemble random artistic lines.

Routing characteristics include

Parallel buses

Ninety-degree turns

Forty-five-degree transitions

Branching signal paths

Hierarchical trace widths

Dense routing around high-information regions

Consistent spacing

Purposeful organization

The routing feels engineered.

Not decorative.

This distinction is critical.

---

# Material Breakdown

Several material families can be inferred.

Dark graphite substrate

Brushed titanium structural elements

Copper conductive pathways

Ceramic integrated circuits

Glass-covered fiber optic channels

High-energy emissive cores

The object appears manufactured.

No material resembles plastic.

No region appears painted.

Material variation contributes significantly to realism.

---

# Color Architecture

Color is treated as information.

Not decoration.

Each region possesses its own identity.

However

color does not fill the surface.

Instead

the substrate remains dark.

The traces emit color.

Electrical activity carries color.

Mechanical components remain mostly neutral.

This restraint creates sophistication.

The brightest areas occupy only a small percentage of the object.

White exists only at energy convergence points.

---

# Region Separation

Each lobe appears electrically independent.

The boundaries are visually respected.

There is no uncontrolled color bleeding.

Each region resembles an independent subsystem connected through a larger computational architecture.

This principle should be preserved.

---

# Lighting Analysis

The lighting is cinematic rather than technical.

The scene contains

Strong rim lighting

Soft ambient illumination

Controlled bloom

Subtle reflections

Directional highlights

Deep shadows

The lighting emphasizes form.

Not spectacle.

Darkness is used intentionally to reveal illuminated information.

---

# Bloom Analysis

Bloom exists only where energy exists.

It does not wash across the entire object.

It remains tightly controlled.

The bloom strengthens the illusion of intense electrical activity without sacrificing surface detail.

This restraint is a major reason the artwork feels premium.

---

# Background Analysis

The background is intentionally understated.

It contains

Subtle grids

Minimal circuitry

Soft atmospheric gradients

Sparse interface hints

Tiny geometric accents

The background supports the composition without competing for attention.

Its primary purpose is depth.

---

# UI Composition Analysis

The interface elements feel integrated into the object.

Cards do not appear randomly placed.

Connector lines originate from meaningful locations.

Spacing remains consistent.

Typography remains understated.

Cards appear lightweight.

Nothing obscures the centerpiece.

The interface exists to explain the brain rather than replace it.

---

# Animation Inference

Although the image is static, it strongly implies motion.

Likely animated systems include

Electrical packets

Slow computational pulse

Idle breathing glow

Particle drift

Connector activation

Knowledge activation

Hover highlighting

Energy propagation

Motion should communicate computation rather than decoration.

---

# Premium Characteristics

The artwork feels premium because of

Material hierarchy

Restrained bloom

Controlled color palette

Excellent negative space

Strong silhouette

Consistent spacing

Layered surface detail

Purposeful lighting

Clear visual hierarchy

Engineering-inspired geometry

None of these individually create quality.

Together they produce the premium appearance.

---

# Elements That Should NOT Be Copied

Project Cortex must NOT reproduce

Exact text

Exact typography

Exact icons

Exact card layout

Exact connector routing

Exact colors

Exact proportions

Exact composition

These belong to the original artwork.

Instead Project Cortex should reproduce

The design philosophy

The engineering language

The interaction quality

The material realism

The visual hierarchy

The sense of precision

---

# Reverse Engineering Conclusions

The following truths should guide every future implementation.

The circuitry is the primary visual subject.

The brain is only the supporting silhouette.

Engineering detail creates realism.

Materials create credibility.

Lighting creates depth.

Color represents information.

Motion represents computation.

The interface supports the brain.

The brain remains the visual centerpiece.

Every future design decision should reinforce these principles.

---

# Acceptance Criteria

This document has fulfilled its purpose if a developer who has never seen the reference artwork can understand

• what the object represents

• why it feels premium

• what visual principles matter

• what should be preserved

• what should intentionally change

without reading any implementation documentation.

If implementation documents disagree with this analysis, this document takes precedence regarding visual intent.