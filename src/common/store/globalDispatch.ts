import { AnyAction, Dispatch } from 'redux';

let GLOBAL_DISPATCH: Dispatch<AnyAction> | undefined = undefined;

/**
 * Saves a Redux store's dispatch method to a global variable so that it can
 * be called from outside of the normal order of things, such as within a reducer
 * (i.e. in response to an parser API request to support card rewrite effects).
 * This is definitely a *major* Redux anti-pattern but unavoidable in this case.
 */
export function registerGlobalDispatch(dispatch: Dispatch<AnyAction>): void {
  GLOBAL_DISPATCH = dispatch;
}

/** Calls the globally saved dispatch method, assuming it has been registered. */
export function globalDispatch(action: AnyAction): void {
  GLOBAL_DISPATCH!(action);
}
