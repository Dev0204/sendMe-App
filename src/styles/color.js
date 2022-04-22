export class Color {
    static rgba(r, g, b, a) {
      return { r: r / 255, g: g / 255, b: b / 255, a }
    }
    static rgb(r, g, b) {
      return this.rgba(r, g, b, 1);
    }
    static hex(hex) {
      hex = hex.replace(/^#/, '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      var num = parseInt(hex, 16);
      return this.rgba(num >> 16, num >> 8 & 255, num & 255, 1);
    }
  }