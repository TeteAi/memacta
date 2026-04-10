import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@memacta.app" },
    update: { name: "Demo User", credits: 1000 },
    create: {
      email: "demo@memacta.app",
      name: "Demo User",
      credits: 1000,
    },
  });

  // Seed credit packages
  const creditPackages = [
    { id: "pkg-starter", name: "Starter", credits: 100, priceUsd: 999, popular: false },
    { id: "pkg-pro", name: "Pro", credits: 500, priceUsd: 3999, popular: true },
    { id: "pkg-team", name: "Team", credits: 2000, priceUsd: 9999, popular: false },
    { id: "pkg-enterprise", name: "Enterprise", credits: 10000, priceUsd: 39999, popular: false },
  ];

  for (const pkg of creditPackages) {
    await prisma.creditPackage.upsert({
      where: { id: pkg.id },
      update: { name: pkg.name, credits: pkg.credits, priceUsd: pkg.priceUsd, popular: pkg.popular },
      create: pkg,
    });
  }

  const mockPosts = [
    {
      title: "Cyberpunk City at Night",
      description: "A sprawling neon-lit cityscape generated with Kling 3.0",
      mediaUrl: "https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=640&q=80",
      mediaType: "image",
      toolUsed: "Kling 3.0",
      likes: 142,
    },
    {
      title: "Ocean Waves Timelapse",
      description: "AI-generated ocean waves at sunset",
      mediaUrl: "https://videos.pexels.com/video-files/2795173/2795173-sd_640_360_25fps.mp4",
      mediaType: "video",
      toolUsed: "Sora 2",
      likes: 98,
    },
    {
      title: "Neon Pulse",
      description: "Abstract neon light trails flowing through darkness",
      mediaUrl: "https://videos.pexels.com/video-files/3571264/3571264-sd_640_360_30fps.mp4",
      mediaType: "video",
      toolUsed: "Kling 3.0",
      likes: 176,
    },
    {
      title: "Feline Majesty",
      description: "Regal cat portrait with dramatic studio lighting",
      mediaUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=640&q=80",
      mediaType: "image",
      toolUsed: "Character Swap 2.0",
      likes: 63,
    },
    {
      title: "Chromatic Waves",
      description: "Abstract color field with flowing organic shapes",
      mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640&q=80",
      mediaType: "image",
      toolUsed: "Soul 2.0",
      likes: 112,
    },
    {
      title: "Ink Bloom",
      description: "Mesmerizing ink tendrils expanding through water",
      mediaUrl: "https://videos.pexels.com/video-files/4763824/4763824-sd_640_360_25fps.mp4",
      mediaType: "video",
      toolUsed: "Soul 2.0",
      likes: 85,
    },
    {
      title: "Golden Hour Portrait",
      description: "Warm portrait bathed in golden hour sunlight",
      mediaUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&q=80",
      mediaType: "image",
      toolUsed: "Face Swap",
      likes: 194,
    },
    {
      title: "Aurora Borealis",
      description: "Dancing northern lights over a frozen landscape",
      mediaUrl: "https://videos.pexels.com/video-files/3129671/3129671-sd_640_360_30fps.mp4",
      mediaType: "video",
      toolUsed: "Veo 3.1",
      likes: 157,
    },
    {
      title: "Ember Core",
      description: "Close-up flames dancing in ultra slow motion",
      mediaUrl: "https://videos.pexels.com/video-files/2491284/2491284-sd_640_360_24fps.mp4",
      mediaType: "video",
      toolUsed: "Sora 2",
      likes: 73,
    },
    {
      title: "Urban Character",
      description: "Stylized male portrait with cinematic color grade",
      mediaUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&q=80",
      mediaType: "image",
      toolUsed: "Flux Kontext",
      likes: 45,
    },
    {
      title: "Pale Blue Dot",
      description: "Earth seen from orbit with city lights glowing",
      mediaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&q=80",
      mediaType: "image",
      toolUsed: "Veo 3.1",
      likes: 189,
    },
    {
      title: "Smoke Reverie",
      description: "Ethereal smoke patterns drifting in slow motion",
      mediaUrl: "https://videos.pexels.com/video-files/1093662/1093662-sd_640_360_30fps.mp4",
      mediaType: "video",
      toolUsed: "Flux Kontext",
      likes: 67,
    },
    {
      title: "Mirror Lake",
      description: "Mountain range perfectly reflected in a still lake",
      mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=640&q=80",
      mediaType: "image",
      toolUsed: "Kling 3.0",
      likes: 134,
    },
    {
      title: "Cosmic Voyage",
      description: "Journey through a spiral galaxy in deep space",
      mediaUrl: "https://videos.pexels.com/video-files/4553620/4553620-sd_640_360_25fps.mp4",
      mediaType: "video",
      toolUsed: "Kling 3.0",
      likes: 201,
    },
    {
      title: "Neon District",
      description: "Cyberpunk cityscape dripping with neon rain",
      mediaUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=640&q=80",
      mediaType: "image",
      toolUsed: "Sora 2",
      likes: 88,
    },
    {
      title: "Synthetic Mind",
      description: "Photorealistic robot face with human-like expression",
      mediaUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=640&q=80",
      mediaType: "image",
      toolUsed: "Character Swap 2.0",
      likes: 56,
    },
    {
      title: "Rain Meditation",
      description: "Raindrops tracing paths down a window pane",
      mediaUrl: "https://videos.pexels.com/video-files/2098989/2098989-sd_640_360_30fps.mp4",
      mediaType: "video",
      toolUsed: "Soul 2.0",
      likes: 122,
    },
    {
      title: "Saharan Flow",
      description: "Windswept sand dunes under a crimson sky",
      mediaUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=640&q=80",
      mediaType: "image",
      toolUsed: "Veo 3.1",
      likes: 77,
    },
    {
      title: "Color Explosion",
      description: "Dynamic paint splash frozen mid-air",
      mediaUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=640&q=80",
      mediaType: "image",
      toolUsed: "Flux Kontext",
      likes: 163,
    },
    {
      title: "Skyward Drift",
      description: "Sweeping drone footage over emerald valleys",
      mediaUrl: "https://videos.pexels.com/video-files/5765206/5765206-sd_640_360_25fps.mp4",
      mediaType: "video",
      toolUsed: "Veo 3.1",
      likes: 109,
    },
  ];

  for (const post of mockPosts) {
    await prisma.post.upsert({
      where: { id: `seed-${post.title.toLowerCase().replace(/\s+/g, "-")}` },
      update: { ...post, userId: user.id },
      create: {
        id: `seed-${post.title.toLowerCase().replace(/\s+/g, "-")}`,
        userId: user.id,
        ...post,
      },
    });
  }

  console.log("Seed complete: 1 user, 20 posts, 4 credit packages");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
