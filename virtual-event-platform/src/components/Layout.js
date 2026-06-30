import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8 animate-fadeIn">
                {children}
            </main>
            {/* Footer could go here if needed later */}
        </div>
    );
};

export default Layout;
