import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/rspack';
import path from 'path';

export default defineConfig({
  plugins: [pluginReact()],

  tools: {
    rspack: {
      resolve: {
        modules: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, '../../node_modules'),
          'node_modules',
        ],
        alias: {
          'lucide-react': path.resolve(
            __dirname,
            '../../node_modules/lucide-react/dist/esm/lucide-react.js',
          ),
        },
      },
      plugins: [
        tanstackRouter({
          target: 'react',
          autoCodeSplitting: true,
        }),
      ],
    },
  },

  source: {
    entry: {
      index: './src/main.tsx',
    },
  },

  resolve: {
    alias: {
      '@': './src',
    },
  },

  html: {
    template: './index.html',
  },

  server: {
    port: 5274,
    host: '127.0.0.1',
    strictPort: false,
    htmlFallback: false,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:5002',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },

  output: {
    distPath: {
      root: 'dist',
    },
    sourceMap: {
      js: 'source-map',
      css: true,
    },
    target: 'web',
  },

  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
      override: {
        chunks: 'all',
        cacheGroups: {
          'react-vendor': {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
          },
        },
      },
    },
  },
});
