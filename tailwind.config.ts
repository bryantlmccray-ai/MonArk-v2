
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
			},
			colors: {
				/* MonArk Design System */
				'monark-navy': 'rgb(18 26 47)',
				'monark-ivory': 'rgb(247 245 242)',
				'monark-copper': 'rgb(181 105 62)',
				'monark-lavender': 'rgb(156 143 185)',
				'monark-sage': 'rgb(162 181 161)',
				'monark-brass': 'rgb(194 168 107)',
				'monark-coral': 'rgb(222 140 134)',

				/* Legacy colors for backward compatibility */
				'charcoal-gray': '#1E1E1E',
				'jet-black': '#121212',
				'goldenrod': '#FFC700',

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
				'monark-gradient': 'linear-gradient(135deg, rgb(181 105 62) 0%, rgb(156 143 185) 100%)',
				'calm-gradient': 'linear-gradient(135deg, rgb(162 181 161) 0%, rgb(194 168 107) 100%)',
			},
			boxShadow: {
				'monark': '0px 4px 20px rgba(18, 26, 47, 0.15)',
				'monark-glow': '0 0 20px rgba(181, 105, 62, 0.3)',
				'gentle': '0 2px 8px rgba(18, 26, 47, 0.1)',
			},
			animation: {
				'gentle-pulse': 'gentle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'soft-fade-in': 'soft-fade-in 400ms ease-out',
				'slide-up': 'slide-up 350ms ease-out',
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
