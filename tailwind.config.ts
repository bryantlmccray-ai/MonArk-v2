
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
				/* Luxurious Color System - Deep Navy & Metallic Gold */
				'deep-navy': '#0B0B45',
				'metallic-gold': '#D4AF37',
				'gold-light': '#E0C547',
				'gold-dark': '#B8951D',
				'warm-ivory': '#F8F8F8',
				'charcoal': '#2C2C54',
				'graphite': '#40405A',
				'midnight': '#070735',

				/* Legacy color updates for new luxury theme */
				'midnight-navy': '#0B0B45',
				'soft-ivory': '#F8F8F8',
				'copper-rose': '#D4AF37',
				'dusky-lavender': '#40405A',
				'charcoal-ink': '#2C2C54',

				/* Updated MonArk brand colors */
				'monark-navy': '#0B0B45',
				'monark-ivory': '#F8F8F8',
				'monark-copper': '#D4AF37',
				'monark-lavender': '#40405A',
				'monark-sage': '#2C2C54',
				'monark-brass': '#B8951D',
				'monark-coral': '#D4AF37',
				'charcoal-gray': '#2C2C54',
				'jet-black': '#0B0B45',
				'goldenrod': '#D4AF37',

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
				'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #E0C547 100%)',
				'metallic-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B8951D 100%)',
				'luxury-gradient': 'linear-gradient(135deg, #2C2C54 0%, #0B0B45 100%)',
				'goldenrod-gradient': 'linear-gradient(135deg, #D4AF37 0%, #E0C547 100%)',
				'premium-gradient': 'linear-gradient(135deg, #D4AF37 0%, #E0C547 50%, #D4AF37 100%)',
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
