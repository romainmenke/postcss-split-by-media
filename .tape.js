module.exports = {
	'breakpoint': {
		message: 'supports splitting by breakpoint',
		source: 'breakpoint.css',
		expect: 'breakpoint.expect.css',
		result: 'breakpoint.result.css',
		options: {
			onManifest: (manifest) => {
				console.log(manifest);
			}
		}
	},
	'supports': {
		message: 'supports splitting by breakpoint inside a supports',
		source: 'supports.css',
		expect: 'supports.expect.css',
		result: 'supports.result.css',
	},
	'container': {
		message: 'supports splitting by breakpoint inside a container',
		source: 'container.css',
		expect: 'container.expect.css',
		result: 'container.result.css',
	},
	'reduced-motion': {
		message: 'supports splitting by reduced-motion',
		source: 'reduced-motion.css',
		expect: 'reduced-motion.expect.css',
		result: 'reduced-motion.result.css',
	},
	'multiple': {
		message: 'supports splitting by multiple @media queries',
		source: 'multiple.css',
		expect: 'multiple.expect.css',
		result: 'multiple.result.css',
	},
	'multiple': {
		message: 'supports splitting by multiple @media queries',
		source: 'multiple.css',
		expect: 'multiple.expect.css',
		result: 'multiple.result.css',
		processOptions: {
			map: {
				inline: true
			}
		}
	},
	'multiple:map': {
		message: 'supports splitting by multiple @media queries with external source maps',
		source: 'multiple-map.css',
		expect: 'multiple-map.expect.css',
		result: 'multiple-map.result.css',
		processOptions: {
			map: {
				inline: false
			}
		}
	}
};
