import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Anthara AI · 3D In-IDE Conduct Layer & Compliance Architecture',
  description: 'Interactive 3D visualization of the Anthara AI In-IDE Conduct Layer, Compliance Governance Engine, and AI-Fluent PDLC Architecture.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased select-none font-sans overflow-hidden">
        {children}
      </body>
    </html>
  );
}
