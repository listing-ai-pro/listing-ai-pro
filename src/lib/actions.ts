export type Action = {
  type: string;
  payload?: any;
  timestamp: number;
};

let lastAction: Action | null = null;
const listeners: ((action: Action) => void)[] = [];

export const trackAction = (type: string, payload?: any) => {
  const action = { type, payload, timestamp: Date.now() };
  lastAction = action;
  listeners.forEach(l => l(action));
};

export const subscribeToActions = (callback: (action: Action) => void) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

export const getLastAction = () => lastAction;
