# Project Cortex
# 04_mesh_pipeline.md

Version: 1.0

Depends On

- 00_context.md
- 01_visual_design_system.md
- 01.5_interaction_architecture.md
- 02_reference_analysis.md
- 03_references/

---

# Purpose

This document defines how the primary Brain GLB asset is prepared before entering the rendering pipeline.

This document does not define

- Materials
- Shaders
- Lighting
- Animation
- UI

Its only purpose is to transform the anatomical GLB into a clean, optimized, semantically organized asset ready for Project Cortex.

---

# Primary Asset

Filename

Brain_port.glb

Role

Primary geometry for the Engineer's Brain.

The GLB provides

- Anatomical silhouette
- Surface topology
- Major folds
- Brainstem
- Cerebellum

The mesh is the structural foundation only.

Its appearance will be transformed later through materials and shaders.

---

# Pipeline Overview

Brain_port.glb

↓

Import

↓

Mesh Validation

↓

Cleanup

↓

Normalization

↓

Semantic Region Mapping

↓

Surface Preparation

↓

Base Alignment

↓

Optimization

↓

Ready for Material Pipeline

---

# Import Stage

Claude should

- Import the GLB
- Verify successful loading
- Preserve hierarchy
- Preserve UV coordinates
- Preserve smoothing information
- Preserve mesh integrity

No geometry modifications should occur during import.

---

# Mesh Validation

Immediately after import verify

- Mesh integrity
- Missing geometry
- Corrupt vertices
- Corrupt faces
- Broken normals
- Missing UVs
- Missing tangents
- Duplicate meshes

The mesh must pass validation before proceeding.

---

# Mesh Cleanup

Perform cleanup where required.

Tasks

- Remove duplicate vertices
- Remove unused materials
- Remove hidden objects
- Remove empty nodes
- Recalculate normals if necessary
- Generate tangents if missing
- Merge unnecessary mesh fragments
- Preserve topology

Cleanup should never alter the visible silhouette.

---

# Transform Normalization

Normalize

Origin

Rotation

Scale

The mesh should

- Face forward
- Sit upright
- Use world origin
- Maintain consistent scale

Freeze transforms before continuing.

---

# Pivot Placement

The pivot should be positioned at the geometric center of the mounted brain.

Rotation should feel natural.

Camera focus should always orbit around this point.

The pivot should not be placed inside the brainstem or cerebellum.

---

# Anatomical Preservation

The following anatomical features must remain recognizable.

- Left Hemisphere
- Right Hemisphere
- Frontal Region
- Parietal Region
- Temporal Regions
- Occipital Region
- Cerebellum
- Brainstem

The silhouette should never be sacrificed for additional detailing.

---

# Semantic Region Mapping

Create logical mesh groups.

These groups are not visual.

They are metadata used throughout the project.

Required Groups

Brain

├── Frontal

├── Parietal

├── Temporal_Left

├── Temporal_Right

├── Occipital

├── Cerebellum

└── Brainstem

Every later system references these groups.

Examples

- Hover
- Selection
- Raycasting
- Shader masks
- Packet routing
- Camera focus
- Knowledge panels

---

# Knowledge Mapping

Frontal

Programming Languages

---

Parietal

Frameworks

---

Temporal_Left

Core Computer Science

---

Temporal_Right

Artificial Intelligence

---

Occipital

Design & Development Tools

---

Cerebellum

Cloud & DevOps

---

Brainstem

IoT & Hardware

This mapping should remain consistent throughout Project Cortex.

---

# Region Boundaries

Region transitions should remain soft and anatomical.

Do not create visible seams.

Semantic boundaries exist logically.

Not physically.

Materials and shaders will later use these masks.

---

# Surface Preparation

The imported mesh should become ready for cybernetic enhancement.

The following additions are permitted.

- PCB routing
- Mechanical plates
- Routing channels
- Surface engraving
- Mounting points
- Chip locations
- Via locations
- Fiber optic channels
- Structural reinforcement

These additions must follow anatomical curvature.

No flat overlays.

No floating geometry.

---

# Detail Density

Visual complexity should vary naturally.

High-complexity regions

- Frontal
- Parietal

Medium

- Temporal

Lower

- Cerebellum
- Brainstem

Density should always feel intentional.

---

# Mechanical Integration

Future systems should have predefined attachment zones.

Possible attachment regions

- Panel connectors
- Electrical hubs
- Main routing buses
- Hover anchors
- Label anchors

These should exist logically even if invisible.

---

# Base Platform Alignment

The brain should never float.

It should mount to an engineered platform.

Requirements

- Stable center of gravity
- Symmetrical alignment
- Mechanical attachment
- Proper clearance
- Correct visual balance

The support should enhance presentation without becoming visually dominant.

---

# Coordinate System

Positive Y

Up

Positive Z

Forward

Center

World Origin

Maintain consistency throughout the project.

---

# UV Preservation

Preserve UV layout wherever possible.

Future materials may require

- Mask textures
- Curvature maps
- Ambient Occlusion
- Routing masks
- Vertex colors

Avoid unnecessary UV regeneration.

---

# Vertex Attributes

Preserve or generate

- Normals
- Tangents
- UVs
- Vertex Colors (optional)
- Curvature Data (optional)

These attributes may be consumed by later shaders.

---

# Future Geometry Enhancements

Permitted

- Panel segmentation
- Surface displacement
- Micro bevels
- PCB extrusion
- Chip insertion
- Routing grooves
- Mechanical seams
- Cable anchors

Not Permitted

- Destroying anatomical silhouette
- Excessive deformation
- Cartoon exaggeration
- Non-functional decoration

---

# Optimization

Target

Desktop First

Tasks

- Merge static geometry where appropriate
- Preserve instancing opportunities
- Minimize unnecessary materials
- Optimize vertex count
- Enable Meshopt compression
- Enable Draco compression if appropriate

Optimization must never noticeably reduce visual quality.

---

# Export Requirements

Final output

Optimized GLB

Requirements

- Correct transforms
- Correct normals
- Correct hierarchy
- Correct semantic groups
- Optimized geometry
- Production ready

---

# Acceptance Tests

Geometry

□ Mesh imports successfully

□ No corrupt geometry

□ No flipped normals

□ UVs preserved

□ Tangents generated

□ Pivot correctly positioned

□ Scale normalized

□ Rotation normalized

□ Brain centered

Anatomy

□ Silhouette preserved

□ Cerebellum preserved

□ Brainstem preserved

□ Seven logical regions created

□ Region boundaries verified

Preparation

□ Ready for materials

□ Ready for shaders

□ Ready for animation

□ Ready for interaction

□ Ready for UI integration

---

# Success Criteria

The Mesh Pipeline succeeds when the imported Brain_port.glb has become a clean, semantically organized, production-ready asset without sacrificing its anatomical identity.

Every subsequent rendering, interaction, shader, animation, lighting, and UI system should be able to operate using this asset without requiring further structural modifications.

This document serves as the authoritative mesh preparation reference for Project Cortex.