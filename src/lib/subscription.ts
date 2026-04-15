import { Timestamp } from 'firebase/firestore';

export function isPlanActive(user: any): boolean {
  if (!user || user.subscriptionPlan !== 'pro' || !user.subscriptionDate) {
    return false;
  }

  const subscriptionDate = user.subscriptionDate instanceof Timestamp 
    ? user.subscriptionDate.toDate() 
    : new Date(user.subscriptionDate);
    
  const now = new Date();
  const diffInMs = now.getTime() - subscriptionDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  let durationDays = 0;
  switch (user.activePlanId) {
    case 'trial':
      durationDays = 2;
      break;
    case 'max':
      durationDays = 3;
      break;
    case 'monthly':
      durationDays = 30;
      break;
    case 'half-yearly':
      durationDays = 180;
      break;
    case 'yearly':
      durationDays = 365;
      break;
    default:
      durationDays = 0;
  }

  return diffInDays <= durationDays;
}
