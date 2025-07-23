// global.d.ts
import type { Abi } from 'abitype';

declare module '*.abi.json' {
  const value: Abi;
  export default value;
}
