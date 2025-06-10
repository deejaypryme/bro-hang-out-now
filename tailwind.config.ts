
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'rgb(var(--primary))',
					hover: 'rgb(var(--primary-hover))',
					light: 'rgb(var(--primary-light))',
					dark: 'rgb(var(--primary-dark))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'rgb(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: 'rgb(var(--accent))',
					light: 'rgb(var(--accent-light))',
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
				'text-primary': 'rgb(var(--text-primary))',
				'text-secondary': 'rgb(var(--text-secondary))',
				'text-muted': 'rgb(var(--text-muted))',
				'text-light': 'rgb(var(--text-light))',
				'bg-primary': 'rgb(var(--bg-primary))',
				'bg-secondary': 'rgb(var(--bg-secondary))',
				'bg-tertiary': 'rgb(var(--bg-tertiary))',
				'bg-accent': 'rgb(var(--bg-accent))',
				'border-default': 'rgb(var(--border))',
				'border-light': 'rgb(var(--border-light))',
				'border-focus': 'rgb(var(--border-focus))',
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'xs': '8px',    // 2 in Tailwind scale
				'sm': '16px',   // 4 in Tailwind scale
				'md': '24px',   // 6 in Tailwind scale
				'lg': '32px',   // 8 in Tailwind scale
				'xl': '40px',   // 10 in Tailwind scale
				'2xl': '48px',  // 12 in Tailwind scale
				'3xl': '56px',  // 14 in Tailwind scale
				'4xl': '64px',  // 16 in Tailwind scale
				'18': '4.5rem',
				'88': '22rem',
				'112': '28rem'
			},
			fontSize: {
				'heading-1': ['30px', { lineHeight: '36px', fontWeight: '700' }],
				'heading-2': ['24px', { lineHeight: '32px', fontWeight: '600' }],
				'heading-3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
				'body-large': ['16px', { lineHeight: '24px', fontWeight: '500' }],
				'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
				'caption': ['12px', { lineHeight: '16px', fontWeight: '500' }]
			},
			boxShadow: {
				'custom-sm': 'var(--shadow-sm)',
				'custom-md': 'var(--shadow-md)',
				'custom-lg': 'var(--shadow-lg)'
			},
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-up': 'slide-up 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
