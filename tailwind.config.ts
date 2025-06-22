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
			colors: {
				// BroYouFree Brand Colors
				'primary-navy': 'hsl(240, 15%, 8%)',
				'primary-variant': 'hsl(240, 15%, 12%)',
				'accent-orange': 'hsl(25, 85%, 55%)',
				'accent-light': 'hsl(25, 85%, 65%)',
				'surface-light': 'hsl(240, 8%, 98%)',
				'surface-dark': 'hsl(240, 12%, 6%)',
				'glass-surface': 'hsla(240, 15%, 99%, 0.85)',
				
				// Text Colors
				'text-primary': 'hsl(240, 15%, 8%)',
				'text-secondary': 'hsl(240, 10%, 45%)',
				'text-muted': 'hsl(240, 8%, 65%)',
				
				// Legacy Radix UI Colors (maintained for compatibility)
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(240, 15%, 8%)', // Primary Navy
					hover: 'hsl(240, 15%, 12%)', // Primary Variant
					light: 'hsl(25, 85%, 65%)', // Accent Light
					dark: 'hsl(240, 12%, 6%)', // Surface Dark
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(25, 85%, 55%)', // Accent Orange
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(25, 85%, 55%)', // Accent Orange
					light: 'hsl(25, 85%, 65%)', // Accent Light
					foreground: 'hsl(var(--accent-foreground))'
				},
				success: {
					DEFAULT: 'rgb(var(--success))',
					light: 'rgb(var(--success-light))'
				},
				warning: 'rgb(var(--warning))',
				error: 'rgb(var(--error))',
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
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
			// BroYouFree Custom Spacing System
			spacing: {
				'bro-xs': '0.5rem',     // 8px
				'bro-sm': '0.75rem',    // 12px
				'bro-md': '1rem',       // 16px
				'bro-lg': '1.5rem',     // 24px
				'bro-xl': '2rem',       // 32px
				'bro-2xl': '3rem',      // 48px
				'bro-3xl': '4rem',      // 64px
				'bro-4xl': '6rem',      // 96px
				'bro-5xl': '8rem',      // 128px
				// Legacy spacing maintained
				'xs': '8px',
				'sm': '16px',
				'md': '24px',
				'lg': '32px',
				'xl': '40px',
				'2xl': '48px',
				'3xl': '56px',
				'4xl': '64px',
				'18': '4.5rem',
				'88': '22rem',
				'112': '28rem'
			},
			// BroYouFree Border Radius System
			borderRadius: {
				'bro-sm': '8px',    // Small elements, badges
				'bro-md': '12px',   // Cards, inputs
				'bro-lg': '20px',   // Buttons, major cards
				'bro-xl': '28px',   // Hero elements, feature cards
				// Legacy radius maintained
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			// BroYouFree Typography System
			fontFamily: {
				'sohne': ['Inter', 'system-ui', 'sans-serif'],
				'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
			},
			fontSize: {
				// BroYouFree Typography Hierarchy
				'display': ['4.5rem', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.025em' }],
				'display-md': ['3.5rem', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.025em' }],
				'display-sm': ['2.5rem', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.025em' }],
				'headline-lg': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
				'headline-md': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
				'headline-sm': ['1.75rem', { lineHeight: '1.2', fontWeight: '700' }],
				'title-lg': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
				'title-md': ['1.375rem', { lineHeight: '1.3', fontWeight: '600' }],
				'title-sm': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
				'body-large': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
				'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
				'mono': ['0.875rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }],
				// Legacy typography maintained
				'heading-1': ['30px', { lineHeight: '36px', fontWeight: '700' }],
				'heading-2': ['24px', { lineHeight: '32px', fontWeight: '600' }],
				'heading-3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
				'caption': ['12px', { lineHeight: '16px', fontWeight: '500' }]
			},
			boxShadow: {
				'custom-sm': 'var(--shadow-sm)',
				'custom-md': 'var(--shadow-md)',
				'custom-lg': 'var(--shadow-lg)'
			},
			// ... keep existing keyframes and animation
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-in': 'slide-in 0.5s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
