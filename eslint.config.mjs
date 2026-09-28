import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const configs = [nextCoreWebVitals, nextTypescript].flatMap((config) =>
  Array.isArray(config) ? config : config.default,
);

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  },
  ...configs,
];

export default eslintConfig;
