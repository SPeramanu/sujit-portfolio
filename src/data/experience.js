// ============================================================
//  EXPERIENCE — timeline entries, rendered top-to-bottom.
//  Add a new object to the array to add a role.
// ============================================================

export const experience = [
  {
    role: 'Robotics Research Thesis — MEDCVR',
    company: 'Institute of Biomedical Engineering, University of Toronto',
    location: 'Toronto, Canada',
    dates: 'Sep 2025 — Present',
    tags: ['Imitation Learning', 'OCT', 'ROS 2', 'Diffusion Policy', 'Stäubli TX2-60L'],
    bullets: [
      'Investigating OCT as a primary visuomotor observation modality for imitation-learning policies performing constrained surgical grasping on a Stäubli TX2-60L 6-DoF arm; designed and evaluated Diffusion Policy, DP3, and ACT architectures across absolute joint, relative joint, and Cartesian RCM control modes.',
      'Achieved full task completion using Diffusion Policy conditioned solely on OCT point clouds with per-voxel intensity.',
      'Built a custom ROS 2 multimodal data-acquisition framework with POSIX shared-memory OCT ingestion at 20 Hz, bypassing serialization overhead; deployed closed-loop inference at 10–15 Hz on physical hardware.',
      'Applied VoxelNeXt for OCT point-cloud encoding; implemented a two-stage RCM inverse-kinematics solver. Paper in preparation for journal submission.',
    ],
  },
  {
    role: 'Robotics / Software Engineering Intern',
    company: 'Mission Control Space Services',
    location: 'Ottawa, Canada',
    dates: 'Nov 2024 — Aug 2025',
    tags: ['Lunar Rovers', 'YAMCS', 'Python', 'Redis', 'Vue.js', 'Django'],
    bullets: [
      'Stood up a Java-built YAMCS mission server and developed a Python–Redis command-execution backend bridge; integrated both with Spacefarer™ for the Astrobotic CubeRover™ demonstration mission.',
      'Enhanced BEACON Bridge, flight software for live lunar rover operations, with command-action features and comprehensive unit testing.',
      'Implemented an integrated activity-planner mode in Spacefarer™ using Vue.js and a Django authentication framework.',
      'Hosted CARLE, a collaborative rover mission activity encouraging K-12 students to pursue space and engineering.',
    ],
  },
  {
    role: 'Robotics Engineering Intern',
    company: 'OHB System AG',
    location: 'Munich, Germany',
    dates: 'Jul 2024 — Oct 2024',
    tags: ['KUKA', 'KRL', 'RSI', 'Force-Torque Control'],
    bullets: [
      'Developed KRL scripts using RSI contexts to create force-torque-control tasks on a KUKA robot for OHB component-testing procedures.',
      'Created end-to-end documentation for installation and programming of the KUKA ForTTran SG-500 sensor for internal company use.',
    ],
  },
  {
    role: 'Software Engineer Intern',
    company: 'TEKTELIC Communications',
    location: 'Calgary, Canada',
    dates: 'May 2022 — Aug 2022 · May 2023 — Aug 2023',
    tags: ['Robot Framework', 'Python', 'Test Automation', 'IoT'],
    bullets: [
      'Designed and deployed gateway test-automation scripts in Robot Framework, cutting end-to-end testing duration by 40%.',
      'Built Python tooling to automate Ethernet BSP upgrade-report generation; leveraged TestRail for developer-driven QA pipelines.',
    ],
  },
];
