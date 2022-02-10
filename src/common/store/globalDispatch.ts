import { AnyAction, Dispatch } from 'redux';

let GLOBAL_DISPATCH: Dispatch<AnyAction> | undefined = undefined;

/** TODO docstring */
export function registerGlobalDispatch(dispatch: Dispatch<AnyAction>): void {
  GLOBAL_DISPATCH = dispatch;
}

/** TODO docstring */
export function globalDispatch(action: AnyAction): void {
  GLOBAL_DISPATCH!(action);
}
