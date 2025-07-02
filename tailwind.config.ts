
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['Inter', 'system-ui', 'sans-serif'],
				'primary': ['Inter', 'system-ui', 'sans-serif'],
				'reflection': ['Georgia', 'Times New Roman', 'serif'],
				'playfair': ['Playfair Display', 'serif'],
				'display': ['Playfair Display', 'serif'],
			},
			colors: {
				/* New Dark Gray Design System */
				'dark-charcoal': 'rgb(17 24 39)', // gray-900
				'near-white': 'rgb(243 244 246)', // gray-100
				'medium-gray': 'rgb(156 163 175)', // gray-400
				'yellow-accent': 'rgb(250 204 21)', // yellow-400
				'amber-accent': 'rgb(245 158 11)', // amber-500
				'card-dark': 'rgb(31 41 55)', // gray-800
				'border-dark': 'rgb(55 65 81)', // gray-700
				'input-dark': 'rgb(31 41 55)', // gray-800

				/* Legacy colors updated for dark theme compatibility */
				'midnight-navy': 'rgb(17 24 39)',
				'soft-ivory': 'rgb(243 244 246)',
				'copper-rose': 'rgb(250 204 21)', // Updated to yellow
				'dusky-lavender': 'rgb(156 163 175)', // Updated to medium gray
				'charcoal-ink': 'rgb(31 41 55)',

				/* Updated legacy colors */
				'monark-navy': 'rgb(17 24 39)',
				'monark-ivory': 'rgb(243 244 246)',
				'monark-copper': 'rgb(250 204 21)',
				'monark-lavender': 'rgb(156 163 175)',
				'monark-sage': 'rgb(55 65 81)',
				'monark-brass': 'rgb(245 158 11)',
				'monark-coral': 'rgb(250 204 21)',
				'charcoal-gray': 'rgb(31 41 55)',
				'jet-black': 'rgb(17 24 39)',
				'goldenrod': 'rgb(250 204 21)',

				/* Shadcn integration */
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			spacing: {
				'xs': 'var(--spacing-xs)',
				'sm': 'var(--spacing-sm)',
				'md': 'var(--spacing-md)',
				'lg': 'var(--spacing-lg)',
				'xl': 'var(--spacing-xl)',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'yellow-gradient': 'linear-gradient(135deg, rgb(250 204 21) 0%, rgb(245 158 11) 100%)',
				'dark-gradient': 'linear-gradient(135deg, rgb(31 41 55) 0%, rgb(17 24 39) 100%)',
				'goldenrod-gradient': 'linear-gradient(135deg, rgb(250 204 21) 0%, rgb(245 158 11) 100%)',
			},
			boxShadow: {
				'monark': '0px 4px 20px rgba(0, 0, 0, 0.3)',
				'monark-glow': '0 0 20px rgba(250, 204, 21, 0.3)',
				'gentle': '0 2px 8px rgba(0, 0, 0, 0.2)',
				'golden-glow': '0 0 20px rgba(250, 204, 21, 0.4)',
				'yellow-glow': '0 0 20px rgba(250, 204, 21, 0.4)',
			},
			animation: {
				'gentle-pulse': 'gentle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'soft-fade-in': 'soft-fade-in 400ms ease-out',
				'slide-up': 'slide-up 350ms ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
			},
			borderRadius: {
				'monark': '12px',
				'monark-lg': '24px',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
