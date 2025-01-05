"use client";

import React, { ReactNode, useState } from 'react'
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


function RootProviders({children}: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({}))
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem
                           disableTransitionOnChange>{children}</ThemeProvider>
        </QueryClientProvider>

    )
}

export default RootProviders
