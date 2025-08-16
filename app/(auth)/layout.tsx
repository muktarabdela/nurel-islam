import React from 'react';

// A layout file must be a React component that accepts and renders a `children` prop.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}