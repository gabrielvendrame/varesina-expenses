import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';
import RootProviders from '@/app/components/providers/RootProviders';
import { Toaster } from '@/components/ui/sonner';


export const metadata: Metadata = {
    title: "Varesina expenses",
    description: "Aiutati a capire come mai sei povero",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="it" className="dark" style={{colorScheme: "dark"}}>
        <ClerkProvider afterSignOutUrl="/sign-in">
            <body>
            <Toaster richColors position="bottom-right"/>
            <RootProviders>{children}</RootProviders>
            </body>
        </ClerkProvider>

        </html>
    )
}
