'use strict';

const User = require('../models/User');
const Club = require('../models/Club');
const ChatRoom = require('../models/ChatRoom');
const logger = require('../utils/logger');

const seedClubs = [
  {
    name: 'Artificial Intelligence & Machine Learning',
    banner: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=150&q=80',
    description: 'Share typed architectures, review AI agent pipelines, explore LLM configurations, and coordinate machine learning bootcamps.',
    category: 'Tech',
    rules: ['Be respectful', 'Share knowledge', 'No spam'],
  },
  {
    name: 'Web Development',
    banner: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=150&q=80',
    description: 'Focused on modern web technologies, React/Vite ecosystems, Node.js microservices, design patterns, and performance.',
    category: 'Development',
    rules: ['Be respectful', 'Code-only discussions', 'Help others learn'],
  },
  {
    name: 'Android Development',
    banner: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80',
    description: 'Android App engineering using Kotlin, Jetpack Compose, state management, and architecture patterns.',
    category: 'Development',
    rules: ['No self-promotion', 'Ask code questions in thread', 'Respect guidelines'],
  },
  {
    name: 'Competitive Programming',
    banner: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=150&q=80',
    description: 'Weekly contests, logic challenges, algorithms, optimization, and preparation for ACM-ICPC, Codeforces, and LeetCode.',
    category: 'Coding',
    rules: ['Do not share active contest answers', 'Discuss optimizations in threads', 'No code-dumping without context'],
  },
  {
    name: 'Cyber Security',
    banner: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=150&q=80',
    description: 'Discussions on network security, pentesting, ethical hacking, malware analysis, and CTF challenges.',
    category: 'Security',
    rules: ['No malicious activities', 'Ethics first', 'Help each other'],
  },
  {
    name: 'Cloud & DevOps',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=150&q=80',
    description: 'CI/CD pipelines, Docker, Kubernetes, AWS/GCP, infrastructure as code (IaC), monitoring, and operations.',
    category: 'Infrastructure',
    rules: ['No leaking private credentials', 'Share solutions and architecture', 'Respect opinions'],
  },
  {
    name: 'Blockchain & Web3',
    banner: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=150&q=80',
    description: 'Smart contract development, Solidity, Ethereum, decentralized applications (dApps), cryptography, and Web3 frameworks.',
    category: 'Tech',
    rules: ['No financial advice', 'Tech discussions only', 'Be respectful'],
  },
  {
    name: 'Data Science',
    banner: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=150&q=80',
    description: 'Data analysis, visualization, Pandas, R, Tableau, statistics, and extracting meaningful insights from complex datasets.',
    category: 'Coding',
    rules: ['Always reference data sources', 'Explain code logic', 'No spam'],
  },
  {
    name: 'UI/UX Design',
    banner: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=150&q=80',
    description: 'Aesthetics, wireframing, user journeys, Figma resources, interactive prototypes, and design feedback.',
    category: 'Design',
    rules: ['Constructive feedback only', 'No plagiarized designs', 'Share design tokens'],
  },
  {
    name: 'Startup & Entrepreneurship',
    banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    description: 'Ideas validation, pitching decks, raising funds, scaling, marketing strategies, and networking with co-founders.',
    category: 'Business',
    rules: ['No pyramid schemes', 'Be supportive of new ideas', 'Respect non-disclosure requests'],
  },
  {
    name: 'Open Source',
    banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=150&q=80',
    description: 'Contributing to repositories, licensing, Git workflows, Hacktoberfest, GSoC preparation, and repository maintenance.',
    category: 'Tech',
    rules: ['Help beginners contribute', 'Follow code of conduct', 'Be friendly'],
  },
  {
    name: 'Placements & Internships',
    banner: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=150&q=80',
    description: 'Resume reviews, interview tips, referral opportunities, HR questions, salary insights, and mock interviews.',
    category: 'Career',
    rules: ['Keep details confidential if requested', 'Helpful feedback only', 'No fake job offers'],
  },
  {
    name: 'Photography',
    banner: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?auto=format&fit=crop&w=150&q=80',
    description: 'Sharing photography portfolios, camera gear, lighting setups, Lightroom presets, and editing tips.',
    category: 'Creative',
    rules: ['Share your own work', 'No offensive content', 'Constructive critique'],
  },
  {
    name: 'Gaming',
    banner: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&w=150&q=80',
    description: 'Discuss games, organize tournaments, coordinate live streams, share setup configurations, and play together.',
    category: 'Creative',
    rules: ['No toxic behavior', 'Respect other gamers', 'Keep it fun'],
  },
  {
    name: 'General Discussion',
    banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=150&q=80',
    description: 'Casual conversations, memes, updates, networking, and off-topic developer chatter.',
    category: 'General',
    rules: ['Be respectful', 'Keep it civil', 'No spam'],
  },
];

const seedDatabase = async () => {
  try {
    // 1. Seed Admin Account
    const adminEmail = 'admin@admin.com';
    let admin = await User.findOne({ email: adminEmail }).select('+password');
    if (!admin) {
      admin = new User({
        name: 'Platform Admin',
        email: adminEmail,
        password: 'admin',
        role: 'admin',
        status: 'active',
        isActive: true,
        authProvider: 'local',
      });
      await admin.save({ validateBeforeSave: false });
      logger.info('Database Seed: Admin account seeded successfully.');
    } else {
      admin.password = 'admin';
      admin.role = 'admin';
      admin.status = 'active';
      admin.isActive = true;
      await admin.save({ validateBeforeSave: false });
      logger.info('Database Seed: Admin account reset/updated successfully.');
    }

    // 2. Seed Clubs and ChatRooms
    for (const clubInfo of seedClubs) {
      let club = await Club.findOne({ name: clubInfo.name });
      if (!club) {
        club = await Club.create(clubInfo);
        logger.info(`Database Seed: Club "${clubInfo.name}" created.`);
      }

      // Check if ChatRoom exists for this club
      const roomExists = await ChatRoom.findOne({ clubId: club._id });
      if (!roomExists) {
        await ChatRoom.create({
          clubId: club._id,
          name: `${club.name} Lounge`,
        });
        logger.info(`Database Seed: ChatRoom created for "${club.name}".`);
      }
    }
    logger.info('Database Seed: Complete.');
  } catch (err) {
    logger.error(`Database Seed Failed: ${err.message}`);
  }
};

module.exports = seedDatabase;
