# Project Cortex
# 07_animation_pipeline.md

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

---

# Purpose

This document defines every animation within Project Cortex.

Animation should communicate computation.

Every movement should reinforce the illusion that the Engineer's Brain is continuously processing knowledge.

---

# Animation Philosophy

Animation should feel

- Calm
- Purposeful
- Responsive
- Mechanical
- Intelligent

Never flashy.

Never distracting.

---

# Animation State Machine

Dormant

↓

Idle

↓

Hover

↓

Selected

↓

Knowledge Activated

↓

Knowledge Synchronized

↓

Return to Idle

Every interaction follows this lifecycle.

---

# Dormant State

Visible on initial page load.

Characteristics

- Very dim routing
- Minimal particles
- Lowest electrical activity
- No active panels

Purpose

Invite interaction.

---

# Idle State

The normal operating state.

Characteristics

- Continuous packet movement
- Slow floating motion
- Gentle breathing glow
- Ambient particles

The brain should never appear frozen.

---

# Hover State

Purpose

Communicate interactivity.

Effects

- Slight emissive increase
- Slight packet acceleration
- Label highlight
- Connector node illumination

Duration

150–250 ms

---

# Selection State

Sequence

Click

↓

Region Brightens

↓

Packets Accelerate

↓

Connector Node Activates

↓

Connector Line Grows

↓

Energy Packet Travels

↓

Knowledge Panel Deploys

↓

Skills Fade In

↓

Return To Active Idle

Duration

600–900 ms

---

# Knowledge Activation

Every activated knowledge region becomes independently active.

Effects

- Increased packet density
- Higher emissive intensity
- Increased routing activity
- Persistent highlight

Previously activated regions remain active.

---

# Knowledge Synchronization

When all seven knowledge regions become active

The brain enters its maximum operational state.

Effects

- Every routing network active
- Maximum packet diversity
- Highest computational appearance
- Stable visual balance

The brain should appear fully awakened.

---

# Electrical Packet Choreography

Packets represent computation.

Characteristics

- Independent timing
- Variable speed
- Variable spacing
- Regional routing only
- Continuous circulation

Packets should never

- Jump
- Teleport
- Cross regions
- Reverse randomly

---

# Brain Motion

Movement should remain subtle.

Allowed

- Gentle floating
- Slow rotation
- Micro breathing

Avoid

- Large oscillations
- Constant spinning
- Dramatic movement

---

# Camera Animation

Idle

Very slow orbit.

Hover

Minor focus shift.

Selection

Smooth zoom.

Deselection

Smooth return.

The camera should never disorient the visitor.

---

# Connector Animation

Sequence

Node Brightens

↓

Connector Grows

↓

Packet Travels

↓

Panel Deploys

↓

Connector Remains Active

Reverse on deselection.

---

# Knowledge Panel Animation

Deployment

Opacity

↓

Scale

↓

Vertical Translation

↓

Content Fade

Panels should feel like precision instruments deploying.

---

# Typography Animation

Title

Soft fade.

Body

Sequential fade.

Skill Chips

Short stagger.

Avoid excessive animation.

---

# Particle Animation

Purpose

Environmental atmosphere.

Characteristics

- Sparse
- Slow
- Independent
- Non-repetitive

Particles should never dominate the scene.

---

# Base Platform Animation

Allowed

- Very subtle glow
- Soft energy pulse
- Minimal light breathing

Never animate the platform aggressively.

---

# Transition Curves

Preferred

- Ease In-Out
- Smoothstep
- Cubic
- Sine

Avoid

- Bounce
- Elastic
- Overshoot

---

# Timing Reference

Hover

150–250 ms

Selection

600–900 ms

Camera

500–800 ms

Connector

250–400 ms

Panel

350–600 ms

Knowledge Activation

800–1200 ms

Knowledge Synchronization

1200–1800 ms

---

# Continuous Systems

Always Running

- Idle Float
- Packet Routing
- Ambient Particles
- Micro Emissive Flicker

Interaction should enhance these systems.

Not replace them.

---

# Performance Rules

Prefer

- GPU animation
- Uniform interpolation
- Time-based shaders

Avoid

- Heavy CPU calculations
- Frequent React state updates
- Expensive per-frame allocations

---

# Acceptance Tests

□ Brain never becomes static

□ Idle animation visible

□ Hover immediate

□ Selection smooth

□ Connector sequence correct

□ Panels deploy correctly

□ Packets remain inside regions

□ Seven-region synchronization works

□ Camera transitions smooth

□ Stable frame rate maintained

---

# Success Criteria

The Animation Pipeline succeeds when every movement communicates computation rather than decoration.

Visitors should feel they are progressively awakening an engineer's knowledge through interaction.

This document serves as the authoritative animation specification for Project Cortex.