import React from 'react'
import { HandCoins } from 'lucide-react';

function Logo() {
    return (
        <a href="/" className="flex items-center gap-2">
            <HandCoins className="stroke h-11 w-11 stroke-amber-500 stroke-[1.5]"/>
            <div >
                <p className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent">VaresinaExpenses</p>
                <small className="text-right ms-2 text-xs text-white">Aiutati a capire come mai sei povero</small>
            </div>

        </a>
    )
}

export function LogoMobile() {
    return (
        <a href="/" className="flex items-center gap-2">
            <p className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent">VaresinaExpenses</p>
        </a>
    )
}

export default Logo
