import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "@/config/env";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
    display: "swap"
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
    display: "swap"
});

export const metadata: Metadata = {
    title: {
		default: env.siteName,
		template: `%s | ${env.siteName}`,
	},
	description: env.siteDesc,

	authors: [{ name: "Jean-Pierre Dupuis" }],
	creator: "Jean-Pierre Dupuis",
	publisher: env.siteName,

	// Métadonnées pour les réseaux sociaux
	metadataBase: new URL(env.siteUrl),
	applicationName: env.siteName,
	alternates: {
		canonical: env.siteUrl,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
