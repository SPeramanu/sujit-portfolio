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
    title: 'OCT-Conditioned Imitation Learning for Constrained Robotic Grasping',
    subtitle: 'Imitation learning on a 6-DoF surgical arm',
    period: '2025 — Apr 2026',
    role: 'Undergraduate Thesis',
    thumb: 'assets/projects/OCT_system.jpg',
    reportUrl: 'assets/Sujit_Peramanu_Thesis.pdf',
    reportLabel: 'Read the full thesis (PDF)',
    tags: ['Diffusion Policy', 'DP3', 'ACT', 'OCT', 'ROS 2', 'PyTorch', 'Point Clouds', 'RCM IK', 'NVIDIA H100'],
    rich: {
      eyebrow:
        'Undergraduate Thesis · Supervisor: Prof. Lueder Kahrs · Division of Engineering Science, University of Toronto · April 2026',
      lede:
        'Can a high-resolution interferometric imaging modality replace cameras as the eyes of a surgical robot? My thesis shows that Optical Coherence Tomography (OCT) alone is a sufficient observation source for diffusion-based imitation learning policies that complete constrained grasping tasks on a physical 6-DoF arm.',
      pipelineLabel: 'End-to-end pipeline · Designed, built & evaluated',
      pipeline: [
        { k: 'Acquisition', t: 'Multimodal ROS 2 sync', s: 'OCT via shared memory, 20 Hz' },
        { k: 'Platform', t: 'Stäubli TX2-60L + da Vinci tip', s: 'Software-enforced RCM' },
        { k: 'Policies', t: 'Diffusion Policy · DP3 · ACT', s: 'Expert teleop demos' },
        { k: 'Ablation', t: 'Observation modalities', s: 'OCT · intensity · joints · F/T' },
        { k: 'Deployment', t: 'Closed-loop control', s: '10–15 Hz on hardware' },
      ],
      stats: [
        { v: '20 Hz', l: 'OCT volumes streamed via POSIX shared memory, bypassing ROS serialization' },
        { v: '10–15 Hz', l: 'Closed-loop policy inference on the physical robot' },
        { v: '3 × 3', l: 'Imitation architectures evaluated across three control modes' },
      ],
      sections: [
        {
          title: 'Motivation & problem',
          body: [
            'Minimally invasive robotic surgery demands precise, adaptive tool control within confined, anatomy-constrained workspaces. The perceptual modalities used today (endoscopic and stereo cameras) lack the axial resolution needed for micrometer-scale depth sensing and subsurface tissue imaging.',
            'Optical Coherence Tomography (OCT) is a high-resolution interferometric imaging modality that captures volumetric, subsurface structure. This thesis investigates whether OCT can serve as the primary observation source for imitation learning policies performing constrained surgical subtasks on a physical robotic arm.',
          ],
        },
        {
          title: 'Technical approach',
          body: [
            'I designed, implemented, and evaluated a complete end-to-end pipeline:',
            '- Real-time multimodal data acquisition via a custom ROS 2 synchronization framework, with OCT volumes sampled directly from POSIX shared memory at up to 20 Hz, bypassing ROS serialization to minimize latency.',
            '- A Stäubli TX2-60L 6-DoF arm fitted with a da Vinci endowrist grasping tooltip, operating under a software-enforced Remote Center of Motion (RCM) constraint to simulate trocar-based minimally invasive surgery.',
            '- Three imitation learning architectures: Diffusion Policy, 3D Diffusion Policy (DP3), and Action Chunking with Transformers (ACT). Policies were trained on expert teleoperation demonstrations across absolute joint, relative joint, and Cartesian RCM control modes.',
            '- An ablation over observation modalities: OCT point clouds, per-voxel OCT intensity, joint-angle proprioception, and six-axis wrist force-torque feedback — individually and in combination.',
            '- Training on NVIDIA H100 GPU clusters (Compute Canada), with inference deployed closed-loop at 10–15 Hz on the physical platform.',
          ],
        },
      ],
      cardsTitle: 'Key findings',
      cards: [
        {
          icon: '◎',
          title: 'OCT alone is sufficient',
          body:
            'Diffusion Policy conditioned solely on OCT point clouds augmented with per-voxel intensity achieved full task completion under both relative-joint and Cartesian RCM control - no cameras or proprioception required.',
        },
        {
          icon: '⚠',
          title: 'Proprioception caused causal confusion',
          body:
            'Counterintuitively, adding joint angles degraded performance: the policy learned to reproduce proprioceptive trajectories instead of responding to the 3D scene.',
        },
        {
          icon: '◧',
          title: 'Force feedback was drowned out',
          body:
            'The 6-D wrench occupied <3% of the flattened observation space but most importantly it received negligible gradient signal during training. Further research is needed to deterministically model contact dynamics through force feedback.',
        },
        {
          icon: '◆',
          title: 'Diffusion outperformed ACT',
          body:
            "ACT's CVAE latent prior collapsed to an averaged action under multimodal OCT conditioning, producing erratic rollouts. Diffusion Policy won across all three control modes.",
        },
      ],
      outro: [
        {
          title: 'Significance & contributions',
          body: [
            'This work establishes a working proof-of-concept that high-resolution volumetric OCT imaging can serve as a sufficient observation modality for diffusion-based visuomotor policy learning in constrained surgical settings.',
            'It also leaves behind reusable research infrastructure: a shared-memory OCT acquisition pathway, a two-stage RCM inverse-kinematics solver, and a comparative empirical baseline across three architectures and three Staubli control modes. Along the way I identified and resolved two practical pipeline issues — OCT point cloud acquisition latency due to ROS2 serialization and a train-versus-inference point-cloud subsampling mismatch. Bohth improvements substantially improving rollout reliability.',
            'Progress has been acheived in evaluating OCT conditioned imitation learning against subsurface imaging. These results have been successfully evaluated on a dual block grasping task with one block containing a physically anomalous subsurface feature. The policy was able to successfully grasp the block with the subsurface feature while avoiding the other block while rejecting nuisance disturbances, demonstrating that OCT can be used to condition policies for constrained and visibly indistinct grasping tasks. IEEE publication is in process.',
          ],
        },
      ],
    },
    description: [
      'Thesis research investigating optical coherence tomography (OCT) as the sole visuomotor observation modality for learned surgical manipulation policies. IEEE publication in process.',
    ],
    video: 'assets/videos/oct_view.mp4', // e.g. 'assets/videos/oct-demo.mp4'
    youtube: null,
    images: [
      'assets/projects/OCT_system.jpg'],
  },
  {
    id: 'drone-capstone',
    title: 'RoboRangers — Autonomous Drone',
    subtitle: 'ROB498 Robotics Capstone · University of Toronto · April 2026',
    period: 'Jan 2026 — Apr 2026',
    role: 'Computer Vision Lead (sole owner of full CV stack)',
    thumb: 'assets/projects/Drone.png',
    reportUrl: 'assets/RoboRangers_Capstone_Report.pdf',
    reportLabel: 'Read the capstone report (PDF)',
    tags: ['YOLOv8n', 'TensorRT FP16', 'Stereo Depth (SGBM)', 'ROS 2', 'PyCUDA', 'Jetson Nano', 'Intel RealSense T265', 'Kalibr calibration', 'IMX219', 'Python'],
    // Custom long-form layout (rendered by ProjectPage when `rich` is present).
    rich: {
      lede:
        'RoboRangers — 5-person team. I owned the full computer vision stack end-to-end, from sensor fusion architecture to onboard TensorRT deployment on a Jetson Nano.',
      pipelineLabel: 'End-to-end CV pipeline · Built',
      pipeline: [
        { k: 'Capture', t: 'IMX219 RGB + T265 Depth', s: 'Global shutter + fisheye stereo' },
        { k: 'Detection', t: 'YOLOv8n → TensorRT FP16', s: '20 Hz on Jetson' },
        { k: 'Depth', t: 'Stereo SGBM disparity', s: 'Adaptive EMA' },
        { k: 'Fusion', t: 'Cross-camera projection', s: 'Kalibr extrinsics' },
        { k: 'Output', t: '3D target pose', s: 'Camera → world frame' },
      ],
      stats: [
        { v: '±2 cm', l: '3D pose noise in static hover conditions' },
        { v: '20 Hz', l: 'Detection rate via async PyCUDA inference' },
        { v: '1,000', l: 'Labelled IMX219 frames in training dataset' },
      ],
      sections: [
        {
          title: 'What I built and why it was hard',
          body: [
            'The system needed to localize a moving ground target in 3D from a drone hovering at 0.5 m, using only edge hardware. I built the full perception pipeline: a custom-trained YOLOv8n model, exported to ONNX and compiled as a TensorRT FP16 engine on the Jetson Nano, running asynchronously via PyCUDA so MAVROS flight-control callbacks were never blocked.',
            "Depth came from the T265's stereo fisheye pair using Kannala-Brandt undistortion and CLAHE preprocessing. I implemented a dynamic adaptive EMA filter that tightens smoothing during hover and loosens it during rapid motion, which was a deliberate design choice to balance noise suppression against responsiveness. I also added per-frame depth jump rejection (>1 m threshold) to handle flight vibrations.",
            'Fusing the 2D centroid from the IMX219 with T265 depth required precise cross-camera calibration using Kalibr on an AprilGrid target, providing the rigid transformation matrix between the two sensor frames. I back-projected the detected centroid through IMX intrinsics, transformed it to the fisheye frame, then reconstructed the full 3D point. The result was sub-centimetre accuracy at 1-2m distances, and robust real-time detection through varied lighting and shadows in flight.',
          ],
        },
      ],
      cards: [
        {
          icon: '⚡',
          title: 'Edge deployment challenges',
          body:
            'PyTorch YOLOv8n was unusable on the Nano at flight latencies. I converted to ONNX, then compiled a TensorRT engine with FP16 quantization, layer fusion, and kernel tuning, bringing inference latency from intractable to 20Hz, while keeping the ROS2 executor responsive to controls.',
        },
        {
          icon: '◆',
          title: 'Dataset & training',
          body:
            'Collected and hand-labelled 1,000 IMX219 frames at varying orientations, altitudes, distances, and with distractors (chairs, people, etc.). Trained model on an RTX 2080Ti for 100 epochs. Model generalized across lighting conditions and shadow — verified with a Vicon-tagged version of the target.',
        },
        {
          icon: '⬡',
          title: 'ROS 2 architecture',
          body:
            'Decomposed perception into three independent ROS 2 nodes: YOLOv8n inference, stereo depth estimation, and 3D pose fusion. Async execution via PyCUDA prevented blocking — critical for MAVROS reliability. Detection at 20 Hz, depth at 8 Hz, fused output at detection rate.',
        },
        {
          icon: '⛓',
          title: 'Integration constraint',
          body:
            'Full CV integration was blocked by platform-level power and scheduling limits — running all subsystems simultaneously overwhelmed MAVROS comms. The CV pipeline itself was validated independently with sub-2 cm noise and flight-stable detection; the bottleneck was hardware, not perception.',
        },
      ],
    },
    description: [
      'Autonomous drone system for detecting, tracking, and capturing invasive wild pigs using a deployed net. I built the full onboard computer vision pipeline from sensor fusion architecture to real-time TensorRT deployment on a Jetson Nano, achieving ±2 cm 3D pose accuracy at 20 Hz.',
    ],
    video: null,
    youtube: null,
    images: [
      'assets/projects/Drone.png',
      'assets/projects/Proposal_States.png',
    ],
  },
  {
    id: 'igvc-rover',
    title: 'Espresso — Autonomous Ground Rover',
    subtitle: 'Differential-drive rover for the IGVC competition',
    period: 'Jul 2023 — Aug 2024',
    role: 'ROS Software + Mechanical Design',
    thumb: 'assets/projects/igvc_rover.png',
    tags: ['ROS', 'Cartographer SLAM', 'Nav Stack', 'Gazebo', 'URDF', 'LiDAR', 'ZED Stereo Camera', 'Python', 'PID', 'SolidWorks', 'ANSYS'],
    rich: {
      eyebrow:
        'UTRA Autonomous Rover Team · University of Toronto · July 2023 – August 2024',
      lede:
        '13-person team competing in the Intelligent Ground Vehicle Competition (IGVC) with a fully autonomous differential-drive rover. I worked across two areas: the ROS autonomy stack — SLAM, path planning, sensor fusion, and simulation — and the mechanical design of the motor mounts and frame structure.',
      pipelineLabel: 'Autonomy stack · ROS pipeline',
      pipeline: [
        { k: 'Sensors', t: 'Dual LiDAR + ZED + IMU/GPS', s: 'Raw signal processing' },
        { k: 'Odometry', t: 'robot_localization EKF', s: '5% drift reduction' },
        { k: 'SLAM', t: 'Cartographer mapping', s: 'CV costmap fusion' },
        { k: 'Planning', t: 'ROS Navigation Stack', s: 'navfn + local planner' },
        { k: 'Control', t: 'PID path tracking', s: '20% less veering' },
      ],
      stats: [
        { v: '5%', l: 'Odometry drift reduction from EKF multi-sensor fusion' },
        { v: '20%', l: 'Less off-course veering after PID controller tuning' },
        { v: '~85%', l: 'Ramp traversal success rate with dedicated navigation mode' },
      ],
      sections: [
        {
          title: 'ROS autonomy stack',
          body: [
            "The rover's software followed a modular microservices architecture — odometry, SLAM mapping, path planning, and CV perception built as independent ROS nodes that could be tested and integrated separately.",
            '## SLAM & mapping',
            '- Integrated Google Cartographer SLAM, fusing dual LiDAR scan data and odometry to generate real-time environmental maps for autonomous traversal',
            '- Used a dual 2D LiDAR configuration (one at each height) to detect ramps through distance differencing — avoiding the cost of a 3D LiDAR unit while achieving the same classification result',
            '- Projected CV lane and pothole detections (segmentation masks) into 3D using ZED depth data and merged them into the SLAM costmap via bitwise OR of detection masks',
            '## Sensor calibration & odometry',
            '- Calibrated and filtered the LiDAR and ZED stereo camera, processing raw hardware signals into clean ROS messages',
            '- Fused Hall-effect encoder data, IMU, GPS, and ZED visual odometry with the robot_localization EKF package — reducing odometry drift by 5%',
            '- Validated odometry accuracy in Gazebo using the p3d_base_controller ground-truth plugin, comparing fused estimates against ground truth to isolate drift by sensor and fine-tune filter parameters',
            '## Path planning & control',
            '- Configured the ROS Navigation Stack: costmap_2d reading from the Cartographer map, navfn for global planning, and base_local_planner for local trajectory generation',
            '- Wrote rospy control scripts and tuned a PID path-tracking controller, reducing off-course veering by 20%',
            '- Built a GPS waypoint goal-setting pipeline: coordinates loaded from ordered JSON, transformed from UTM to cartesian via navsat_transform_node, then dispatched to move_base',
            '- Developed a ramp-navigation mode that interrupts regular planning, places 0.5 m waypoint increments along the ramp, and constrains the trajectory to a straight line — reaching ~85% ramp traversal success',
            '## Simulation',
            '- Built a full Gazebo environment: a URDF kinematic model of Espresso from the mechanical CAD, with Gazebo sensor plugins adding Gaussian noise to LiDAR, IMU, and camera',
            '- Modelled the IGVC competition field in Gazebo, enabling navigation testing independent of CV readiness (physical walls substituted for lane markings during early integration)',
            '- Used RViz to visualize sensor data, lane detections, the SLAM map, costmap, and planned paths throughout development',
          ],
        },
        {
          title: 'Mechanical design',
          body: [
            '## Motor mount',
            '- Designed motor mounts in SolidWorks for the ATO 300 W brushless DC motors (16:1 planetary gearbox, 188 rpm max, 14.4 Nm max torque)',
            '- Machined mounts from ⅜" 6061 aluminum plate with high-infill 3D-printed PETG inserts; brass heat-set inserts enabled reliable repeated assembly and disassembly',
            '- Mounted the aluminum plates to the lower frame box with spacers to keep the rover level, compensating for the size difference between the motorized front wheels and rear caster',
            '## Frame structure',
            '- Contributed to the 6061 T-slot aluminum-extrusion chassis in a "diagonal figure-8" configuration, balancing wheel geometry to keep the rover level across all terrain',
            '- Added diagonal cross-bracing on each side to prevent buckling under the battery and electronics load',
            '- Validated structural integrity with ANSYS static-structural simulation — confirming no buckling or bending at loads exceeding competition requirements',
          ],
        },
      ],
    },
    description: [
      'Autonomy stack and mechanical design for Espresso, a fully autonomous differential-drive rover competing in the Intelligent Ground Vehicle Competition (IGVC).',
    ],
    video: null,
    youtube: null,
    images: [
      'assets/projects/igvc_rover.png',
      'assets/projects/team_igvc.jpg',
      'assets/projects/ROS_pipeline_IGVC.png',
    ],
  },
  {
    id: 'flamebot',
    title: 'FlameBot — Fire Detection & Mitigation UGV',
    subtitle: 'Autonomous fire-surveying ground robot · MIE438',
    period: 'Feb 2024 — Apr 2024',
    role: 'Embedded Systems & Controls',
    thumb: 'assets/projects/flamebot.png',
    tags: ['ESP32', 'STM32', 'Embedded C', 'Arduino', 'State Machines', 'Bang-Bang Control', 'ADC', 'PWM', 'L298N', 'Real-Time Firmware', 'Sensor Integration'],
    rich: {
      eyebrow:
        'MIE438 Microprocessors & Embedded Systems · University of Toronto, Dept. of Mechanical & Industrial Engineering · 4-person team · Apr 2024',
      lede:
        'FlameBot is an unmanned ground vehicle that autonomously surveys an area, identifies small fires, and extinguishes them before they spread. On a 4-person team I owned the embedded and controls side: the microcontroller firmware, the parallel state machines driving navigation and mitigation, the closed-loop control design, and the electrical power and sensor architecture that tied it all together.',
      pipelineLabel: 'Embedded control loop · Designed & implemented',
      pipeline: [
        { k: 'Sense', t: '3× flame + 2× IR line + ultrasonic', s: '12-bit ADC acquisition' },
        { k: 'Decide', t: 'Parallel state machines', s: 'Navigation + mitigation' },
        { k: 'Navigate', t: 'Bang-Bang line following', s: 'PWM differential drive' },
        { k: 'Mitigate', t: 'Servo-aimed water turret', s: '0–180° sweep + pump' },
        { k: 'Actuate', t: 'L298N drivers · 12 V rail', s: 'Real-time on ESP32' },
      ],
      stats: [
        { v: '180°', l: 'Frontal fire-detection arc split into three flame-sensor regions for turret aiming' },
        { v: '12 V', l: 'Motor rail re-architected from 6 V (4×AA) to 8×AA to drive the fully loaded chassis' },
        { v: '<20%', l: 'Of the ESP32 DRAM used by the final real-time firmware — comfortable headroom' },
      ],
      sections: [
        {
          title: 'What I owned',
          body: [
            'FlameBot splits wildfire prevention into three jobs — detect a fire, navigate to it, and extinguish it. My responsibility was making the robot actually decide and act in real time: the microcontroller program, the control logic, and the electrical backbone that powered and connected every sensor and actuator.',
            '## Microcontroller & firmware',
            '- Brought up the embedded platform in Embedded C / Arduino, reading the flame, IR line-tracking, and ultrasonic sensors and driving the motors, servo, and pump from a single real-time control loop',
            '- Led the migration from the STM32WBA5CGU Nucleo-64 to the ESP32 WROOM DA after the STM32 toolchain made ADC sensor reads impractical to debug — UART-over-virtual-COM required physically soldering a bridge to the ST-LINK to recover the port',
            '- Chose the ESP32 deliberately: Arduino-IDE compatibility, a rich peripheral set (UART, SPI, I²C, BLE, Wi-Fi), and ample memory — the final firmware used under 20% of available DRAM',
            '- Used `const int` for every pin assignment to prevent accidental runtime reassignment, and structured function calls to keep stack growth from encroaching on program/data memory',
            '## Sensing & ADC',
            '- Acquired analog flame-sensor data through the 12-bit ADC (0–4095) and experimentally characterized the response, tuning each onboard potentiometer to set detection distance',
            '- Determined the signal was effectively binary — clustering near ~200 (no fire) and ~4000 (fire) — and made the engineering call to skip filtering, trading a small amount of noise for minimal control-loop lag',
          ],
        },
        {
          title: 'Control systems & state machines',
          body: [
            'I modeled the robot as two negative-feedback control loops running in parallel — one for navigation, one for fire mitigation — and formalized each as a state machine so the behavior was explicit, debuggable, and reconfigurable.',
            '## Control design — PID vs. Bang-Bang',
            '- The original proposal called for a PID line-following controller; in practice the IR line sensors output a hard binary (line / no line), so a continuous error signal was not available',
            '- Evaluated the trade-off and selected a Bang-Bang controller: for a slow-moving surveyor bot it gave reliable tracking without the tuning overhead of PID, at the cost of needing per-run sensor calibration',
            '- Tuned the turning response by driving a PWM of 175 to a single side motor to re-center on the line, and a forward PWM of 150 when the center sensor held the line',
            '## Parallel state machines',
            '- Navigation state machine: Forward / Turn-Left / Turn-Right states, transitioning on the left/right IR line-detection booleans to keep the robot centered on the path',
            '- Mitigation state machine: an idle Flame-Sensing state that branches into Aim-Left (0–60°), Aim-Center (60–120°), or Aim-Right (120–180°) based on which of the three flame sensors crosses the >4000 ADC threshold, then oscillates the servo and fires the pump until the fire clears',
            '- Ran both machines concurrently with the mitigation loop overriding drive — when a flame is detected the robot halts, extinguishes, then resumes line following, with a manual shut-off switch as a hard backstop so neither loop can dead-end',
          ],
        },
        {
          title: 'Electrical & power architecture',
          body: [
            'Designed the system architecture mapping every component to the MCU and its power domain, then debugged the integration problems that only appear once the whole robot is wired together.',
            '## Power system',
            '- Re-architected the motor supply from 4×AA (6 V) to 8×AA in series (12 V) after the fully loaded chassis stalled the L298N drivers — restoring full maneuverability under load',
            '- Chose 8×AA (~2500 mAh) over a 9 V battery (~500 mAh) on an energy-capacity basis for longer mission runtime, and accounted for the L298N’s ~2 V drop (12 V in → ~10 V at the motors) in the drive budget',
            '## Integration debugging',
            '- Diagnosed an intermittent system-wide halt down to a failed breadboard — established that components passed individually, then isolated the fault by substitution rather than guesswork',
            '- Traced repeated ESP32 brown-out resets during programming to insufficient USB current when the IR line sensors were attached; resolved it with a 5 V / 2.5 A power bank that stabilized the rail and restored code uploads',
            '- Implemented ultrasonic ranging with timer-triggered pulses and `pulseIn()` echo timing for low-lag obstacle distance measurement',
          ],
        },
      ],
      cardsTitle: 'Engineering decisions that mattered',
      cards: [
        {
          icon: '◆',
          title: 'Knew when not to filter',
          body:
            'After characterizing the flame sensor as near-binary through the 12-bit ADC, I deliberately omitted signal filtering — the lag and lost sharp transitions would have hurt a fast mitigation response more than the minor noise ever did.',
        },
        {
          icon: '⚙',
          title: 'PID on paper, Bang-Bang in reality',
          body:
            'The binary IR line sensors gave no continuous error to feed a PID loop. Rather than force the architecture, I switched to Bang-Bang control — simpler, robust for a slow surveyor, and the right tool for the actual sensor data.',
        },
        {
          icon: '⤳',
          title: 'Migrated the whole platform',
          body:
            'When the STM32’s ADC/UART debug path required soldering a hardware bridge to even read sensors, I moved the project to the ESP32 WROOM DA — preserving BLE/Wi-Fi capability while unblocking the team’s iteration speed.',
        },
        {
          icon: '⏛',
          title: 'Debugged at the system level',
          body:
            'The hardest bugs only appeared on the assembled robot: a dead breadboard masquerading as a logic fault, and USB-current brown-outs killing uploads. I isolated both by methodical substitution and fixed the power architecture.',
        },
      ],
      outro: [
        {
          title: 'Outcome & next steps',
          body: [
            'The integrated FlameBot reliably surveyed a line-marked course, detected a controlled flame across its 180° frontal arc, aimed the servo turret to the correct region, and extinguished the fire before resuming patrol — all on real-time firmware using under 20% of the MCU’s memory.',
            'The natural extensions I scoped were a fire-mapping protocol that sweeps a flame’s perimeter to estimate its radius, and a Wi-Fi/BLE web-app alert that takes advantage of the ESP32’s radios to call for help on larger fires — plus explicit state encoding to make the controllers easier to reconfigure as the sensor suite improves.',
          ],
        },
      ],
    },
    description: [
      'Fire-detection and mitigation UGV that autonomously surveys an area, locates small fires across a 180° arc, and extinguishes them. On a 4-person MIE438 team I owned the embedded firmware, the parallel navigation/mitigation state machines, the Bang-Bang control design, and the electrical power and sensor architecture — including migrating the platform from STM32 to ESP32.',
    ],
    video: null,
    youtube: null,
    images: [
      'assets/projects/flamebot.png',
      'assets/projects/FlamebotSA.png',
      'assets/projects/FlamebotSM.png'
    ],
  },
];
