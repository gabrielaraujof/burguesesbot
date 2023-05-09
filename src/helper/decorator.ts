import { Mention } from 'nestjs-telegraf';

export function MentionMe<T extends { username: string }>() {
  return function (target: T, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, [
        Mention(target.username ?? ''),
        ...args,
      ]);
    };

    return descriptor;
  };
}
