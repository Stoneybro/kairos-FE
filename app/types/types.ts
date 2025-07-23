// types/deployment.ts
export type DeploymentState = {
  accountStep: "idle" | "creating" | "created" | "error";
  accountError?: string;
};
export enum PenaltyType {
  DELAY_PAYMENT = "DELAY_PAYMENT",
  SEND_BUDDY = "SEND_BUDDY",
  UNDEFINED = "UNDEFINED",
}
export type activeTabType =
  | "home"
  | "activity"
  | "settings"
  | "receive"
  | "deposit"
  | "send";
export type TaskType = {
  id: bigint;
  description: string;
  rewardAmount: bigint;
  deadline: bigint;
  valid: boolean;
  status: number;
  choice: number;
  delayDuration: bigint;
  buddyAddress?: `0x${string}` |undefined;
  delayedRewardReleased: boolean;
};
export enum TaskStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  CANCELED = 2,
  EXPIRED = 3,
}