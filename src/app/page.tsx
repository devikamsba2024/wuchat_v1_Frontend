'use client';

import SimpleChat from '@/components/SimpleChat';

export default function Home() {

  return (
    <div className="relative min-h-screen">
      {/* Skip to content link */}
      <a href="#hero-section" className="skip-to-content">
        Skip to main content
      </a>


      {/* Chat Section */}
                  <section id="hero-section" className="relative py-8 px-4 min-h-screen flex items-center justify-center">
                    <div className="container mx-auto max-w-6xl w-full">
                      <SimpleChat />
                    </div>
                  </section>



    </div>
  );
}