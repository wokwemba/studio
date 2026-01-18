export type Metric = {
  label: string;
  value: string | number;
  subValue: string;
  change?: "increase" | "decrease" | "same";
};
