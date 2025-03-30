export function rainbow(numOfSteps = 7, step = 14) {
    var [h, s, l] = randomHsl()
    return hslToHex(h,s,l)
}

//https://stackoverflow.com/questions/1484506/random-color-generator
function randomHsl() {
    return [(Math.random() * 360), 40, 30]
}

//https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
function hslToHex(h:number, s:number, l:number) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n:number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }