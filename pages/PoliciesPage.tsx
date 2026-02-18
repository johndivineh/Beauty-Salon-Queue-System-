
import React from 'react';

const PolicySection: React.FC<{ title: string, content: string }> = ({ title, content }) => (
  <div className="mb-20">
    <h2 className="text-2xl font-black serif text-black border-l-[12px] border-brand-pink pl-6 mb-8 uppercase tracking-tighter">{title}</h2>
    <p className="text-lg text-gray-500 leading-relaxed font-bold uppercase tracking-widest text-sm">{content}</p>
  </div>
);

const PoliciesPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-32 px-4">
      <div className="max-w-4xl mx-auto bg-white border-[10px] border-black p-16 md:p-32 shadow-[40px_40px_0px_0px_rgba(255,20,147,0.1)]">
        <h1 className="text-7xl font-black serif text-black text-center mb-24 uppercase tracking-tighter leading-none">Salon Protocols</h1>
        
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

        <div className="mt-32 pt-12 border-t border-black text-center">
          <p className="font-black text-[10px] text-gray-400 uppercase tracking-[0.5em]">The Northern Braids Bar • Ops Standard V2.5</p>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
