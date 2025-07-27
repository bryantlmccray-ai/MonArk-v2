
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
				/* Clean luxury colors matching logo - HSL format for proper color functions */
				'metallic-gold': 'hsl(45, 67%, 53%)', /* #D4AF37 - exact logo gold */
				'gold-light': 'hsl(45, 67%, 63%)', /* #E0C547 - lighter variant */
				'gold-dark': 'hsl(45, 67%, 43%)', /* #B8951D - darker variant */
				'deep-navy': 'hsl(220, 25%, 12%)', /* #1a1f2e - logo background navy */
				'warm-ivory': 'hsl(0, 0%, 97%)', /* #F8F8F8 - elegant text */
				'charcoal': 'hsl(220, 15%, 25%)', /* premium surfaces */
				'graphite': 'hsl(220, 10%, 40%)', /* borders and muted elements */
				'midnight': 'hsl(220, 30%, 8%)', /* deep accents */

				/* Legacy support - cleaned up */
				'goldenrod': 'hsl(45, 67%, 53%)', /* same as metallic-gold */
				'jet-black': 'hsl(220, 25%, 12%)', /* same as deep-navy */
				'charcoal-gray': 'hsl(220, 15%, 25%)', /* same as charcoal */

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
				'luxury-gold': 'linear-gradient(135deg, hsl(45, 67%, 53%) 0%, hsl(45, 67%, 63%) 100%)',
				'premium-gold': 'linear-gradient(135deg, hsl(45, 67%, 43%) 0%, hsl(45, 67%, 53%) 100%)',
				'elegant-navy': 'linear-gradient(135deg, hsl(220, 25%, 12%) 0%, hsl(220, 15%, 25%) 100%)',
				'shimmer-gold': 'linear-gradient(45deg, hsl(45, 67%, 43%), hsl(45, 67%, 53%), hsl(45, 67%, 63%))',
				/* Legacy support */
				'goldenrod-gradient': 'linear-gradient(135deg, hsl(45, 67%, 53%) 0%, hsl(45, 67%, 63%) 100%)',
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
				'shimmer': 'shimmer 3s ease-in-out infinite',
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
