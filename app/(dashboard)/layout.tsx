import React, { ReactNode } from 'react'
import Navbar from '@/components/Navbar';

function Layout({children}: {children: ReactNode}) {
    return (
        <div className="relative flex h-dvh w-full flex-col">
            <Navbar></Navbar>
            <div className="w-full">{children}</div>
        </div>
    )
}

export default Layout
