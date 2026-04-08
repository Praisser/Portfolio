import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        projects: resolve(__dirname, 'projects.html'),
        education: resolve(__dirname, 'education.html'),
        skills: resolve(__dirname, 'skills.html'),
        certifications: resolve(__dirname, 'certifications.html'),
      },
    },
  },
});
