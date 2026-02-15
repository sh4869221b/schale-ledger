declare global {
  namespace App {
    interface Platform {
      env?: {
        APP_ENV?: string;
        HYPERDRIVE?: {
          connectionString: string;
        };
      };
    }
  }
}

export {};
