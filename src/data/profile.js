// ============================================================
//  PROFILE — edit this file to change your name, tagline,
//  about text, skills, and contact links.
// ============================================================

export const profile = {
  name: 'Sujit Peramanu',
  // Taglines cycle in the hero with a typewriter effect — add/remove freely.
  taglines: [
    'ROBOTICS ENGINEER',
    'SURGICAL ROBOTICS RESEARCHER',
    'SPACE SYSTEMS DEVELOPER',
    'AUTONOMY & PERCEPTION',
  ],
  location: 'Toronto, Canada',
  email: 'sujit.peramanu@mail.utoronto.ca',
  phone: '403-969-6430',
  linkedin: 'https://ca.linkedin.com/in/sujit-peramanu',
  github: 'https://github.com/', // <-- add your GitHub username
  resumeUrl: 'assets/Sujit_Peramanu_Resume.pdf', // drop your PDF in /public/assets

  // ---- ABOUT section ----
  // Each string renders as a paragraph. Write whatever you want here.
  about: [
    `I recently graduated from Engineering Science at the University of Toronto, majoring in
     Robotics with a minor in Artificial Intelligence. I believe we are at a precipice where
     robotics and physical AI have the capacity to fundamentally improve our lives through two
     primary entry points: medicine and space. I have dedicated my time to both of these areas,
     in industry and in research. Ultimately, I have sought to build machines that see,
     decide, and act — from imitation-learning policies that perform surgical
     grasping under OCT guidance, to mission software that drives rovers on the Moon.`,

    `My road has taken me through lunar mission control rooms in Ottawa, satellite
     test facilities in Munich, and surgical robotics labs in Toronto.
     I love the full stack of robotics — perception, control,
     embedded firmware, and the software infrastructure that ties it all together.`,

    `Off the clock you'll find me behind a camera lens or planning the next trip.
     Check out the photography section below, or spin the globe to see where I've
     been.`,
  ],

  // Quick-read stats shown in the about HUD panel.
  stats: [
    { label: 'DEGREE', value: 'BASc EngSci Robotics, UofT ’26' },
    { label: 'MINOR', value: 'Artificial Intelligence Engineering' },
    { label: 'FOCUS', value: 'Surgical Robotics / Space Systems' },
    { label: 'LOCATION', value: 'Toronto, ON' },
  ],

  // Skill groups render as tag chips.
  skills: [
    {
      group: 'LANGUAGES',
      items: ['Python', 'C++', 'C', 'TypeScript', 'JavaScript', 'MATLAB'],
    },
    {
      group: 'ROBOTICS',
      items: ['ROS 2', 'SLAM', 'Diffusion Policy', 'Computer Vision', 'Control Theory', 'Inverse Kinematics'],
    },
    {
      group: 'PLATFORMS & TOOLS',
      items: ['Linux', 'Vue', 'React', 'Django', 'TensorRT', 'Gazebo', 'STM32', 'KUKA KRL'],
    },
  ],
};
