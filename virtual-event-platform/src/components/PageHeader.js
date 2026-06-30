import React from 'react';

const PageHeader = ({ title, subtitle, gradient = false }) => {
    return (
        <div className={`mb-12 ${gradient ? 'text-center' : 'border-l-4 border-primary pl-6'}`}>
            <h1 className={`text-4xl font-extrabold tracking-tight sm:text-5xl ${gradient ? 'bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent' : 'text-text-primary'
                }`}>
                {title}
            </h1>
            <p className={`mt-4 text-lg text-text-secondary max-w-2xl leading-relaxed ${gradient ? 'mx-auto' : ''}`}>
                {subtitle}
            </p>
        </div>
    );
};

export default PageHeader;
