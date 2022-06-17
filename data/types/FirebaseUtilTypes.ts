export type CloudFunction<Input extends {[key: string]: any} | void = void,
	Output = void> = (arg0: Input) => Promise<{data: Output}>;
