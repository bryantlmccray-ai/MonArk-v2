
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
    			sans: [
    				'Inter',
    				'ui-sans-serif',
    				'system-ui',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'Segoe UI',
    				'Roboto',
    				'Helvetica Neue',
    				'Arial',
    				'Noto Sans',
    				'sans-serif'
    			],
    			serif: [
    				'Lora',
    				'ui-serif',
    				'Georgia',
    				'Cambria',
    				'Times New Roman',
    				'Times',
    				'serif'
    			],
    			editorial: [
    				'Playfair Display',
    				'Georgia',
    				'serif'
    			],
    			body: [
    				'DM Sans',
    				'Inter',
    				'Helvetica Neue',
    				'sans-serif'
    			],
    			headline: [
    				'Playfair Display',
    				'Georgia',
    				'serif'
    			],
    			caption: [
    				'DM Sans',
    				'Inter',
    				'Helvetica Neue',
    				'sans-serif'
    			],
    			mono: [
    				'Space Mono',
    				'ui-monospace',
    				'SFMono-Regular',
    				'Menlo',
    				'Monaco',
    				'Consolas',
    				'Liberation Mono',
    				'Courier New',
    				'monospace'
    			]
    		},
    		colors: {
    			bone: 'hsl(var(--color-bone))',
    			sand: 'hsl(var(--color-sand))',
    			parchment: 'hsl(var(--color-parchment))',
    			charcoal: 'hsl(var(--color-charcoal))',
    			'charcoal-soft': 'hsl(var(--color-charcoal-soft))',
    			'charcoal-muted': 'hsl(var(--color-charcoal-muted))',
    			taupe: 'hsl(var(--color-taupe))',
    			olive: 'hsl(var(--color-olive))',
    			'dusty-rose': 'hsl(var(--color-dusty-rose))',
    			goldenrod: 'hsl(var(--color-goldenrod))',
    			'gold-dark': 'hsl(var(--color-gold-dark))',
    			rosegold: 'hsl(var(--color-rosegold))',
    			'rosegold-deep': 'hsl(var(--color-rosegold-deep))',
    			'warm-glow': 'hsl(var(--color-warm-glow))',
    			'warm-ivory': 'hsl(30, 25%, 96%)',
    			'metallic-gold': 'hsl(20, 18%, 35%)',
    			'deep-navy': 'hsl(220, 20%, 16%)',
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
    			xs: 'var(--spacing-xs)',
    			sm: 'var(--spacing-sm)',
    			md: 'var(--spacing-md)',
    			lg: 'var(--spacing-lg)',
    			xl: 'var(--spacing-xl)'
    		},
    		backgroundImage: {
    			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
    			editorial: 'linear-gradient(135deg, hsl(30, 25%, 96%) 0%, hsl(30, 15%, 91%) 100%)',
    			surface: 'linear-gradient(180deg, hsl(30, 30%, 97%) 0%, hsl(30, 15%, 91%) 100%)',
    			'subtle-accent': 'linear-gradient(135deg, hsl(15, 50%, 65%, 0.1) 0%, hsl(35, 55%, 52%, 0.05) 100%)',
    			magazine: 'linear-gradient(45deg, hsl(30, 25%, 96%), hsl(30, 30%, 97%), hsl(30, 15%, 91%))',
    			'cta-warm': 'linear-gradient(135deg, hsl(20, 18%, 35%), hsl(12, 40%, 50%))'
    		},
    		boxShadow: {
    			editorial: '0 2px 16px rgba(0, 0, 0, 0.08)',
    			gentle: '0 1px 8px rgba(0, 0, 0, 0.04)',
    			elevated: '0 4px 24px rgba(0, 0, 0, 0.12)',
    			magazine: '0 8px 40px rgba(0, 0, 0, 0.06)',
    			soft: '0 2px 12px rgba(0, 0, 0, 0.06)',
    			'2xs': 'var(--shadow-2xs)',
    			xs: 'var(--shadow-xs)',
    			sm: 'var(--shadow-sm)',
    			md: 'var(--shadow-md)',
    			lg: 'var(--shadow-lg)',
    			xl: 'var(--shadow-xl)',
    			'2xl': 'var(--shadow-2xl)'
    		},
    		animation: {
    			'gentle-pulse': 'gentle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    			'soft-fade-in': 'soft-fade-in 400ms ease-out',
    			'slide-up': 'slide-up 350ms ease-out',
    			'fade-in': 'fade-in 0.3s ease-out',
    			shimmer: 'shimmer 3s ease-in-out infinite'
    		},
    		borderRadius: {
    			monark: '12px',
    			'monark-lg': '24px',
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
