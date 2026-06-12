function W(i) {
  return Math.abs((i = Math.round(i))) >= 1e21
    ? i.toLocaleString("en").replace(/,/g, "")
    : i.toString(10);
}
function P(i, r) {
  if (!isFinite(i) || i === 0) return null;
  const e = (i = r ? i.toExponential(r - 1) : i.toExponential()).indexOf("e"),
    o = i.slice(0, e);
  return [o.length > 1 ? o[0] + o.slice(2) : o, +i.slice(e + 1)];
}
function M(i) {
  return ((i = P(Math.abs(i))), i ? i[1] : NaN);
}
function _(i, r) {
  return function (e, o) {
    for (
      var a = e.length, s = [], m = 0, h = i[0], b = 0;
      a > 0 &&
      h > 0 &&
      (b + h + 1 > o && (h = Math.max(1, o - b)),
      s.push(e.substring((a -= h), a + h)),
      !((b += h + 1) > o));
    )
      h = i[(m = (m + 1) % i.length)];
    return s.reverse().join(r);
  };
}
function ii(i) {
  return function (r) {
    return r.replace(/[0-9]/g, function (e) {
      return i[+e];
    });
  };
}
const ri = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function j(i) {
  if (!(r = ri.exec(i))) throw new Error("invalid format: " + i);
  let r;
  return new z({
    fill: r[1],
    align: r[2],
    sign: r[3],
    symbol: r[4],
    zero: r[5],
    width: r[6],
    comma: r[7],
    precision: r[8] && r[8].slice(1),
    trim: r[9],
    type: r[10],
  });
}
j.prototype = z.prototype;
function z(i) {
  ((this.fill = i.fill === void 0 ? " " : i.fill + ""),
    (this.align = i.align === void 0 ? ">" : i.align + ""),
    (this.sign = i.sign === void 0 ? "-" : i.sign + ""),
    (this.symbol = i.symbol === void 0 ? "" : i.symbol + ""),
    (this.zero = !!i.zero),
    (this.width = i.width === void 0 ? void 0 : +i.width),
    (this.comma = !!i.comma),
    (this.precision = i.precision === void 0 ? void 0 : +i.precision),
    (this.trim = !!i.trim),
    (this.type = i.type === void 0 ? "" : i.type + ""));
}
z.prototype.toString = function () {
  return (
    this.fill +
    this.align +
    this.sign +
    this.symbol +
    (this.zero ? "0" : "") +
    (this.width === void 0 ? "" : Math.max(1, this.width | 0)) +
    (this.comma ? "," : "") +
    (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) +
    (this.trim ? "~" : "") +
    this.type
  );
};
function ti(i) {
  i: for (var r = i.length, e = 1, o = -1, a; e < r; ++e)
    switch (i[e]) {
      case ".":
        o = a = e;
        break;
      case "0":
        (o === 0 && (o = e), (a = e));
        break;
      default:
        if (!+i[e]) break i;
        o > 0 && (o = 0);
        break;
    }
  return o > 0 ? i.slice(0, o) + i.slice(a + 1) : i;
}
let A;
function oi(i, r) {
  const e = P(i, r);
  if (!e) return ((A = void 0), i.toPrecision(r));
  const o = e[0],
    a = e[1],
    s = a - (A = Math.max(-8, Math.min(8, Math.floor(a / 3))) * 3) + 1,
    m = o.length;
  return s === m
    ? o
    : s > m
      ? o + new Array(s - m + 1).join("0")
      : s > 0
        ? o.slice(0, s) + "." + o.slice(s)
        : "0." + new Array(1 - s).join("0") + P(i, Math.max(0, r + s - 1))[0];
}
function T(i, r) {
  const e = P(i, r);
  if (!e) return i + "";
  const o = e[0],
    a = e[1];
  return a < 0
    ? "0." + new Array(-a).join("0") + o
    : o.length > a + 1
      ? o.slice(0, a + 1) + "." + o.slice(a + 1)
      : o + new Array(a - o.length + 2).join("0");
}
const Y = {
  "%": (i, r) => (i * 100).toFixed(r),
  b: (i) => Math.round(i).toString(2),
  c: (i) => i + "",
  d: W,
  e: (i, r) => i.toExponential(r),
  f: (i, r) => i.toFixed(r),
  g: (i, r) => i.toPrecision(r),
  o: (i) => Math.round(i).toString(8),
  p: (i, r) => T(i * 100, r),
  r: T,
  s: oi,
  X: (i) => Math.round(i).toString(16).toUpperCase(),
  x: (i) => Math.round(i).toString(16),
};
function Z(i) {
  return i;
}
const q = Array.prototype.map,
  H = ["y", "z", "a", "f", "p", "n", "\xB5", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function I(i) {
  const r =
      i.grouping === void 0 || i.thousands === void 0
        ? Z
        : _(q.call(i.grouping, Number), i.thousands + ""),
    e = i.currency === void 0 ? "" : i.currency[0] + "",
    o = i.currency === void 0 ? "" : i.currency[1] + "",
    a = i.decimal === void 0 ? "." : i.decimal + "",
    s = i.numerals === void 0 ? Z : ii(q.call(i.numerals, String)),
    m = i.percent === void 0 ? "%" : i.percent + "",
    h = i.minus === void 0 ? "\u2212" : i.minus + "",
    b = i.nan === void 0 ? "NaN" : i.nan + "";
  function C(n, d) {
    n = j(n);
    let v = n.fill,
      y = n.align,
      l = n.sign,
      w = n.symbol,
      $ = n.zero,
      E = n.width,
      L = n.comma,
      p = n.precision,
      X = n.trim,
      c = n.type;
    (c === "n" ? ((L = !0), (c = "g")) : Y[c] || (p === void 0 && (p = 12), (X = !0), (c = "g")),
      ($ || (v === "0" && y === "=")) && (($ = !0), (v = "0"), (y = "=")));
    const K =
        (d && d.prefix !== void 0 ? d.prefix : "") +
        (w === "$" ? e : w === "#" && /[boxX]/.test(c) ? "0" + c.toLowerCase() : ""),
      Q = (w === "$" ? o : /[%p]/.test(c) ? m : "") + (d && d.suffix !== void 0 ? d.suffix : ""),
      B = Y[c],
      V = /[defgprs%]/.test(c);
    p =
      p === void 0
        ? 6
        : /[gprs]/.test(c)
          ? Math.max(1, Math.min(21, p))
          : Math.max(0, Math.min(20, p));
    function D(t) {
      let g = K,
        u = Q,
        x,
        G,
        S;
      if (c === "c") ((u = B(t) + u), (t = ""));
      else {
        t = +t;
        let k = t < 0 || 1 / t < 0;
        if (
          ((t = isNaN(t) ? b : B(Math.abs(t), p)),
          X && (t = ti(t)),
          k && +t == 0 && l !== "+" && (k = !1),
          (g = (k ? (l === "(" ? l : h) : l === "-" || l === "(" ? "" : l) + g),
          (u =
            (c === "s" && !isNaN(t) && A !== void 0 ? H[8 + A / 3] : "") +
            u +
            (k && l === "(" ? ")" : "")),
          V)
        ) {
          for (x = -1, G = t.length; ++x < G; )
            if (((S = t.charCodeAt(x)), 48 > S || S > 57)) {
              ((u = (S === 46 ? a + t.slice(x + 1) : t.slice(x)) + u), (t = t.slice(0, x)));
              break;
            }
        }
      }
      L && !$ && (t = r(t, 1 / 0));
      let N = g.length + t.length + u.length,
        f = N < E ? new Array(E - N + 1).join(v) : "";
      switch ((L && $ && ((t = r(f + t, f.length ? E - u.length : 1 / 0)), (f = "")), y)) {
        case "<":
          t = g + t + u + f;
          break;
        case "=":
          t = g + f + t + u;
          break;
        case "^":
          t = f.slice(0, (N = f.length >> 1)) + g + t + u + f.slice(N);
          break;
        default:
          t = f + g + t + u;
          break;
      }
      return s(t);
    }
    return (
      (D.toString = function () {
        return n + "";
      }),
      D
    );
  }
  function J(n, d) {
    const v = Math.max(-8, Math.min(8, Math.floor(M(d) / 3))) * 3,
      y = Math.pow(10, -v),
      l = C(((n = j(n)), (n.type = "f"), n), { suffix: H[8 + v / 3] });
    return function (w) {
      return l(y * w);
    };
  }
  return { format: C, formatPrefix: J };
}
let F, O, R;
U({ thousands: ",", grouping: [3], currency: ["$", ""] });
function U(i) {
  return ((F = I(i)), (O = F.format), (R = F.formatPrefix), F);
}
function ei(i) {
  return Math.max(0, -M(Math.abs(i)));
}
function ai(i, r) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(M(r) / 3))) * 3 - M(Math.abs(i)));
}
function ni(i, r) {
  return ((i = Math.abs(i)), (r = Math.abs(r) - i), Math.max(0, M(r) - M(i)) + 1);
}
export {
  z as FormatSpecifier,
  O as format,
  U as formatDefaultLocale,
  I as formatLocale,
  R as formatPrefix,
  j as formatSpecifier,
  ei as precisionFixed,
  ai as precisionPrefix,
  ni as precisionRound,
};
