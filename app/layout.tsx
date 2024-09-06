import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';
import RootProviders from '@/app/components/providers/RootProviders';


export const metadata: Metadata = {
    title: "Expenses Tracker",
    description: "Created by GV",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="it" className="dark" style={{colorScheme: "dark"}}>
        <ClerkProvider>
            <body>
            <RootProviders>{children}</RootProviders>
            </body>
        </ClerkProvider>
        </html>
    );
}
