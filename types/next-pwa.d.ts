// Declaración de tipos para next-pwa
declare module 'next-pwa' {
  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: RegExp[];
    sw?: string;
    runtimeCaching?: any[];
  }

  function withPWA(config: PWAConfig): (nextConfig: any) => any;
  export = withPWA;
}