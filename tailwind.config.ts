
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
				'sans': ['DM Sans', 'Inter', 'Helvetica Neue', 'sans-serif'],
				'serif': ['Playfair Display', 'Georgia', 'serif'],
				'editorial': ['Playfair Display', 'Georgia', 'serif'],
				'body': ['DM Sans', 'Inter', 'Helvetica Neue', 'sans-serif'],
				'headline': ['Playfair Display', 'Georgia', 'serif'],
				'caption': ['DM Sans', 'Inter', 'Helvetica Neue', 'sans-serif'],
			},
			colors: {
				/* Quiet Luxury Colors - Editorial magazine aesthetic - Using CSS variables */
				'bone': 'hsl(var(--color-bone))', /* Soft ivory/bone - warm neutral background */
				'sand': 'hsl(var(--color-sand))', /* Subtle sand for surfaces */
				'parchment': 'hsl(var(--color-parchment))', /* Softer ivory for elevated surfaces */
				'charcoal': 'hsl(var(--color-charcoal))', /* Very dark green for maximum readability */
				'charcoal-soft': 'hsl(var(--color-charcoal-soft))', /* Dark green for secondary text */
				'charcoal-muted': 'hsl(var(--color-charcoal-muted))', /* Dark brown for muted elements */
				'taupe': 'hsl(var(--color-taupe))', /* Muted taupe - editorial accent */
				'olive': 'hsl(var(--color-olive))', /* Muted olive - sparingly used */
				'dusty-rose': 'hsl(var(--color-dusty-rose))', /* Dusty rose for gentle alerts */
				'goldenrod': 'hsl(var(--color-goldenrod))', /* Rich gold for accents */
				'gold-dark': 'hsl(var(--color-gold-dark))', /* Darker gold for hover states */

				/* Legacy support for gradual migration */
				'warm-ivory': 'hsl(35, 15%, 96%)', /* same as bone */
				'metallic-gold': 'hsl(25, 25%, 25%)', /* now taupe for editorial feel */
				'deep-navy': 'hsl(220, 15%, 15%)', /* now charcoal */

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
				'editorial': 'linear-gradient(135deg, hsl(35, 15%, 96%) 0%, hsl(35, 8%, 92%) 100%)',
				'surface': 'linear-gradient(180deg, hsl(35, 20%, 98%) 0%, hsl(35, 8%, 92%) 100%)',
				'subtle-accent': 'linear-gradient(135deg, hsl(25, 25%, 25%) 0%, hsl(80, 15%, 65%) 100%)',
				'magazine': 'linear-gradient(45deg, hsl(35, 15%, 96%), hsl(35, 20%, 98%), hsl(35, 8%, 92%))',
			},
			boxShadow: {
				'editorial': '0 2px 16px rgba(0, 0, 0, 0.08)',
				'gentle': '0 1px 8px rgba(0, 0, 0, 0.04)',
				'elevated': '0 4px 24px rgba(0, 0, 0, 0.12)',
				'magazine': '0 8px 40px rgba(0, 0, 0, 0.06)',
				'soft': '0 2px 12px rgba(0, 0, 0, 0.06)',
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
