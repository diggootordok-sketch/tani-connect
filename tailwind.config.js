/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				display: ['"Fraunces"', 'serif'],
				sans: ['"Inter"', 'sans-serif']
			},
			colors: {
				// Palet "panen senja": terracotta hangat + krem, berbeda dari hijau korporat.
				cream: {
					50: '#fffaf3',
					100: '#fbf1e2'
				},
				clay: {
					400: '#d98c5f',
					500: '#c06b3c',
					600: '#a8552c',
					700: '#8a4323',
					900: '#432113'
				},
				moss: {
					500: '#6f8f4f',
					600: '#56703c'
				}
			},
			boxShadow: {
				soft: '0 10px 30px -12px rgba(67, 33, 19, 0.18)'
			}
		}
	},
	plugins: []
};
