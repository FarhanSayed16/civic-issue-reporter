// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern & Vibrant Color Palette
        transparentBtn1: '#F1F5F9', // Refined light slate
        transparentBtn2: '#E2E8F0', // Elegant medium slate
        
        mainBg: '#FAFBFC', // Pure, clean background
        
        primary: {
          DEFAULT: '#3B82F6', // Modern vibrant blue
          light: '#60A5FA',   // Lighter blue
          dark: '#1E40AF',    // Deep blue
          foreground: '#FFFFFF' // Pure white text
        },
        
        secondary: {
          DEFAULT: '#8B5CF6', // Rich purple
          light: '#A78BFA',   // Soft purple
          dark: '#7C3AED',    // Deep purple
          foreground: '#FFFFFF' // Pure white text
        },
        
        accent: {
          DEFAULT: '#F59E0B', // Warm amber
          light: '#FCD34D',   // Golden yellow
          dark: '#D97706',    // Deep orange
          foreground: '#1F2937' // Dark gray text
        },
        
        success: {
          DEFAULT: '#10B981', // Fresh emerald green
          light: '#34D399',   // Light green
          dark: '#059669',    // Deep green
          foreground: '#FFFFFF'
        },
        
        warning: {
          DEFAULT: '#F97316', // Vibrant orange
          light: '#FB923C',   // Light orange
          dark: '#EA580C',    // Deep orange
          foreground: '#FFFFFF'
        },
        
        error: {
          DEFAULT: '#EF4444', // Modern red
          light: '#F87171',   // Light red
          dark: '#DC2626',    // Deep red
          foreground: '#FFFFFF'
        },
        
        neutral: {
          50: '#F9FAFB',      // Ultra light
          100: '#F3F4F6',     // Very light gray
          200: '#E5E7EB',     // Light gray
          300: '#D1D5DB',     // Medium light gray
          400: '#9CA3AF',     // Medium gray
          500: '#6B7280',     // Default gray
          600: '#4B5563',     // Medium dark gray
          700: '#374151',     // Dark gray
          800: '#1F2937',     // Very dark gray
          900: '#111827',     // Ultra dark gray
          DEFAULT: '#E5E7EB', // Light gray for borders
          dark: '#4B5563'     // Dark gray for text
        },
        
        // Gradient colors for more dynamic designs
        gradient: {
          primary: {
            from: '#667EEA',   // Soft blue
            to: '#764BA2'      // Purple blend
          },
          secondary: {
            from: '#FF6B6B',   // Coral
            to: '#4ECDC4'      // Turquoise
          },
          accent: {
            from: '#FFD93D',   // Bright yellow
            to: '#FF6B6B'      // Coral red
          },
          success: {
            from: '#11998E',   // Teal
            to: '#38EF7D'      // Mint green
          }
        },
        
        // Keeping your shadcn-ui colors and other custom definitions
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
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
      fontFamily: {
        sans: [
          'Inter',
          'sans-serif'
        ],
        display: [
          'Poppins',
          'sans-serif'
        ]
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      // Added some beautiful box shadows
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.06)',
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-secondary': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-accent': '0 0 20px rgba(245, 158, 11, 0.3)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};