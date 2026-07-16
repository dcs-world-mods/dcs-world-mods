/**
 * Seeds the database with forum categories, an admin account,
 * demo users, sample mods, news and developer guides.
 *
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const FORUM_CATEGORIES = [
  ["General Discussion", "general-discussion", "Talk about anything DCS World related."],
  ["Mod Development", "mod-development", "Discuss mod creation, 3D modeling, systems and SDK topics."],
  ["Bug Reports", "bug-reports", "Report issues with community mods."],
  ["Mission Editor", "mission-editor", "Mission building, triggers, scripting and campaign design."],
  ["DCS News", "dcs-news", "News and updates from the DCS World ecosystem."],
  ["Screenshots & Videos", "screenshots-videos", "Show off your best shots and clips."],
  ["Help & Support", "help-support", "Installation help and technical support."],
] as const;

async function main() {
  // --- Forum categories (idempotent) ---
  for (let i = 0; i < FORUM_CATEGORIES.length; i++) {
    const [name, slug, description] = FORUM_CATEGORIES[i];
    await db.forumCategory.upsert({
      where: { slug },
      update: { name, description, sortOrder: i },
      create: { name, slug, description, sortOrder: i },
    });
  }

  // --- Users ---
  // Only bootstrap an admin on a fresh database. If an Owner already exists
  // (assigned via `npm run set-owner`), never create another admin account.
  const adminPassword = "admin1234";
  let admin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    admin = await db.user.create({
      data: {
        username: "admin",
        email: "admin@dcsworldmods.local",
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "ADMIN",
        bio: "Site administrator. Fly safe, check six.",
      },
    });
    console.log("Bootstrap admin created -> username: admin  password: " + adminPassword);
    console.log("(Change this password, or replace it with your own account via `npm run set-owner`.)");
  }

  const demoDev = await db.user.upsert({
    where: { username: "ViperDev" },
    update: {},
    create: {
      username: "ViperDev",
      email: "viperdev@dcsworldmods.local",
      passwordHash: await bcrypt.hash("demo12345", 12),
      role: "DEVELOPER",
      bio: "Building aircraft mods since 2019. Lua enjoyer.",
    },
  });

  const demoUser = await db.user.upsert({
    where: { username: "Maverick" },
    update: {},
    create: {
      username: "Maverick",
      email: "maverick@dcsworldmods.local",
      passwordHash: await bcrypt.hash("demo12345", 12),
      role: "USER",
      bio: "I feel the need... the need for speed.",
    },
  });

  // --- Official mods (always ensured, even on re-seed) ---
  // File URLs point at cloud storage when configured, local storage otherwise.
  const fileBase = process.env.S3_PUBLIC_URL
    ? `${process.env.S3_PUBLIC_URL.replace(/\/$/, "")}/files`
    : "/api/files/files";

  if (!(await db.mod.findUnique({ where: { slug: "jericho-4-missile-mod" } }))) {
    await db.mod.create({
      data: {
        title: "Jericho 4 Missile Mod",
        slug: "jericho-4-missile-mod",
        summary:
          "Jericho IV ballistic missile and TEL launcher — includes the Jericho III as a bonus unit.",
        description:
          "Adds the Jericho IV ballistic missile with its Transporter-Erector-Launcher (TEL) " +
          "to DCS World as a mission-editor ground unit, plus the Jericho III missile and TEL as bonus units.\n\n" +
          "FEATURES\n" +
          "- Jericho IV missile with custom 3D model, multi-stage flight profile and separation effects\n" +
          "- Placeable TEL launcher unit under Missiles category (Israel)\n" +
          "- 'Fire at Point' mission editor tasking support\n" +
          "- Jericho III missile + TEL included\n" +
          "- Custom textures and thumbnails\n\n" +
          "INSTALLATION\n" +
          "1. Download and extract the archive\n" +
          "2. Copy the 'Jericho IV' folder into: Saved Games/DCS/Mods/tech/\n" +
          "3. Launch DCS World — the units appear under Israel > Missiles in the Mission Editor\n" +
          "4. Add a Jericho IV TEL to your mission and assign a 'Fire at Point' task\n\n" +
          "COMPATIBILITY\n" +
          "Works in single player and multiplayer (all clients need the mod installed).",
        version: "1.0.0",
        category: "WEAPONS",
        imageUrl: "/images/jericho4-flight.jpg",
        fileUrl: `${fileBase}/Jericho4_Missile_Mod_v1.0.0.zip`,
        status: "APPROVED",
        authorId: admin.id,
        screenshots: {
          create: [
            { url: "/images/jericho4-flight.jpg", sortOrder: 0 },
            { url: "/images/jericho4-mission-editor.jpg", sortOrder: 1 },
            { url: "/images/hero-launch.jpg", sortOrder: 2 },
          ],
        },
      },
    });
    console.log("Jericho 4 Missile Mod seeded");
  }

  if (!(await db.mod.findUnique({ where: { slug: "bigexplosionsound-mod" } }))) {
    await db.mod.create({
      data: {
        title: "BigExplosionSound Mod",
        slug: "bigexplosionsound-mod",
        summary:
          "Realistic distant boom — heavy explosions audible from up to ~15 km away.",
        description:
          "Makes heavy explosions audible from up to ~15 km away, like a real large blast " +
          "heard across a city. Also improves missile launch, flyby and engine sounds.\n\n" +
          "FEATURES\n" +
          "- Deep long-range 'BigBoom' explosion sound with realistic distance falloff\n" +
          "- New heavy/distant explosion sound definitions (sdef)\n" +
          "- Improved missile launch, engine and flyby audio\n" +
          "- Pure sound mod — no impact on integrity check or performance\n\n" +
          "INSTALLATION\n" +
          "1. Download and extract the archive\n" +
          "2. Copy the 'BigExplosionSound' folder into: Saved Games/DCS/Mods/resource/\n" +
          "3. Launch DCS World — heavy explosions will now be audible from far away\n\n" +
          "TIP\n" +
          "Best experienced with the Jericho 4 Missile Mod — fire one at a city block " +
          "and listen from 10+ km out.",
        version: "1.0",
        category: "OTHER",
        imageUrl: "/images/pcl181-artillery.jpg",
        fileUrl: `${fileBase}/BigExplosionSound_Mod_v1.0.zip`,
        status: "APPROVED",
        authorId: admin.id,
        screenshots: {
          create: [
            { url: "/images/pcl181-artillery.jpg", sortOrder: 0 },
            { url: "/images/matv-coastal.jpg", sortOrder: 1 },
          ],
        },
      },
    });
    console.log("BigExplosionSound Mod seeded");
  }

  // Skip demo content seeding if it already exists.
  if ((await db.mod.count()) > 2) {
    console.log("Content already seeded — skipping demo content.");
    return;
  }

  // --- Sample mods ---
  const sampleMods = [
    {
      title: "F-16I Sufa Enhancement Pack",
      slug: "f-16i-sufa-enhancement-pack",
      summary: "High-fidelity F-16I cockpit textures, liveries and loadout tweaks.",
      description:
        "A community enhancement pack for the F-16 featuring:\n\n" +
        "- 4K cockpit texture overhaul\n- 12 squadron liveries\n- Adjusted loadout presets\n- Custom kneeboard pages\n\n" +
        "Installation: extract the archive into your Saved Games/DCS/Mods folder and enable it in the module manager.",
      version: "2.1.0",
      category: "AIRCRAFT",
      imageUrl: "/images/placeholder-aircraft.svg",
      downloads: 1834,
      authorId: demoDev.id,
    },
    {
      title: "Extended SAM Threat Pack",
      slug: "extended-sam-threat-pack",
      summary: "Adds modern long-range SAM systems with realistic radar behavior.",
      description:
        "Expands the ground threat environment with additional SAM systems, " +
        "custom radar emitters and realistic engagement logic for mission builders.\n\n" +
        "Includes documentation for integrating the systems into your own missions.",
      version: "1.4.2",
      category: "WEAPONS",
      imageUrl: "/images/matv-coastal.jpg",
      downloads: 972,
      authorId: demoDev.id,
    },
    {
      title: "Marianas Night Ops Campaign",
      slug: "marianas-night-ops-campaign",
      summary: "An 8-mission dynamic night operations campaign for the Marianas map.",
      description:
        "Fly precision strike and SEAD missions across an 8-mission campaign set in the Marianas. " +
        "Features voiced ATC, dynamic weather and a branching mission structure.\n\n" +
        "Requires: Marianas map (free).",
      version: "1.0.1",
      category: "MISSIONS",
      imageUrl: "/images/mission-editor-marianas.jpg",
      downloads: 655,
      authorId: admin.id,
    },
  ];

  for (const mod of sampleMods) {
    await db.mod.create({
      data: { ...mod, status: "APPROVED", externalUrl: "https://example.com/download" },
    });
  }

  // --- News ---
  await db.newsItem.createMany({
    data: [
      {
        title: "Welcome to the new DCS World Mods community hub!",
        content:
          "Our new site is live — browse the mods library, join the forum and say hi on Discord. " +
          "Mod developers: upload your work and reach thousands of virtual pilots.",
        authorId: admin.id,
      },
      {
        title: "Mod submission guidelines published",
        content:
          "Before uploading, please read the submission guidelines in the Developer Hub. " +
          "All mods are reviewed by the admin team before going live.",
        authorId: admin.id,
      },
    ],
  });

  // --- Developer guides ---
  await db.guide.createMany({
    data: [
      {
        title: "Getting Started with DCS Modding",
        slug: "getting-started-with-dcs-modding",
        summary: "The complete beginner's roadmap: tools, folder structure and your first mod.",
        tag: "GETTING_STARTED",
        authorId: admin.id,
        content:
          "Welcome to DCS modding! This guide covers the essentials.\n\n" +
          "1. The Saved Games/DCS/Mods folder structure\n" +
          "2. tech vs aircraft mods\n" +
          "3. Required tools: a text editor, ModelViewer, and patience\n" +
          "4. Anatomy of an entry.lua file\n\n" +
          "Start small: clone an existing asset pack structure, change the name and description, " +
          "and confirm DCS loads it before customizing further.",
      },
      {
        title: "Lua Scripting Fundamentals for DCS",
        slug: "lua-scripting-fundamentals",
        summary: "Learn the Lua patterns used across entry files, missions and systems.",
        tag: "LUA",
        authorId: demoDev.id,
        content:
          "DCS uses Lua everywhere — entry files, weapon definitions, mission triggers.\n\n" +
          "Key concepts:\n" +
          "- Tables are everything: declare_plugin(), add_aircraft() and friends all take tables\n" +
          "- The mission scripting environment vs the mod environment are separate sandboxes\n" +
          "- Use dofile() and loadfile() carefully; paths are relative to the DCS root\n\n" +
          "Debugging tip: check Saved Games/DCS/Logs/dcs.log after every load. " +
          "Most mod failures show up there with a precise line number.",
      },
      {
        title: "Publishing Your Project on DCS World Mods",
        slug: "publishing-your-project",
        summary: "How to package, document and submit your mod to the library.",
        tag: "PROJECTS",
        authorId: admin.id,
        content:
          "Ready to share your work?\n\n" +
          "1. Package your mod as a .zip with a clear folder structure\n" +
          "2. Write an installation section in your description — assume nothing\n" +
          "3. Include a version number and keep a changelog\n" +
          "4. Add a good preview image (16:9 works best)\n" +
          "5. Submit via the Upload page — an admin will review it within a few days\n\n" +
          "Well-documented mods get more downloads. It's that simple.",
      },
    ],
  });

  // --- A welcome forum thread ---
  const general = await db.forumCategory.findUnique({
    where: { slug: "general-discussion" },
  });
  if (general) {
    await db.thread.create({
      data: {
        title: "Welcome aboard — introduce yourself!",
        categoryId: general.id,
        authorId: admin.id,
        pinned: true,
        posts: {
          create: [
            {
              authorId: admin.id,
              content:
                "Welcome to the DCS World Mods community! Tell us who you are, " +
                "what you fly, and what you're working on. Check the Developer Hub " +
                "if you're getting into modding, and join our Discord for real-time chat.",
            },
            {
              authorId: demoUser.id,
              content:
                "Hey everyone! Mostly flying the F/A-18C and dabbling in mission building. " +
                "Excited to see this community grow.",
            },
          ],
        },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
