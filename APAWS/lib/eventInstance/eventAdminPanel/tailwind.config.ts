import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				'primary': '#50B2D7',
				'segmentbg': 'rgba(25, 30, 36, 0.7)',
			}
		},
	},

	plugins: [require('@tailwindcss/typography'),
		
		require('daisyui'),
	]
} as Config;
