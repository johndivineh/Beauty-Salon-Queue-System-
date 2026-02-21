
import React from 'react';

const PolicySection: React.FC<{ title: string, content: string }> = ({ title, content }) => (
  <div className="mb-16 group">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-1.5 h-8 bg-brand-primary rounded-full group-hover:scale-y-110 transition-transform duration-500"></div>
      <h2 className="text-2xl font-black serif text-brand-dark uppercase tracking-tighter">{title}</h2>
    </div>
    <p className="text-brand-muted leading-relaxed font-medium uppercase tracking-widest text-xs ml-6">{content}</p>
  </div>
);

const PoliciesPage: React.FC = () => {
  return (
    <div className="bg-brand-secondary/30 min-h-screen py-24 lg:py-32 px-4 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-brand-accent/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-12 md:p-24 lg:p-32 shadow-premium border border-brand-secondary relative z-10">
        <div className="text-center mb-24">
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.5em] mb-4 block">Operational Standards</span>
          <h1 className="text-5xl lg:text-7xl font-black serif text-brand-dark uppercase tracking-tighter leading-none">Salon Protocols</h1>
        </div>
        
        <div className="space-y-8">
          <PolicySection 
            title="Appointments"
            content="We’ve transitioned to a pure walk-in model to maintain creative flow. No more advance bookings. Join our live queue remotely to secure your position. Our system is built for spontaneous, high-energy braiding sessions."
          />

          <PolicySection 
            title="Payments"
            content="Service integrity is paramount. We require full payment before any braiding work begins. This allows our artisans to focus exclusively on the craft without administrative interruptions during your session."
          />

          <PolicySection 
            title="No Escorts"
            content="To preserve the professional atmosphere and salon space, only clients receiving services are permitted inside. We prioritize your personal comfort and our team's creative concentration."
          />

          <PolicySection 
            title="Refreshments"
            content="Premium service includes premium care. Complimentary high-end bottled water and select beverages are provided with every braiding session. Pure relaxation while we engineer your style."
          />
        </div>

        <div className="mt-32 pt-12 border-t border-brand-secondary text-center">
          <p className="font-black text-[10px] text-brand-muted uppercase tracking-[0.5em]">The Northern Braids Bar • Ops Standard V3.0</p>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
