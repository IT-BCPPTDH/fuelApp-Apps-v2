// debounce.ts
export const debounce = <T>(func: (...args: any[]) => T, delay: number) => {
    let timeoutId: NodeJS.Timeout;
  
    return (...args: any[]) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };
  