// problems.js — C pointer problem generator
// Each generator returns { code, answer, difficulty, concepts, trace }
// trace: array of { line, cells } — one element per meaningful executed line
// answer: exact string printf would emit (trailing newline stripped)

const _VARS = ['a','b','c','d','e','f','g','h','k','m','n','s','t','u','v','w','x','y','z'];
const _ARRS = ['arr','buf','nums','vals','data'];

function _pick(a)      { return a[Math.floor(Math.random() * a.length)]; }
function _rInt(lo, hi) { return Math.floor(Math.random() * (hi - lo + 1)) + lo; }

function _vars(n) {
  const pool = [..._VARS];
  const out  = [];
  while (out.length < n) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

// Cell constructors
function _int(id, label, value)    { return { id, label, type: 'int',      value    }; }
function _ptr(id, label, pointsTo) { return { id, label, type: 'ptr',      pointsTo }; }
function _arr(id, label, items)    { return { id, label, type: 'array',    items: [...items] }; }

// ── Level 1: Single Pointer Basics ──────────────────────────────────────────

// Gen 1 — Basic pointer read
function gen1() {
  const [vx] = _vars(1);
  const val  = _rInt(1, 99);
  const code =
`#include <stdio.h>

int main() {
    int ${vx} = ${val};
    int *p = &${vx};

    printf("%d %d\\n", ${vx}, *p);

    return 0;
}`;
  const trace = [
    { line: `int ${vx} = ${val};`,
      cells: [_int(vx, vx, val)] },
    { line: `int *p = &${vx};`,
      cells: [_int(vx, vx, val), _ptr('p', 'p', vx)] },
    { line: `printf("%d %d\\n", ${vx}, *p);`,
      cells: [_int(vx, vx, val), _ptr('p', 'p', vx)] }
  ];
  return { code, answer: `${val} ${val}`, difficulty: 'Easy', concepts: 'pointers, dereferencing', trace };
}

// Gen 2 — Mutation through a pointer
function gen2() {
  const [vx] = _vars(1);
  const v1 = _rInt(1, 99);
  const v2 = _rInt(1, 99);
  const code =
`#include <stdio.h>

int main() {
    int ${vx} = ${v1};
    int *p = &${vx};

    *p = ${v2};

    printf("%d\\n", ${vx});

    return 0;
}`;
  const trace = [
    { line: `int ${vx} = ${v1};`,
      cells: [_int(vx, vx, v1)] },
    { line: `int *p = &${vx};`,
      cells: [_int(vx, vx, v1), _ptr('p', 'p', vx)] },
    { line: `*p = ${v2};`,
      cells: [_int(vx, vx, v2), _ptr('p', 'p', vx)] },
    { line: `printf("%d\\n", ${vx});`,
      cells: [_int(vx, vx, v2), _ptr('p', 'p', vx)] }
  ];
  return { code, answer: `${v2}`, difficulty: 'Easy', concepts: 'mutation through a pointer', trace };
}

// Gen 3 — Pointer arithmetic on array
function gen3() {
  const size   = 4;
  const idx    = _rInt(0, size - 1);
  const vals   = Array.from({ length: size }, () => _rInt(1, 10) * 2);
  const newVal = _rInt(11, 50);
  const result = [...vals];
  result[idx]  = newVal;
  const aName  = _pick(_ARRS);
  const code =
`#include <stdio.h>

int main() {
    int ${aName}[${size}] = {${vals.join(', ')}};
    int *p = ${aName};

    *(p + ${idx}) = ${newVal};

    printf("%d %d %d %d\\n",
           ${aName}[0], ${aName}[1], ${aName}[2], ${aName}[3]);

    return 0;
}`;
  const trace = [
    { line: `int ${aName}[4] = {${vals.join(', ')}};`,
      cells: [_arr('arr', aName, vals)] },
    { line: `int *p = ${aName};`,
      cells: [_arr('arr', aName, vals), _ptr('p', 'p', 'arr')] },
    { line: `*(p + ${idx}) = ${newVal};`,
      cells: [_arr('arr', aName, result), _ptr('p', 'p', 'arr')] },
    { line: `printf("%d %d %d %d\\n", ${aName}[0..3]);`,
      cells: [_arr('arr', aName, result), _ptr('p', 'p', 'arr')] }
  ];
  return { code, answer: result.join(' '), difficulty: 'Easy', concepts: 'arrays, pointer arithmetic', trace };
}

// ── Level 2: Double Pointers ─────────────────────────────────────────────────

// Gen 4 — Double pointer indirect assignment
function gen4() {
  const [vx] = _vars(1);
  const v1 = _rInt(1, 99);
  const v2 = _rInt(1, 99);
  const code =
`#include <stdio.h>

int main() {
    int ${vx} = ${v1};

    int *p = &${vx};
    int **q = &p;

    **q = ${v2};

    printf("%d %d\\n", ${vx}, *p);

    return 0;
}`;
  const trace = [
    { line: `int ${vx} = ${v1};`,
      cells: [_int(vx, vx, v1)] },
    { line: `int *p = &${vx};`,
      cells: [_int(vx, vx, v1), _ptr('p', 'p', vx)] },
    { line: `int **q = &p;`,
      cells: [_int(vx, vx, v1), _ptr('p', 'p', vx), _ptr('q', 'q', 'p')] },
    { line: `**q = ${v2};`,
      cells: [_int(vx, vx, v2), _ptr('p', 'p', vx), _ptr('q', 'q', 'p')] },
    { line: `printf("%d %d\\n", ${vx}, *p);`,
      cells: [_int(vx, vx, v2), _ptr('p', 'p', vx), _ptr('q', 'q', 'p')] }
  ];
  return { code, answer: `${v2} ${v2}`, difficulty: 'Medium', concepts: 'double pointers, indirect mutation', trace };
}

// Gen 5 — Pointer redirection via double pointer
function gen5() {
  const [va, vb] = _vars(2);
  const a  = _rInt(1, 99);
  const b  = _rInt(1, 99);
  const vc = _rInt(1, 99);
  // *q = &vb  →  p now points to vb
  // **q = vc  →  vb = vc  ;  va unchanged
  const code =
`#include <stdio.h>

int main() {
    int ${va} = ${a};
    int ${vb} = ${b};

    int *p = &${va};
    int **q = &p;

    *q = &${vb};
    **q = ${vc};

    printf("%d %d\\n", ${va}, ${vb});

    return 0;
}`;
  const trace = [
    { line: `int ${va} = ${a};`,
      cells: [_int(va, va, a)] },
    { line: `int ${vb} = ${b};`,
      cells: [_int(va, va, a), _int(vb, vb, b)] },
    { line: `int *p = &${va};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _ptr('p', 'p', va)] },
    { line: `int **q = &p;`,
      cells: [_int(va, va, a), _int(vb, vb, b), _ptr('p', 'p', va), _ptr('q', 'q', 'p')] },
    { line: `*q = &${vb};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _ptr('p', 'p', vb), _ptr('q', 'q', 'p')] },
    { line: `**q = ${vc};`,
      cells: [_int(va, va, a), _int(vb, vb, vc), _ptr('p', 'p', vb), _ptr('q', 'q', 'p')] },
    { line: `printf("%d %d\\n", ${va}, ${vb});`,
      cells: [_int(va, va, a), _int(vb, vb, vc), _ptr('p', 'p', vb), _ptr('q', 'q', 'p')] }
  ];
  return { code, answer: `${a} ${vc}`, difficulty: 'Medium', concepts: 'pointer reassignment, double pointers', trace };
}

// Gen 6 — Pointer swap via function
function gen6() {
  const [va, vb] = _vars(2);
  const a  = _rInt(1, 50);
  const b  = _rInt(1, 50);
  const vc = _rInt(51, 99);
  const vd = _rInt(51, 99);
  // swap(&p1,&p2): p1 → &vb, p2 → &va
  // *p1 = vc  →  vb = vc
  // *p2 = vd  →  va = vd
  const code =
`#include <stdio.h>

void swap(int **x, int **y) {
    int *temp = *x;
    *x = *y;
    *y = temp;
}

int main() {
    int ${va} = ${a};
    int ${vb} = ${b};

    int *p1 = &${va};
    int *p2 = &${vb};

    swap(&p1, &p2);

    *p1 = ${vc};
    *p2 = ${vd};

    printf("%d %d\\n", ${va}, ${vb});

    return 0;
}`;
  const trace = [
    { line: `int ${va} = ${a};`,
      cells: [_int(va, va, a)] },
    { line: `int ${vb} = ${b};`,
      cells: [_int(va, va, a), _int(vb, vb, b)] },
    { line: `int *p1 = &${va};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _ptr('p1', 'p1', va)] },
    { line: `int *p2 = &${vb};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _ptr('p1', 'p1', va), _ptr('p2', 'p2', vb)] },
    { line: `swap(&p1, &p2);`,
      cells: [_int(va, va, a), _int(vb, vb, b), _ptr('p1', 'p1', vb), _ptr('p2', 'p2', va)] },
    { line: `*p1 = ${vc};`,
      cells: [_int(va, va, a), _int(vb, vb, vc), _ptr('p1', 'p1', vb), _ptr('p2', 'p2', va)] },
    { line: `*p2 = ${vd};`,
      cells: [_int(va, va, vd), _int(vb, vb, vc), _ptr('p1', 'p1', vb), _ptr('p2', 'p2', va)] },
    { line: `printf("%d %d\\n", ${va}, ${vb});`,
      cells: [_int(va, va, vd), _int(vb, vb, vc), _ptr('p1', 'p1', vb), _ptr('p2', 'p2', va)] }
  ];
  return { code, answer: `${vd} ${vc}`, difficulty: 'Medium', concepts: 'functions, pointer-to-pointer parameters', trace };
}

// ── Level 3: Triple Pointers ─────────────────────────────────────────────────

// Gen 7 — Triple pointer mutation
function gen7() {
  const [vx] = _vars(1);
  const v1 = _rInt(1, 50);
  const v2 = _rInt(51, 99);
  const code =
`#include <stdio.h>

int main() {
    int ${vx} = ${v1};

    int *p = &${vx};
    int **q = &p;
    int ***r = &q;

    ***r = ${v2};

    printf("%d %d %d\\n", ${vx}, *p, **q);

    return 0;
}`;
  const trace = [
    { line: `int ${vx} = ${v1};`,
      cells: [_int(vx, vx, v1)] },
    { line: `int *p = &${vx};`,
      cells: [_int(vx, vx, v1), _ptr('p', 'p', vx)] },
    { line: `int **q = &p;`,
      cells: [_int(vx, vx, v1), _ptr('p', 'p', vx), _ptr('q', 'q', 'p')] },
    { line: `int ***r = &q;`,
      cells: [_int(vx, vx, v1), _ptr('p', 'p', vx), _ptr('q', 'q', 'p'), _ptr('r', 'r', 'q')] },
    { line: `***r = ${v2};`,
      cells: [_int(vx, vx, v2), _ptr('p', 'p', vx), _ptr('q', 'q', 'p'), _ptr('r', 'r', 'q')] },
    { line: `printf("%d %d %d\\n", ${vx}, *p, **q);`,
      cells: [_int(vx, vx, v2), _ptr('p', 'p', vx), _ptr('q', 'q', 'p'), _ptr('r', 'r', 'q')] }
  ];
  return { code, answer: `${v2} ${v2} ${v2}`, difficulty: 'Hard', concepts: 'triple pointers, multiple dereferencing', trace };
}

// Gen 8 — Triple pointer redirection
function gen8() {
  const [va, vb] = _vars(2);
  const a  = _rInt(1, 50);
  const b  = _rInt(1, 50);
  const vc = _rInt(51, 99);
  // **r = &vb  →  *pp = &vb  →  p = &vb
  // ***r = vc  →  *p = vc    →  vb = vc  ;  va unchanged
  const code =
`#include <stdio.h>

int main() {
    int ${va} = ${a};
    int ${vb} = ${b};

    int *p = &${va};
    int **pp = &p;
    int ***r = &pp;

    **r = &${vb};
    ***r = ${vc};

    printf("%d %d\\n", ${va}, ${vb});

    return 0;
}`;
  const trace = [
    { line: `int ${va} = ${a};`,
      cells: [_int(va, va, a)] },
    { line: `int ${vb} = ${b};`,
      cells: [_int(va, va, a), _int(vb, vb, b)] },
    { line: `int *p = &${va};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _ptr('p', 'p', va)] },
    { line: `int **pp = &p;`,
      cells: [_int(va, va, a), _int(vb, vb, b), _ptr('p', 'p', va), _ptr('pp', 'pp', 'p')] },
    { line: `int ***r = &pp;`,
      cells: [_int(va, va, a), _int(vb, vb, b), _ptr('p', 'p', va), _ptr('pp', 'pp', 'p'), _ptr('r', 'r', 'pp')] },
    { line: `**r = &${vb};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _ptr('p', 'p', vb), _ptr('pp', 'pp', 'p'), _ptr('r', 'r', 'pp')] },
    { line: `***r = ${vc};`,
      cells: [_int(va, va, a), _int(vb, vb, vc), _ptr('p', 'p', vb), _ptr('pp', 'pp', 'p'), _ptr('r', 'r', 'pp')] },
    { line: `printf("%d %d\\n", ${va}, ${vb});`,
      cells: [_int(va, va, a), _int(vb, vb, vc), _ptr('p', 'p', vb), _ptr('pp', 'pp', 'p'), _ptr('r', 'r', 'pp')] }
  ];
  return { code, answer: `${a} ${vc}`, difficulty: 'Hard', concepts: 'triple pointers, pointer redirection', trace };
}

// ── Level 4: Pointer Arrays ──────────────────────────────────────────────────

// Gen 9 — Array of int* pointers + p++
function gen9() {
  const [vx, vy, vz] = _vars(3);
  const x   = _rInt(1, 30);
  const y   = _rInt(1, 30);
  const z   = _rInt(1, 30);
  const v1  = _rInt(31, 70);
  const v2  = _rInt(31, 70);
  const aN  = _pick(_ARRS);   // array name string, e.g. "buf"
  const a0  = aN + '0';       // id for arr[0] cell
  const a1  = aN + '1';
  const a2  = aN + '2';
  // **p = v1  →  vx = v1
  // p++       →  p now points to aN[1]
  // **p = v2  →  vy = v2
  const code =
`#include <stdio.h>

int main() {
    int ${vx} = ${x};
    int ${vy} = ${y};
    int ${vz} = ${z};

    int *${aN}[3] = {&${vx}, &${vy}, &${vz}};

    int **p = ${aN};

    **p = ${v1};
    p++;
    **p = ${v2};

    printf("%d %d %d\\n", ${vx}, ${vy}, ${vz});

    return 0;
}`;
  const trace = [
    { line: `int ${vx} = ${x};`,
      cells: [_int(vx, vx, x)] },
    { line: `int ${vy} = ${y};`,
      cells: [_int(vx, vx, x), _int(vy, vy, y)] },
    { line: `int ${vz} = ${z};`,
      cells: [_int(vx, vx, x), _int(vy, vy, y), _int(vz, vz, z)] },
    { line: `int *${aN}[3] = {&${vx}, &${vy}, &${vz}};`,
      cells: [_int(vx, vx, x), _int(vy, vy, y), _int(vz, vz, z),
              _ptr(a0, `${aN}[0]`, vx), _ptr(a1, `${aN}[1]`, vy), _ptr(a2, `${aN}[2]`, vz)] },
    { line: `int **p = ${aN};`,
      cells: [_int(vx, vx, x), _int(vy, vy, y), _int(vz, vz, z),
              _ptr(a0, `${aN}[0]`, vx), _ptr(a1, `${aN}[1]`, vy), _ptr(a2, `${aN}[2]`, vz),
              _ptr('p', 'p', a0)] },
    { line: `**p = ${v1};`,
      cells: [_int(vx, vx, v1), _int(vy, vy, y), _int(vz, vz, z),
              _ptr(a0, `${aN}[0]`, vx), _ptr(a1, `${aN}[1]`, vy), _ptr(a2, `${aN}[2]`, vz),
              _ptr('p', 'p', a0)] },
    { line: `p++;`,
      cells: [_int(vx, vx, v1), _int(vy, vy, y), _int(vz, vz, z),
              _ptr(a0, `${aN}[0]`, vx), _ptr(a1, `${aN}[1]`, vy), _ptr(a2, `${aN}[2]`, vz),
              _ptr('p', 'p', a1)] },
    { line: `**p = ${v2};`,
      cells: [_int(vx, vx, v1), _int(vy, vy, v2), _int(vz, vz, z),
              _ptr(a0, `${aN}[0]`, vx), _ptr(a1, `${aN}[1]`, vy), _ptr(a2, `${aN}[2]`, vz),
              _ptr('p', 'p', a1)] },
    { line: `printf("%d %d %d\\n", ${vx}, ${vy}, ${vz});`,
      cells: [_int(vx, vx, v1), _int(vy, vy, v2), _int(vz, vz, z),
              _ptr(a0, `${aN}[0]`, vx), _ptr(a1, `${aN}[1]`, vy), _ptr(a2, `${aN}[2]`, vz),
              _ptr('p', 'p', a1)] }
  ];
  return { code, answer: `${v1} ${v2} ${z}`, difficulty: 'Hard', concepts: 'pointer arrays, double pointers, pointer arithmetic', trace };
}

// Gen 10 — Array of int** double-pointers + triple pointer arithmetic
function gen10() {
  const [va, vb, vc] = _vars(3);
  const a  = _rInt(1, 20);
  const b  = _rInt(1, 20);
  const c  = _rInt(1, 20);
  const v1 = _rInt(21, 60);
  const v2 = _rInt(21, 60);
  const aN  = _pick(_ARRS);
  const a0  = aN + '0';
  const a1  = aN + '1';
  const a2  = aN + '2';
  // ***r = v1  →  *(*(*(arr[0]))) = *(*(p1)) = *(va addr) → va = v1
  // r++        →  r points to arr[1]
  // ***r = v2  →  vb = v2  ;  vc unchanged
  const code =
`#include <stdio.h>

int main() {
    int ${va} = ${a};
    int ${vb} = ${b};
    int ${vc} = ${c};

    int *p1 = &${va};
    int *p2 = &${vb};
    int *p3 = &${vc};

    int **${aN}[3] = {&p1, &p2, &p3};

    int ***r = ${aN};

    ***r = ${v1};
    r++;
    ***r = ${v2};

    printf("%d %d %d\\n", ${va}, ${vb}, ${vc});

    return 0;
}`;
  const trace = [
    { line: `int ${va} = ${a};`,
      cells: [_int(va, va, a)] },
    { line: `int ${vb} = ${b};`,
      cells: [_int(va, va, a), _int(vb, vb, b)] },
    { line: `int ${vc} = ${c};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _int(vc, vc, c)] },
    { line: `int *p1 = &${va};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _int(vc, vc, c),
              _ptr('p1', 'p1', va)] },
    { line: `int *p2 = &${vb};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _int(vc, vc, c),
              _ptr('p1', 'p1', va), _ptr('p2', 'p2', vb)] },
    { line: `int *p3 = &${vc};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _int(vc, vc, c),
              _ptr('p1', 'p1', va), _ptr('p2', 'p2', vb), _ptr('p3', 'p3', vc)] },
    { line: `int **${aN}[3] = {&p1, &p2, &p3};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _int(vc, vc, c),
              _ptr('p1', 'p1', va), _ptr('p2', 'p2', vb), _ptr('p3', 'p3', vc),
              _ptr(a0, `${aN}[0]`, 'p1'), _ptr(a1, `${aN}[1]`, 'p2'), _ptr(a2, `${aN}[2]`, 'p3')] },
    { line: `int ***r = ${aN};`,
      cells: [_int(va, va, a), _int(vb, vb, b), _int(vc, vc, c),
              _ptr('p1', 'p1', va), _ptr('p2', 'p2', vb), _ptr('p3', 'p3', vc),
              _ptr(a0, `${aN}[0]`, 'p1'), _ptr(a1, `${aN}[1]`, 'p2'), _ptr(a2, `${aN}[2]`, 'p3'),
              _ptr('r', 'r', a0)] },
    { line: `***r = ${v1};`,
      cells: [_int(va, va, v1), _int(vb, vb, b), _int(vc, vc, c),
              _ptr('p1', 'p1', va), _ptr('p2', 'p2', vb), _ptr('p3', 'p3', vc),
              _ptr(a0, `${aN}[0]`, 'p1'), _ptr(a1, `${aN}[1]`, 'p2'), _ptr(a2, `${aN}[2]`, 'p3'),
              _ptr('r', 'r', a0)] },
    { line: `r++;`,
      cells: [_int(va, va, v1), _int(vb, vb, b), _int(vc, vc, c),
              _ptr('p1', 'p1', va), _ptr('p2', 'p2', vb), _ptr('p3', 'p3', vc),
              _ptr(a0, `${aN}[0]`, 'p1'), _ptr(a1, `${aN}[1]`, 'p2'), _ptr(a2, `${aN}[2]`, 'p3'),
              _ptr('r', 'r', a1)] },
    { line: `***r = ${v2};`,
      cells: [_int(va, va, v1), _int(vb, vb, v2), _int(vc, vc, c),
              _ptr('p1', 'p1', va), _ptr('p2', 'p2', vb), _ptr('p3', 'p3', vc),
              _ptr(a0, `${aN}[0]`, 'p1'), _ptr(a1, `${aN}[1]`, 'p2'), _ptr(a2, `${aN}[2]`, 'p3'),
              _ptr('r', 'r', a1)] },
    { line: `printf("%d %d %d\\n", ${va}, ${vb}, ${vc});`,
      cells: [_int(va, va, v1), _int(vb, vb, v2), _int(vc, vc, c),
              _ptr('p1', 'p1', va), _ptr('p2', 'p2', vb), _ptr('p3', 'p3', vc),
              _ptr(a0, `${aN}[0]`, 'p1'), _ptr(a1, `${aN}[1]`, 'p2'), _ptr(a2, `${aN}[2]`, 'p3'),
              _ptr('r', 'r', a1)] }
  ];
  return { code, answer: `${v1} ${v2} ${c}`, difficulty: 'Very Hard', concepts: 'array of double pointers, triple pointer arithmetic', trace };
}

// ── Public API ───────────────────────────────────────────────────────────────

const _BY_DIFF = {
  'Easy':      [gen1, gen2, gen3],
  'Medium':    [gen4, gen5, gen6],
  'Hard':      [gen7, gen8, gen9],
  'Very Hard': [gen10],
};
const _ALL = [gen1, gen2, gen3, gen4, gen5, gen6, gen7, gen8, gen9, gen10];

function generateProblem(difficulty) {
  const pool = _BY_DIFF[difficulty] || _ALL;
  return pool[Math.floor(Math.random() * pool.length)]();
}
