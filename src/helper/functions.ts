export function isProduction(env: string) {
  const environment = env.toLowerCase();
  return environment === 'production' || environment === 'prod';
}
