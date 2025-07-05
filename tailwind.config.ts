
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
				'sans': ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
				'primary': ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
				'reflection': ['Georgia', 'Times New Roman', 'serif'],
				'playfair': ['Playfair Display', 'serif'],
				'display': ['Playfair Display', 'serif'],
			},
			colors: {
				/* Luxurious Color System - Deep Sapphire & Gold */
				'deep-navy': 'rgb(15 23 42)', // slate-900
				'sapphire': 'rgb(30 58 138)', // blue-800 
				'rich-gold': 'rgb(212 175 55)', // classic gold
				'warm-ivory': 'rgb(254 247 205)', // amber-50
				'soft-gray': 'rgb(148 163 184)', // slate-400
				'charcoal': 'rgb(30 41 59)', // slate-800
				'graphite': 'rgb(51 65 85)', // slate-700
				'midnight': 'rgb(15 23 42)', // slate-900

				/* Legacy color updates for luxury theme */
				'midnight-navy': 'rgb(15 23 42)',
				'soft-ivory': 'rgb(254 247 205)',
				'copper-rose': 'rgb(212 175 55)', // Updated to rich gold
				'dusky-lavender': 'rgb(148 163 184)', // Updated to soft gray
				'charcoal-ink': 'rgb(30 41 59)',

				/* Updated MonArk brand colors */
				'monark-navy': 'rgb(15 23 42)',
				'monark-ivory': 'rgb(254 247 205)',
				'monark-copper': 'rgb(212 175 55)',
				'monark-lavender': 'rgb(148 163 184)',
				'monark-sage': 'rgb(51 65 85)',
				'monark-brass': 'rgb(30 58 138)',
				'monark-coral': 'rgb(212 175 55)',
				'charcoal-gray': 'rgb(30 41 59)',
				'jet-black': 'rgb(15 23 42)',
				'goldenrod': 'rgb(212 175 55)',

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
				'gold-gradient': 'linear-gradient(135deg, rgb(212 175 55) 0%, rgb(30 58 138) 100%)',
				'luxury-gradient': 'linear-gradient(135deg, rgb(30 41 59) 0%, rgb(15 23 42) 100%)',
				'goldenrod-gradient': 'linear-gradient(135deg, rgb(212 175 55) 0%, rgb(30 58 138) 100%)',
			},
			boxShadow: {
				'monark': '0px 4px 20px rgba(0, 0, 0, 0.3)',
				'monark-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
				'gentle': '0 2px 8px rgba(0, 0, 0, 0.2)',
				'golden-glow': '0 0 20px rgba(212, 175, 55, 0.4)',
				'gold-glow': '0 0 20px rgba(212, 175, 55, 0.4)',
				'sapphire-glow': '0 0 20px rgba(30, 58, 138, 0.4)',
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
