'use client';

import { FeaturesSection } from './FeaturesSection';
import { HeroSection } from './HeroSection';
import { WorkflowShowcase } from './WorkflowShowcase';

export function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <WorkflowShowcase />
    </div>
  );
}
