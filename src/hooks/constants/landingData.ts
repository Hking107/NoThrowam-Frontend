export const landingData = {
  header: {
    logoText: "",
    links: [
      { name: "Home", href: "#hero" },
      { name: "About", href: "#about" },
      { name: "Contact", href: "#contact" },
    ],
    signInText: "Sign In",
    registerText: "Register",
  },
  hero: {
    title: {
      en: "Transforming Waste in Cameroon.",
      fr: "Transformer les Déchets au Cameroun.",
    },
    subtitle: {
      en: "Join NoThrowam to clean our communities together.",
      fr: "Rejoignez NoThrowam pour nettoyer nos communautés ensemble.",
    },
    ctaText: {
      en: "Report Waste",
      fr: "Signaler des Déchets",
    },
    imageCaption: "Douala Street View",
    // Placeholder image that fits the "African vibe / clean street" description
    imageUrl:
      "https://images.theconversation.com/files/687459/original/file-20250826-56-683sie.jpeg?ixlib=rb-4.1.0&rect=0%2C0%2C4032%2C2688&q=50&auto=format&w=768&h=512&fit=crop&dpr=2",
  },
  successStories: {
    sectionTitle: "Success Stories",
    items: [
      {
        id: 1,
        title: "Community Cleanup in Yaoundé",
        description: "Over 500kg of plastic collected in one weekend.",
        imageUrl:
          "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2670&auto=format&fit=crop",
      },
      {
        id: 2,
        title: "Recycling Hub in Douala",
        description: "New processing center opened to handle local waste.",
        imageUrl:
          "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?q=80&w=2670&auto=format&fit=crop",
      },
      {
        id: 3,
        title: "Green School Initiative",
        description: "Educating the next generation on sustainability.",
        imageUrl:
          "https://images.unsplash.com/photo-1698692014130-d9782b2f955f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
    ],
  },
  actorFunnel: {
    seller: {
      title: "Have waste to sell?",
      description: "Turn your recyclables into income easily and quickly.",
      ctaText: "Publish Waste",
      icon: "shopping-cart", // We'll use lucide-react icons
    },
    customer: {
      title: "Looking to buy recycled materials?",
      description: "Find sustainable products from our trusted partners.",
      ctaText: "Shop Now",
      icon: "credit-card",
    },
    manager: {
      title: "Official Collection Partner",
      description: "Oversee waste collection and processing operations.",
      ctaText: "Manager Login",
      icon: "clipboard-check",
    },
  },
  teamMembers: [
    {
      id: 1,
      name: "Maya Fotso",
      role: "Product Lead",
      location: "Douala, Cameroon",
      bio: "Shapes the platform experience for sellers, buyers, and city teams.",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      name: "Daniel Ekani",
      role: "Operations Manager",
      location: "Yaounde, Cameroon",
      bio: "Coordinates collection workflows and keeps field activity moving.",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      name: "Arielle Nsame",
      role: "Community Builder",
      location: "Bafoussam, Cameroon",
      bio: "Works with neighborhoods and partners to grow local participation.",
      image:
        "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      name: "Samuel Talla",
      role: "Engineering Lead",
      location: "Buea, Cameroon",
      bio: "Builds the tools behind reports, listings, payments, and routing.",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5,
      name: "Nadia Mbarga",
      role: "Impact Analyst",
      location: "Garoua, Cameroon",
      bio: "Turns platform data into insight for cleaner, smarter communities.",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    },
  ],
  ctaSection: {
    title: {
      en: "Ready to make Cameroon cleaner?",
      fr: "Prêt à rendre le Cameroun plus propre ?",
    },
    subtitle: {
      en: "Join thousands of citizens and organizations working together for a sustainable future.",
      fr: "Rejoignez des milliers de citoyens et d'organisations travaillant ensemble pour un avenir durable.",
    },
    primaryCtaText: {
      en: "Join Now",
      fr: "Rejoindre",
    },
    secondaryCtaText: {
      en: "Contact Us",
      fr: "Contactez-nous",
    },
  },
  footer: {
    description: {
      en: "NoThrowam is a community-driven initiative dedicated to transforming waste management in Cameroon through technology and collaboration.",
      fr: "NoThrowam est une initiative communautaire dédiée à la transformation de la gestion des déchets au Cameroun par la technologie et la collaboration.",
    },
    quickLinks: [
      { name: "About Us", href: "#about" },
      { name: "Success Stories", href: "#stories" },
      { name: "Community", href: "#actors" },
      { name: "How it Works", href: "#how-it-works" },
      { name: "Careers", href: "#careers" },
    ],
    legalLinks: [
      { name: "Terms of Service", href: "#terms" },
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Cookie Policy", href: "#cookies" },
    ],
    contactInfo: {
      address: "Cité universitaire Ngoa-Ekelle ,Yaoundé , Cameroon",
      email: "nothrowam@gmail.com",
      phone: "+237 681 144 815",
    },
    socialLinks: {
      facebook: "#",
      twitter: "#",
      instagram: "#",
      linkedin: "#",
    },
    copyright: "© 2026 NoThrowam. All rights reserved.",
  },
  howToUse: {
    sectionTitle: "How It Works",
    sectionSubtitle:
      "Getting started with NoThrowam is simple. Follow these easy steps to start making a difference.",
    steps: [
      {
        number: 1,
        title: "Download the App",
        description:
          "Get NoThrowam from the App Store or Google Play in under a minute. Create your account and join the movement.",
      },
      {
        number: 2,
        title: "Report Waste",
        description:
          "Snap a photo, pin the location on the map, and submit a waste report instantly from wherever you are.",
      },
      {
        number: 3,
        title: "Connect with Collectors",
        description:
          "A nearby certified collector is automatically matched to your report and dispatched for pickup.",
      },
      {
        number: 4,
        title: "Track & Earn Rewards",
        description:
          "Follow the cleanup in real-time and earn green points you can redeem for rewards and discounts.",
      },
    ],
  },
};
