import React from 'react'
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CurrencyComboBox } from '@/app/components/CurrencyComboBox';
import Logo from '@/components/Logo';

async function Page() {
    const user = await currentUser()
    if (!user) {
        redirect('/sign-in')
    }
    return (
        <div className="container flex max-w-2xl flex-col items-center justify-between gap-4">
            <div>
                <h1 className="text-center text-3xl">
                    Benvenuto {user.firstName}
                </h1>
                <h2 className="mt-4 text-center text-base text-muted-foreground">Seleziona una valuta</h2>
                <h3 className="mt-2 text-center text-sm text-muted-foreground"> Puoi cambiare queste impostazioni quando
                    vuoi</h3>
            </div>
            <Separator/>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Valuta</CardTitle>
                    <CardDescription>Seleziona la valuta di default</CardDescription>
                </CardHeader>
                <CardContent>
                    <CurrencyComboBox></CurrencyComboBox>
                </CardContent>
            </Card>

            <Separator/>
            <Button className="w-full" asChild>
                <Link href={"/"}>Fatto! Portami alla dashboard</Link>
            </Button>
            <div className="mt-8">
                <Logo></Logo>
            </div>
        </div>
    )
}

export default Page
