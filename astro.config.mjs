import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import unocss from '@unocss/astro';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    checkOrigin: false,
  },
  devToolbar: { enabled: false },
  integrations: [react(), unocss()],
});
