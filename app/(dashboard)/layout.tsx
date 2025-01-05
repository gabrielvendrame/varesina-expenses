import React, { ReactNode } from 'react'
import Navbar from '@/app/components/Navbar';

function Layout({children}: {children: ReactNode}) {
    return (
        <div className="relative flex h-screen w-full flex-col">
            <Navbar></Navbar>
            <div className="w-full">{children}</div>
        </div>
    )
}

export default Layout
