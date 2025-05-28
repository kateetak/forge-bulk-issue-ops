
export const debounce = (func: Function, wait: number, immediate: boolean) => {
  let lastTimeout: any;
  const context = this;
  return function () {
    const args = arguments;
    const later = () => {
      lastTimeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !lastTimeout;
    clearTimeout(lastTimeout);
    lastTimeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
};

export const uuid4 = () => {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

export const uuid = () => {
  return uuid4() + uuid4() + '-' + uuid4() + '-' + uuid4() + '-' + uuid4() + '-' + uuid4() + uuid4() + uuid4();
};

export const base64FromBase64Url = (base64Url: string) => {
  return (base64Url + '==='.slice((base64Url.length + 3) % 4)).replace(/-/g, '+').replace(/_/g, '/');
};

export const bufferFromBase64Url = (base64Url: string) => {
  return Buffer.from(base64FromBase64Url(base64Url), 'base64');
};

export const base64Url = (data: Uint8Array) => {
  return Buffer.from(data).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};
