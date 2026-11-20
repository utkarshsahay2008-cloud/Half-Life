/**
 * Polyfills for ECMAScript 2024 ArrayBuffer features on Node.js runtimes (e.g. Node 20.x on Intel Mac)
 * Fixes React 19 / RSC and undici stream buffer detached checks.
 */

if (typeof ArrayBuffer !== "undefined") {
  if (!Object.prototype.hasOwnProperty.call(ArrayBuffer.prototype, "detached")) {
    Object.defineProperty(ArrayBuffer.prototype, "detached", {
      get(this: ArrayBuffer) {
        try {
          new Uint8Array(this);
          return false;
        } catch {
          return true;
        }
      },
      configurable: true,
      enumerable: false,
    });
  }

  if (!Object.prototype.hasOwnProperty.call(ArrayBuffer.prototype, "transfer")) {
    Object.defineProperty(ArrayBuffer.prototype, "transfer", {
      value: function (this: ArrayBuffer, newByteLength?: number) {
        if ((this as any).detached) {
          throw new TypeError("Cannot perform ArrayBuffer.prototype.transfer on a detached ArrayBuffer");
        }
        const len = newByteLength !== undefined ? newByteLength : this.byteLength;
        const newBuf = new ArrayBuffer(len);
        const toCopy = Math.min(this.byteLength, len);
        new Uint8Array(newBuf).set(new Uint8Array(this, 0, toCopy));
        try {
          structuredClone(this, { transfer: [this] });
        } catch {
          // Fallback if transfer array not supported
        }
        return newBuf;
      },
      configurable: true,
      writable: true,
    });
  }
}

export {};
