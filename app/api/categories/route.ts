import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const user = await currentUser()
    if (!user) {
        redirect('/sign-in')
    }

    const categories = await prisma.category.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            name: "asc"
        }
    })

    return Response.json(categories)

}
