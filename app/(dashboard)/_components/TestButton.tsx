"use client"

import React from 'react'
import { ImportData } from '@/app/(dashboard)/_actions/importData';
import { Button } from '@/components/ui/button';

function TestButton() {

    const prova = ()=>{
        ImportData().then(e=> console.log(e))
    }
    return (
        <Button onClick={prova}>IMPORTA DATI</Button>
    )
}

export default TestButton
