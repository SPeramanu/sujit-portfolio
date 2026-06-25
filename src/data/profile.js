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
  email: 'sujitp2003@gmail.com',
  phone: '403-969-6430',
  linkedin: 'https://ca.linkedin.com/in/sujit-peramanu',
  github: 'https://github.com/SPeramanu',
  resumeUrl: 'assets/Sujit_Peramanu_Resume.pdf', // drop your PDF in /public/assets

  // ---- ABOUT section ----
  // Each string renders as a paragraph. Write whatever you want here.
  about: [
    `I recently graduated from Engineering Science at the University of Toronto, majoring in
     Robotics with a minor in Artificial Intelligence. I believe we are at a precipice where
     robotics and physical AI have the capacity to fundamentally improve our lives through two
     primary entry points: medicine and space. I have dedicated my time to both of these areas,
     in industry and in research. 
     
     My goal is to to build machines that see,
     decide, and act on both a micro and macro scale. These pursuits have led me to work on 
     imitation-learning policies that perform surgical
     grasping under OCT guidance and robotics mission software that drives rovers on the Moon.`,

    `I love the full stack of robotics which includes perception, control,
     embedded firmware, software infrastructure, and data driven robot learning.`,

    `In my spare time you may find me planning the next trip or hanging out with my dog.
     Check out some of the places I've been to by spinning the globe.`,
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
