# Project Cortex
# 09_ui_pipeline.md

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
- 08_lighting_pipeline.md

---

# Purpose

This document defines the complete User Interface pipeline for Project Cortex.

The UI exists to support the Engineer's Brain.

The UI must never compete with the brain for visual attention.

---

# UI Philosophy

The Engineer's Brain is the interface.

Panels explain.

The brain inspires.

Navigation should feel like discovering knowledge rather than opening menus.

---

# Layout Philosophy

The brain always occupies the visual center.

Everything else is positioned around it.

Maintain generous negative space.

Never allow UI elements to overlap the brain.

---

# Section Structure

Heading

ENGINEER'S BRAIN

Subtitle

Interactive Knowledge Architecture

Center

Interactive Brain

Around the Brain

Knowledge Panels

Background

Minimal technical atmosphere

---

# Brain Placement

Requirements

- Perfect visual center
- Never clipped
- Always visible
- Largest object in the viewport

The UI should adapt around the brain.

Never the opposite.

---

# Knowledge Panels

One panel exists for every knowledge region.

Maximum

Seven panels.

Each panel represents one knowledge family.

Panels remain visible until manually deselected.

---

# Panel Structure

Each panel contains

- Title
- Short Description
- Technology Stack
- Skill Chips
- Future Project Links
- External Links (Future)

Information should remain concise.

---

# Panel Spawn Algorithm

The first panel always appears

Lower Left.

Additional panels continue clockwise.

Spawn Order

1

Lower Left

2

Left Center

3

Upper Left

4

Upper Right

5

Right Center

6

Lower Right

7

Bottom Center (Optional if required)

The objective is to keep the brain visually unobstructed.

---

# Multi Selection

Every selected knowledge region remains active.

Panels never replace one another.

Panels rearrange automatically.

Maintain equal spacing.

Avoid overlap.

---

# Connector System

Every panel owns exactly one connector.

Connector Sequence

Node

↓

Grow

↓

Packet

↓

Panel

↓

Idle

Connector lines remain active while the panel remains active.

---

# Label System

Every knowledge region contains a label.

Requirements

- Camera facing
- Readable
- Hoverable
- Clickable
- Responsive

Clicking a label behaves exactly like clicking the lobe.

---

# Typography

Characteristics

- Modern
- Geometric
- High readability
- Medium weight

Typography supports.

Never dominates.

---

# Skill Chips

Each technology appears as a compact chip.

Examples

Python

Docker

FastAPI

Git

ESP32

Characteristics

- Rounded
- Compact
- Glass appearance
- Regional accent color

---

# Hover Behaviour

Hovering

- Highlights label
- Highlights lobe
- Increases routing activity
- Activates connector node

Panels remain hidden.

---

# Selection Behaviour

Selecting

- Activates lobe
- Deploys connector
- Deploys panel
- Maintains routing activity

Deselecting reverses the sequence.

---

# Knowledge Synchronization

The UI reflects the current knowledge state.

One active region

One panel.

Four active regions

Four panels.

Seven active regions

Complete knowledge architecture visible.

The UI should feel progressively richer.

---

# Camera Integration

Panels never block camera movement.

Camera transitions should account for visible panels.

Brain remains the visual anchor.

---

# Responsive Behaviour

Desktop

Panels surround the brain.

Tablet

Panels occupy left and right columns.

Mobile

Panels stack beneath the brain.

The interaction model remains identical.

---

# Future Expansion

Reserved

- Project cards
- Research papers
- Publications
- GitHub repositories
- Patent links
- Timeline mode

The layout should support future additions without redesign.

---

# Performance Rules

Avoid

- Expensive layout recalculations
- Frequent React re-renders
- Excessive DOM nesting

Prefer

- GPU animations
- Transform-based movement
- Reusable components
- Stable layout

---

# Acceptance Tests

□ Brain always centered

□ Panels never overlap brain

□ Clockwise spawn order maintained

□ Multi-selection works

□ Connector animation correct

□ Labels clickable

□ Typography readable

□ Skill chips responsive

□ Responsive layout functional

□ Stable performance

---

# Success Criteria

The UI Pipeline succeeds when visitors instinctively understand that the Engineer's Brain itself is the primary interface, while the surrounding panels simply reveal the knowledge contained within it.

The UI should feel calm, organized, and engineered, always reinforcing the brain as the centerpiece of the experience.

This document serves as the authoritative UI specification for Project Cortex.