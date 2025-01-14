import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Varesina Expenses',
        short_name: 'Spese',
        description: 'Personal expense app',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/web-app-manifest-192x192',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/web-app-manifest-512x512',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
