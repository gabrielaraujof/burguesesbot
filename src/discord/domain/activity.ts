import { Activity, ActivityType } from 'discord.js';

export const isPlaying = (activity: Activity) =>
  activity.type === ActivityType.Playing;
