const path = require( 'path' );
const fsp = require( 'fs' ).promises;
const createSort = require('./sort-media-queries');

const creator = (pluginOpts) => {
	sorter = createSort();
	return {
		postcssPlugin: 'split-by-media',
		prepare: function prepare(_result) {
			const manifestCallback = pluginOpts?.onManifest || false;
			const resultOpts = _result.opts;
			const manifest = {};
			const queries = new Map();

			return {
				AtRule: {
					media: ( mediaAtRule, {
						result,
					} ) => {
						if ( 0 === mediaAtRule.nodes.length ) {
							return;
						}

						let splitResult;
						if ( queries.has( mediaAtRule.params ) ) {
							splitResult = queries.get( mediaAtRule.params );
						} else {
							const splitRoot = result.root.clone();
							splitRoot.removeAll();
							splitResult = {
								root: splitRoot,
								opts: {
									from: result.opts.from,
									to: generatePathForTo( result.opts.to, mediaAtRule.params ),
								},
							};

							queries.set( mediaAtRule.params, splitResult );
						}

						let clone = mediaAtRule.clone();

						if ( mediaAtRule.parent && mediaAtRule.parent !== result.root ) {
							let rule = mediaAtRule.parent;
							while ( true ) {
								const parentClone = rule.clone();
								parentClone.removeAll();
								parentClone.append( clone );
								clone = parentClone;

								if ( !rule.parent || rule.parent === result.root ) {
									break;
								}

								rule = rule.parent;
							}
						}

						splitResult.root.append( clone );
						mediaAtRule.remove();
					},
				},
				OnceExit: async() => {
					const fsWrites = [];
					for ( const [
						media,
						result,
					] of queries.entries() ) {
						manifest[media] = {
							base: path.parse( result.opts.to ).base,
							media: media,
						};

						fsWrites.push((async () => {
							const splitResult = result.root.toResult({
								...resultOpts,
								to: result.opts.to,
							});
							await fsp.writeFile(result.opts.to, splitResult.css);

							if (splitResult.map && !splitResult?.opts?.map?.inline) {
								await fsp.writeFile(result.opts.to + '.map', splitResult.map.toString());
							}
						} )() );
					}

					const sortedManifest = [
						{
							base: path.parse( resultOpts.to ).base,
							media: '',
						}
					];
					const manifestKeys = Object.keys(manifest);
					manifestKeys.sort(sorter);

					manifestKeys.forEach((key) => {
						sortedManifest.push(manifest[key]);
					});

					if (manifestCallback) {
						manifestCallback(sortedManifest);
					} else {
						fsWrites.push((async () => {
							const pathInfo = path.parse(resultOpts.to);
							pathInfo.base = `manifest-${path.parse(resultOpts.from).name}.json`;

							await fsp.writeFile(path.format(pathInfo), JSON.stringify(sortedManifest));
						})());
					}

					await Promise.all( fsWrites );
				},
			};
		},
	};
};

creator.postcss = true;

module.exports = creator;

function generatePathForTo( to, params ) {
	const info = path.parse( to );
	const slug = convertToSlug( params );
	if ( -1 < info.name.indexOf( slug ) ) {
		return to;
	}

	delete info.base;
	info.name = `${info.name}.${slug}`;

	return path.format( info );
}

function convertToSlug( params ) {
	return 'at-media-' + params
		.toLowerCase()
		.replace( /[^\w ]+/g, '-' )
		.replace( / +/g, '-' )
		.replace( /-+/g, '-' )
		.replace( /^-/g, '' )
		.replace( /-$/g, '' );
}
