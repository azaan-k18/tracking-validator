export type EnvironmentKey = "prod" | "preprod" | "prelaunch" | "develop";

export const ENVIRONMENT_OPTIONS: EnvironmentKey[] = ["prod", "preprod", "prelaunch", "develop"];

export const DEFAULT_ENVIRONMENT: EnvironmentKey = "prod";
