/**
 * Project Cortex — the fixed 7-region knowledge architecture.
 *
 * regionId is authoritative: it matches the per-vertex aRegionId attribute baked
 * by the mesh pipeline, the shader uniform-array indices, the palette order, and
 * (later) the raycast lookup. Do not reorder.
 *
 * Knowledge mapping per docs/01.5_interaction_architecture.md & 04_mesh_pipeline.md.
 */

export interface Region {
  id: number
  /** Slug used to match GLB node names during mesh processing. */
  key: string
  /** Regex applied to GLB node/mesh names to assign geometry to this region. */
  match: RegExp | null
  name: string
  knowledge: string
  description: string
  skills: string[]
}

export const REGIONS: Region[] = [
  {
    id: 0,
    key: 'frontal',
    match: /frontal/i,
    name: 'Frontal',
    knowledge: 'Programming Languages',
    description: 'The core instruction set — the languages thought is expressed in.',
    skills: ['Python', 'JavaScript', 'Java', 'C'],
  },
  {
    id: 1,
    key: 'parietal',
    match: /parietal/i,
    name: 'Parietal',
    knowledge: 'Frameworks',
    description: 'Structured systems that turn language into working services.',
    skills: ['Express.js', 'FastAPI', 'Flask', 'REST APIs'],
  },
  {
    id: 2,
    key: 'temporal_left',
    match: null, // derived by splitting the Temporal mesh on the mid-sagittal plane
    name: 'Left Temporal',
    knowledge: 'Core Computer Science',
    description: 'Analytical computation and the theory underneath the machine.',
    skills: ['DSA', 'DAA', 'Operating Systems', 'DBMS', 'Software Engineering'],
  },
  {
    id: 3,
    key: 'temporal_right',
    match: null, // derived split (see Left Temporal)
    name: 'Right Temporal',
    knowledge: 'Artificial Intelligence',
    description: 'Applied intelligence — reasoning systems and language models.',
    skills: ['Prompt Engineering', 'LLM APIs', 'AI Product Development'],
  },
  {
    id: 4,
    key: 'occipital',
    match: /occipital/i,
    name: 'Occipital',
    knowledge: 'Design & Development Tools',
    description: 'How the work is seen, shaped, and shipped.',
    skills: ['Figma', 'UI/UX', 'VS Code', 'Postman'],
  },
  {
    id: 5,
    key: 'cerebellum',
    match: /cerebellum/i,
    name: 'Cerebellum',
    knowledge: 'Cloud & DevOps',
    description: 'Coordination and infrastructure — where code runs and scales.',
    skills: ['Docker', 'Git', 'Linux', 'Deployment'],
  },
  {
    id: 6,
    key: 'brainstem',
    match: /brainstem|nerve/i,
    name: 'Brainstem',
    knowledge: 'IoT & Hardware',
    description: 'The communication bus to the physical world.',
    skills: ['Embedded IoT', 'Sensor Integration', 'Solid Edge CAD', 'Gas AQI Systems'],
  },
]

export const REGION_COUNT = REGIONS.length // 7

export const TEMPORAL_LEFT_ID = 2
export const TEMPORAL_RIGHT_ID = 3

/** The source Temporal mesh is matched here, then split into ids 2 & 3. */
export const TEMPORAL_MATCH = /temporal/i
