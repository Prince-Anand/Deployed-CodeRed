import React from 'react';
import { UserPlus, Search, Handshake } from 'lucide-react';
import FadeIn from './common/FadeIn';

const HowItWorks = () => {
    const steps = [
        {
            id: 1,
            title: 'Create Your Profile',
            description: 'Sign up as an agent or employer. Build your professional profile to showcase your skills or company needs.',
            icon: UserPlus,
        },
        {
            id: 2,
            title: 'Browse & Connect',
            description: 'Employers post jobs, and agents apply. Our algorithm matches the best talent with the right opportunities.',
            icon: Search,
        },
        {
            id: 3,
            title: 'Hire & Collaborate',
            description: 'Review applications, interview candidates, and start working together securely on our platform.',
            icon: Handshake,
        },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-gradient-to-b from-white to-[var(--color-background)] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <FadeIn>
                        <h2 className="text-base font-semibold leading-7 text-[var(--color-secondary)] uppercase tracking-wide">
                            Simple Process
                        </h2>
                        <h3 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-primary-dark)] sm:text-4xl font-serif">
                            How Agnt. Works
                        </h3>
                        <p className="mt-6 text-lg leading-8 text-slate-600">
                            Get started in minutes. We've streamlined the hiring process to help you focus on what matters most.
                        </p>
                    </FadeIn>
                </div>

                <div className="relative">
                    {/* Connecting Line for Desktop */}
                    <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-[var(--color-secondary)]/20 -z-10" />

                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                        {steps.map((step, index) => (
                            <FadeIn key={step.id} delay={index * 200}>
                                <div className="relative flex flex-col items-center text-center bg-white p-8 rounded-2xl shadow-sm border border-[var(--color-secondary)]/10 h-full hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-[var(--color-background)] border-4 border-white shadow-lg mb-8 relative z-10">
                                        <step.icon className="w-10 h-10 text-[var(--color-primary)]" />
                                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--color-secondary)] text-white flex items-center justify-center font-bold text-sm border-2 border-white">
                                            {step.id}
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-[var(--color-primary-dark)] mb-4">
                                        {step.title}
                                    </h4>
                                    <p className="text-slate-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
