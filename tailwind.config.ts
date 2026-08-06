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
				sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				surface: {
					1: 'hsl(var(--surface-1))',
					2: 'hsl(var(--surface-2))',
					3: 'hsl(var(--surface-3))'
				},
				teal: {
					DEFAULT: 'hsl(var(--teal))',
					foreground: 'hsl(var(--teal-foreground))'
				},
				block: {
					violet: 'hsl(var(--block-violet))',
					'violet-foreground': 'hsl(var(--block-violet-fg))',
					lime: 'hsl(var(--block-lime))',
					'lime-foreground': 'hsl(var(--block-lime-fg))',
					peach: 'hsl(var(--block-peach))',
					'peach-foreground': 'hsl(var(--block-peach-fg))',
					blue: 'hsl(var(--block-blue))',
					'blue-foreground': 'hsl(var(--block-blue-fg))',
					coral: 'hsl(var(--block-coral))',
					'coral-foreground': 'hsl(var(--block-coral-fg))',
					teal: 'hsl(var(--block-teal))',
					'teal-foreground': 'hsl(var(--block-teal-fg))',
					ink: 'hsl(var(--block-ink))',
					'ink-foreground': 'hsl(var(--block-ink-fg))'
				},
				accent2: {
					pink: 'hsl(var(--accent-pink))',
					green: 'hsl(var(--accent-green))',
					orange: 'hsl(var(--accent-orange))',
					blue: 'hsl(var(--accent-blue))',
					violet: 'hsl(var(--accent-violet))'
				},
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': 'calc(var(--radius) + 8px)',
				'3xl': 'calc(var(--radius) + 16px)'
			},
			boxShadow: {
				'elev-1': 'var(--elev-1)',
				'elev-2': 'var(--elev-2)',
				'glow-primary': 'var(--glow-primary)',
				soft: 'var(--shadow-soft)',
				lift: 'var(--shadow-lift)'
			},
			keyframes: {
				'fade-up': {
					from: { opacity: '0', transform: 'translateY(8px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'pop-in': {
					from: { opacity: '0', transform: 'scale(0.96)' },
					to: { opacity: '1', transform: 'scale(1)' }
				},
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
				}
			},
			animation: {
				'fade-up': 'fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
				'pop-in': 'pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
