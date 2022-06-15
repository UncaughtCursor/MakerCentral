export type CloudFunction<Input = void, Output = void> = (arg0: Input) => Promise<{data: Output}>;
