# Project Cortex
# 05_material_system.md

Version: 1.0

Depends On

- 00_context.md
- 01_visual_design_system.md
- 01.5_interaction_architecture.md
- 02_reference_analysis.md
- 03_references/
- 04_mesh_pipeline.md

---

# Purpose

This document defines every physical material used within Project Cortex.

It describes what each material represents, where it is used, how it should appear, and how it behaves.

This document intentionally avoids shader implementation.

Shader logic belongs to 06_shader_pipeline.md.

---

# Material Philosophy

Every visible surface should communicate engineering.

Materials should feel

- Precision Machined
- Premium
- Functional
- Industrial
- Purposeful

The object should never resemble

- Plastic
- Rubber
- Painted Metal
- Organic Tissue
- Toy Materials

---

# Material Hierarchy

Visual Stack

Electrical Energy

↓

Fiber Optic Channels

↓

Protective Glass

↓

Copper Routing

↓

Electronic Components

↓

PCB Substrate

↓

Titanium Structure

↓

Base Platform

Each layer serves a unique purpose.

No layer should visually replace another.

---

# Material Ownership

Graphite

Owner

Structural Foundation

---

Titanium

Owner

Mechanical Structure

---

Copper

Owner

Electrical Routing

---

Ceramic

Owner

Processing Components

---

Glass

Owner

Protection

---

Fiber Optics

Owner

Energy Transport

---

Electrical Core

Owner

Computation

---

White Hotspots

Owner

Active Processing

---

# Material 01

## Base Platform

Purpose

Supports the brain.

Characteristics

- Heavy
- Stable
- Premium
- Industrial

Primary Materials

- Graphite
- Titanium
- Frosted Glass

Allowed Details

- Fine machining
- Precision edges
- Minimal branding
- Soft accent lighting

The platform should never visually dominate the brain.

---

# Material 02

## Graphite Substrate

Purpose

Main body of the brain.

Characteristics

- Dark graphite
- Matte
- Slight roughness
- Soft reflections

Must Never

Glow.

Represent computation.

Receive regional colors.

The graphite is passive.

---

# Material 03

## Titanium Structure

Purpose

Mechanical reinforcement.

Characteristics

- Brushed finish
- Precision machined
- Medium reflectivity
- Fine grain

Used For

- Shells
- Supports
- Reinforcement
- Structural ribs

---

# Material 04

## Copper Routing

Purpose

Electrical conductors.

Characteristics

- Metallic
- Warm
- Slightly polished
- Thin protective coating

Copper itself should remain visible beneath emissive routing.

It should still look believable when inactive.

---

# Material 05

## Ceramic Components

Purpose

Integrated processing hardware.

Characteristics

- Matte
- Dense
- Clean
- Minimal markings

Examples

- CPUs
- Controllers
- Memory
- Signal processors

These never emit light.

---

# Material 06

## Fiber Optic Channels

Purpose

Visible transport of computation.

Characteristics

- Glass covering
- Colored emissive core
- High clarity
- Smooth finish

Fiber channels transport visual energy.

---

# Material 07

## Protective Glass

Purpose

Protect routing.

Characteristics

- Slight transparency
- Low tint
- Clean reflections
- Soft edges

Should be subtle.

Never distracting.

---

# Material 08

## Electrical Core

Purpose

Represents active computation.

Characteristics

- High emissive intensity
- Colored according to knowledge region
- Soft bloom
- Bright center

Exists only inside routing channels.

Never fills surfaces.

---

# Material Layering

Every visible routing section should read as

Graphite

↓

Copper

↓

Glass Channel

↓

Electrical Core

This order should remain consistent across the entire project.

---

# Material Behaviour

Graphite

Never glows.

---

Titanium

Reflects.

Never emits.

---

Copper

Reflects.

Supports routing.

Never becomes a glowing ribbon.

---

Ceramic

Always passive.

---

Glass

Protects.

Never emits.

---

Fiber Channels

May glow.

May transport packets.

---

Electrical Core

Always animated.

Always emissive.

Represents computation.

---

# Regional Variations

Structural materials remain identical.

Only

Electrical Core

changes between knowledge regions.

No material replacement occurs between lobes.

Only computational color changes.

---

# Material Interaction

Hover

Increase emissive only.

Selection

Increase packet intensity.

Knowledge Activation

Increase computational activity.

Structural materials remain unchanged.

---

# Wear Philosophy

Materials should appear

Maintained

Calibrated

Operational

Avoid

Rust

Dust

Scratches

Damage

Battle wear

The object is a precision instrument.

---

# Reflection Rules

Graphite

Very Low

---

Titanium

Medium

---

Copper

Medium

---

Glass

Controlled

---

Electrical Core

No reflections required.

Brightness comes from emission.

---

# Bloom Eligibility

Eligible

- Electrical Core
- Fiber Channels
- Active Connector Nodes
- White Hotspots

Not Eligible

- Graphite
- Titanium
- Ceramic
- Base Platform

---

# Material Consistency

Every knowledge region shares the same material system.

Only

- Emissive color
- Packet frequency
- Packet density

may vary.

The engineering remains unified.

---

# Future Material Slots

Reserved

- Project holograms
- Timeline overlays
- AI visualization
- Research overlays
- Live system indicators

These additions should integrate into the existing hierarchy.

---

# Acceptance Tests

Structure

□ Graphite never glows

□ Titanium never emits

□ Copper remains metallic

□ Ceramic remains passive

□ Glass remains transparent

Energy

□ Only Electrical Core emits

□ Bloom limited to energy

□ No glowing substrate

□ No glowing shell

Consistency

□ Same materials across all lobes

□ Only computation changes color

□ Layer order preserved

□ Premium industrial appearance maintained

---

# Success Criteria

The Material System succeeds when every visible surface immediately communicates its engineering purpose.

A viewer should instinctively distinguish

Structure

from

Mechanics

from

Electronics

from

Computation

without requiring explanation.

This document serves as the authoritative material specification for Project Cortex.