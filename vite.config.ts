
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from 'lovable-tagger';
import { LINKED_SUPABASE_ANON_KEY, LINKED_SUPABASE_URL } from './src/integrations/supabase/env';
import { seoPrerender } from './vite-plugins/seo-prerender';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const supabaseUrl = env.VITE_SUPABASE_URL || LINKED_SUPABASE_URL;
  const supabaseAnonKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || LINKED_SUPABASE_ANON_KEY;

  return {
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      {
        name: 'supabase-preconnect',
        transformIndexHtml(html: string) {
          return html.replaceAll('https://zpddlphtoeluytrejioj.supabase.co', supabaseUrl);
        },
      },
      seoPrerender({ supabaseUrl, supabaseAnonKey }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // Optimizations for production build
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false, // Keep console.logs for now for debugging
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react'],
            'supabase-vendor': ['@supabase/supabase-js'],
            // Note: a 'utils-lib' entry used to live here pointing at
            // '/src/utils/cache.ts'. Rollup never matched that id, so it only
            // ever produced an empty 0 kB chunk and a build warning. Removed.
          },
        },
      },
      // Reduce chunk size warnings
      chunkSizeWarningLimit: 1000,
    },
    server: {
      host: '::',
      port: 8080,
      open: true,
    },
  };
});
