import React from 'react';

interface PricingProps {
  onOpenContact?: (initialData?: any) => void;
}

export const Pricing: React.FC<PricingProps> = () => {
  return <section id="pricing" style={{ display: 'none' }} />;
};
