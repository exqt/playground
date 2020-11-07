import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import url from '@rollup/plugin-url';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		resolve({
			browser: true,
			dedupe: ['']
		}),
		commonjs(),
		url({
			// Where to put files
			destDir: 'public/assets/',
			// Path to put infront of files (in code)
			publicPath: process.env.NODE_ENV === "development"
				? 'http://localhost:8000/public/assets/'
				: './assets/',
			// File name once copied
			fileName: '[name][extname]',
			// Kinds of files to process
			include: [
				'**/*.svg',
				'**/*.png',
				'**/*.gif',
				'**/*.jpg',
				'**/*.jpeg',
			]
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}
