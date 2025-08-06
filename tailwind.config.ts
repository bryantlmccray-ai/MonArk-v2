
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
				'sans': ['Maison Neue', 'Inter', 'Helvetica Neue', 'sans-serif'],
				'serif': ['Canela', 'Tiempos Text', 'Playfair Display', 'Georgia', 'serif'],
				'editorial': ['Canela', 'Tiempos Text', 'Playfair Display', 'Georgia', 'serif'],
				'body': ['Maison Neue', 'Inter', 'Helvetica Neue', 'sans-serif'],
				'headline': ['Canela', 'Tiempos Text', 'Playfair Display', 'Georgia', 'serif'],
				'caption': ['Maison Neue', 'Inter', 'Helvetica Neue', 'sans-serif'],
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
			keyframes: {
				// Accordion Animations
				"accordion-down": {
					from: { height: "0", opacity: "0" },
					to: { height: "var(--radix-accordion-content-height)", opacity: "1" }
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
					to: { height: "0", opacity: "0" }
				},
				// Fade Animations
				"fade-in": {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				"fade-out": {
					"0%": {
						opacity: "1",
						transform: "translateY(0)"
					},
					"100%": {
						opacity: "0",
						transform: "translateY(10px)"
					}
				},
				// Scale Animations
				"scale-in": {
					"0%": {
						transform: "scale(0.95)",
						opacity: "0"
					},
					"100%": {
						transform: "scale(1)",
						opacity: "1"
					}
				},
				"scale-out": {
					from: { transform: "scale(1)", opacity: "1" },
					to: { transform: "scale(0.95)", opacity: "0" }
				},
				// Slide Animations
				"slide-in-right": {
					"0%": { transform: "translateX(100%)" },
					"100%": { transform: "translateX(0)" }
				},
				"slide-out-right": {
					"0%": { transform: "translateX(0)" },
					"100%": { transform: "translateX(100%)" }
				},
				"slide-up": {
					"0%": { transform: "translateY(20px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" }
				},
				// Custom MonArk Animations
				'gentle-pulse': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
					'50%': { transform: 'scale(1.05)', opacity: '1' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' }
				}
			},
			animation: {
				// Basic Animations
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.3s ease-out",
				"fade-out": "fade-out 0.3s ease-out",
				"scale-in": "scale-in 0.2s ease-out",
				"scale-out": "scale-out 0.2s ease-out",
				"slide-in-right": "slide-in-right 0.3s ease-out",
				"slide-out-right": "slide-out-right 0.3s ease-out",
				"slide-up": "slide-up 350ms ease-out",
				
				// Combined Animations
				"enter": "fade-in 0.3s ease-out, scale-in 0.2s ease-out",
				"exit": "fade-out 0.3s ease-out, scale-out 0.2s ease-out",
				
				// MonArk Custom Animations
				'gentle-pulse': 'gentle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'shimmer': 'shimmer 3s ease-in-out infinite',
				'float': 'float 6s ease-in-out infinite',
				'glow': 'glow 3s ease-in-out infinite',
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
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }: any) {
			const newUtilities = {
				// Underline Animation
				'.story-link': {
					'position': 'relative',
					'display': 'inline-block',
					'&::after': {
						content: "''",
						position: 'absolute',
						width: '100%',
						transform: 'scaleX(0)',
						height: '2px',
						bottom: '0',
						left: '0',
						backgroundColor: 'hsl(var(--color-goldenrod))',
						transformOrigin: 'bottom right',
						transition: 'transform 0.3s ease-out',
					},
					'&:hover::after': {
						transform: 'scaleX(1)',
						transformOrigin: 'bottom left',
					}
				},
				// Hover Scale Animation
				'.hover-scale': {
					transition: 'transform 0.2s ease-out',
					'&:hover': {
						transform: 'scale(1.05)',
					}
				},
				// Smooth lift effect
				'.hover-lift': {
					transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
					'&:hover': {
						transform: 'translateY(-4px)',
						boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
					}
				},
				// Glow effect on hover
				'.hover-glow': {
					transition: 'all 0.3s ease-out',
					'&:hover': {
						boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
						transform: 'scale(1.02)',
					}
				},
				// Gradient shift animation
				'.hover-gradient': {
					backgroundSize: '200% 200%',
					transition: 'background-position 0.3s ease',
					'&:hover': {
						backgroundPosition: 'right center',
					}
				}
			};
			addUtilities(newUtilities);
		}
	],
} satisfies Config;
