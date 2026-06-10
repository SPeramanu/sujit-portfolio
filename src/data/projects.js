// ============================================================
//  PROJECTS — card grid; clicking a card opens a modal.
//
//  Media options per project (all optional):
//    thumb:   card thumbnail image          -> put files in /public/assets/...
//    video:   local video file              -> e.g. 'assets/videos/oct-demo.mp4'
//    youtube: YouTube video ID              -> e.g. 'dQw4w9WgXcQ' (overrides video)
//    images:  gallery of images             -> ['assets/photos/x.jpg', ...]
//
//  To add a video: drop the .mp4 into /public/assets/videos/ and set
//  video: 'assets/videos/yourfile.mp4' below.
// ============================================================

export const projects = [
  {
    id: 'oct-grasping',
    title: 'OCT-Guided Surgical Grasping',
    subtitle: 'Imitation learning on a 6-DoF surgical arm',
    period: '2025 — Present',
    role: 'Researcher · MEDCVR',
    thumb: 'assets/projects/oct.svg',
    tags: ['Diffusion Policy', 'OCT', 'ROS 2', 'PyTorch', 'VoxelNeXt'],
    description: [
      'Thesis research investigating optical coherence tomography (OCT) as the sole visuomotor observation modality for learned surgical manipulation policies.',
      'Designed and benchmarked Diffusion Policy, DP3, and ACT architectures across three control parameterizations (absolute joint, relative joint, Cartesian RCM) on a Stäubli TX2-60L arm.',
      'Achieved full constrained-grasping task completion conditioned solely on OCT point clouds with per-voxel intensity, running closed-loop at 10–15 Hz on real hardware.',
    ],
    video: null, // e.g. 'assets/videos/oct-demo.mp4'
    youtube: null,
    images: ['assets/projects/oct.svg'],
  },
  {
    id: 'drone-capstone',
    title: 'Drone Stereo-Vision Capstone',
    subtitle: 'Real-time 3D target tracking on Jetson Nano',
    period: 'Jan 2026 — Apr 2026',
    role: 'Computer Vision Lead',
    thumb: 'assets/projects/drone.svg',
    tags: ['YOLOv8', 'TensorRT', 'Stereo Depth', 'ROS 2', 'Sensor Fusion'],
    description: [
      'Deployed a stereo-vision pipeline on Jetson Nano using a custom-trained, TensorRT-optimized YOLOv8n model for real-time detection at ~20 Hz with ±2 cm pose error.',
      'Fused IMX219 RGB detections with Intel RealSense T265 stereo depth (SGBM) via cross-camera extrinsic calibration to recover full 3D target pose; applied adaptive EMA smoothing and jump rejection for robustness under vibration.',
      'Architected a modular multi-node ROS 2 perception stack separating inference, depth estimation, and sensor fusion for clean integration with flight controls.',
    ],
    video: null,
    youtube: null,
    images: ['assets/projects/drone.svg'],
  },
  {
    id: 'igvc-rover',
    title: 'IGVC Autonomous Rover',
    subtitle: 'University of Toronto Autonomous Rover Team',
    period: 'Jul 2023 — Aug 2024',
    role: 'ROS Executive',
    thumb: 'assets/projects/rover.svg',
    tags: ['ROS 2', 'SLAM', 'Path Planning', 'LiDAR', 'Gazebo'],
    description: [
      'Led ROS 2 software development for the Intelligent Ground Vehicle Competition (IGVC).',
      'Integrated Cartographer SLAM and costmap-based path planning from the ROS Navigation Stack; fused LiDAR and camera data into accurate environmental maps for autonomous traversal.',
      'Calibrated and filtered LiDAR and camera sensors, reducing odometry drift by 5%; tuned a PID path-tracking controller that cut off-course veering by 20%, validated end-to-end in Gazebo with a differential-drive URDF model.',
    ],
    video: null,
    youtube: null,
    images: ['assets/projects/rover.svg'],
  },
  {
    id: 'flamebot',
    title: 'FlameBot',
    subtitle: 'Fire surveyor & mitigation robot',
    period: 'Feb 2024 — Apr 2024',
    role: 'Embedded Lead · Personal Project',
    thumb: 'assets/projects/flamebot.svg',
    tags: ['STM32', 'Embedded C', 'PID', 'Real-Time', 'JTAG'],
    description: [
      'Designed a flame-detection robot that locates and extinguishes active fires within a designated area, achieving a 95% extinguish success rate.',
      'Built the system around an STM32 MCU; developed real-time firmware in Embedded C with ADC HAL sensor acquisition and interrupt-driven fire detection.',
      'Applied PID line-tracking control for surveying and actuated a servo pump for precise water ejection; validated firmware with a JTAG debugger.',
    ],
    video: null,
    youtube: null,
    images: ['assets/projects/flamebot.svg'],
  },
  {
    id: 'robochef',
    title: 'RoboChef',
    subtitle: 'IMU-driven robotic arm follower',
    period: 'Feb 2024',
    role: 'Project Lead · Personal Project',
    thumb: 'assets/projects/robochef.svg',
    tags: ['ESP32', 'Bluetooth', 'IMU', 'Stepper Motors'],
    description: [
      'Designed and fabricated a robotic arm that mirrors human arm motion using commands derived from arm-mounted inertial sensor units.',
      'Built a wireless link with an ESP32 Bluetooth master and an Arduino HC-05 module; engineered the MCU integration circuit driving three NEMA-17 steppers and a claw.',
    ],
    video: null,
    youtube: null,
    images: ['assets/projects/robochef.svg'],
  },
];
