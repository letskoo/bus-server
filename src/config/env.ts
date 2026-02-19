export const envFilePath = (() => {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  if (nodeEnv === 'production') {
    return '.env.production';
  }
  return '.env.development';
})();
