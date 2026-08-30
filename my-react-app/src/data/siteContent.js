// ===== All static text content for the site =====

export const productsText = {
  badge: 'Collection',
  title: 'Our Kalamkari Collection',
  subtitle: 'Each piece is a masterwork of traditional Indian craftsmanship',
  emptyIcon: '🔍',
  emptyMessage: 'No products found in this category.',
  addToCart: 'Add to Cart',
  quickView: 'Quick View',
  wishlist: 'Wishlist',
};

export const aboutText = {
  badge: 'Our Heritage',
  title: 'The Ancient Art of Kalamkari',
  description: [
    `<strong>From a Humble Beginning to 16,000 Heartbeats:</strong> The MS Vastravarna Story Every great journey begins with a small step and a big dream. Two years ago, MS Vastravarna was born in a quiet corner of our home, built on a deep passion for authentic handlooms and a vision to bring timeless artistry into everyday fashion. We started with just 264 belief-filled customers who took a chance on our dream.
Step by step, line by line, we grew. Moving from a home-based setup to a local street presence gave us our greatest asset: direct conversations with you. Understanding your needs, hearing your stories, and seeing your love for our fabrics pushed us to take our biggest leap yet—opening our very own dedicated retail space.
Innovating Kalamkari for the Modern Professional
`,
`<strong>We noticed a gap in the fast-paced corporate world:</strong> women wanted the elegance of traditional Indian heritage without compromising on daily style and structure. To bring a chic, contemporary edge to IT hubs and modern workplaces, we introduced premium, innovative edits of Kalamkari—transforming age-old craft into sharp, breathable, modern essentials.
A Leap of Faith: The Feeding Frock Success
Innovation often comes with uncertainty. When we first conceptualized Kalamkari feeding frocks, we hesitated. Could functional maternity wear be made beautiful, comfortable, and deeply rooted in artisan handloom? Overcoming our fears paid off in ways we never imagined—today, our feeding frocks stand as one of our all-time top bestsellers, trusted by young mothers every day.
16,000+ Strong and Growing Every Day
What started as a handful of orders has blossomed into a thriving family of over 16,000 customers. Your glowing reviews, honest feedback, and continuous support have driven us to innovate constantly—introducing fresh silhouettes, better fits, and elevated designs.
Today, MS Vastravarna isn't just a label; it’s a living story of tradition meeting modern utility. Every day, we show up with one goal: to get better for you.`,
`<strong>Thank you for being the heart of our journey!</strong>`
  ],
  features: [
    {
      icon: '🎨',
      iconColor: 'var(--kk-mustard)',
      title: 'Hand-Painted',
      text: 'Each piece crafted by skilled artisans using traditional Kalam pens',
    },
    {
      icon: '🌿',
      iconColor: 'var(--kk-green)',
      title: 'Natural Dyes',
      text: 'Eco-friendly vegetable & mineral dyes — zero synthetic chemicals',
    },
    {
      icon: '🤝',
      iconColor: 'var(--kk-indigo)',
      title: 'Fair Trade',
      text: 'Direct support to 50+ artisan families across Andhra Pradesh',
    },
  ],
  showcase: {
    number: '3000+',
    label: 'Years of Heritage',
  },
  imageCards: [
    { icon: '🪷', label: 'Srikalahasti Style' },
    { icon: '🖌️', label: 'Pen Kalamkari' },
    { icon: '🏛️', label: 'Machilipatnam Block Print', large: true },
  ],
};

export const testimonialsText = {
  badge: 'Testimonials',
  title: 'What Our Customers Say',
  subtitle: 'Trusted by thousands of art lovers across India',
};

export const footerText = {
  brandName: 'Kalamkari Kala',
  brandDescription:
    'Preserving the ancient art of Kalamkari through authentic handcrafted textiles and home decor. Every purchase empowers artisan communities.',
  quickLinks: {
    title: 'Quick Links',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Categories', href: '#categories' },
      { label: 'Reviews', href: '#testimonials' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Cart', href: '/cart' },
      { label: 'Profile', href: '/profile' },
    ],
  },
  customerCare: {
    title: 'Customer Care',
    links: [
      { label: 'Shipping Info', href: '/info/shipping' },
      { label: 'Returns & Exchanges', href: '/info/returns' },
      { label: 'Size Guide', href: '/info/size-guide' },
      { label: 'FAQs', href: '/info/faq' },
    ],
  },
  newsletter: {
    title: 'Stay Connected',
    description: 'Subscribe for new arrivals, artisan stories, and exclusive offers.',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
  },
  copyright: '© 2026 Kalamkari Kala. All rights reserved. Handcrafted with ♥ for Indian art heritage.',
};

export const navText = {
  brandName: 'Kalamkari Kala',
  tagline: 'Artisan Heritage',
  links: [
    { id: 'home', label: 'Home' },
    { id: 'categories', label: 'Collections' },
    // { id: 'products', label: 'Shop' },
    { id: 'about', label: 'Our Story' },
    { id: 'testimonials', label: 'Reviews' },
  ],
};

export const loginText = {
  left: {
    brandName: 'MS Vastravarna',
    tagline: 'The Ultimate Kalamkari Fashion House',
    description: 'Rediscover ancient traditions through contemporary silhouettes. Handcrafted with love by master artisans.',
    stats: [
      { value: '500+', label: 'Products' },
      { value: '50+', label: 'Artisans' },
      { value: '10K+', label: 'Customers' },
    ],
  },
  right: {
    welcomeText: 'Welcome to',
    brandName: 'MS Vastravarna',
    loginSubtitle: 'Sign in to your account',
    signupSubtitle: 'Create your account',
  },
  loginForm: {
    emailOrPhoneLabel: 'Phone Number / Email',
    emailOrPhonePlaceholder: 'Enter phone number or email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot Password?',
    submitButton: 'Login',
    switchText: 'New user?',
    switchButton: 'Create Account',
  },
  signupForm: {
    nameLabel: 'Full Name',
    namePlaceholder: 'Enter your full name',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'Enter your phone number',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Create a password',
    confirmPasswordLabel: 'Verify Password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    submitButton: 'Create Account',
    switchText: 'Already have an account?',
    switchButton: 'Login',
  },
  errors: {
    allFields: 'Please fill in all fields.',
    passwordMismatch: 'Passwords do not match.',
    passwordMinLength: 'Password must be at least 8 characters with 1 special character.',
  },
  forgotPassword: {
    title: 'Forgot Password',
    emailStep: {
      subtitle: 'Enter your email to receive a verification code',
      label: 'Email Address',
      placeholder: 'Enter your registered email',
      submitButton: 'Send OTP',
      loadingButton: 'Sending...',
      backButton: 'Back to Login',
    },
    otpStep: {
      subtitle: 'Enter the 6-digit code sent to your email',
      label: 'Verification Code',
      placeholder: 'Enter 6-digit OTP',
      submitButton: 'Verify OTP',
      loadingButton: 'Verifying...',
      resendText: "Didn't receive the code?",
      resendButton: 'Resend OTP',
    },
    resetStep: {
      subtitle: 'Create your new password',
      passwordLabel: 'New Password',
      passwordPlaceholder: 'Enter new password',
      confirmLabel: 'Re-enter Password',
      confirmPlaceholder: 'Confirm new password',
      submitButton: 'Reset Password',
      loadingButton: 'Resetting...',
    },
    successMessage: 'Password reset successful! You can now login with your new password.',
  },
};
