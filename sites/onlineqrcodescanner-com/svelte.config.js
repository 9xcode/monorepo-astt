// Re-export svelte config from @mtools/core so all sites use identical settings.
// If this site needs svelte plugin overrides, add them here.
import { vitePreprocess } from '@astrojs/svelte';

export default {
	preprocess: vitePreprocess(),
};
