export const landingData = {
  header: {
    logoText: "NoThrowam",
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
      "https://images.unsplash.com/photo-1594386479412-fa62932f4cdc?q=80&w=1117&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
          "https://images.unsplash.com/photo-1526976663112-00aed68dd1ed?q=80&w=2670&auto=format&fit=crop",
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
    copyright: "© 2026 NoThrowam. All rights reserved.",
  },
};
