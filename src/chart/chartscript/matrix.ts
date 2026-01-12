/*
 * Copyright (C) 2019 - 2025 Devexperts Solutions IE Limited
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Matrix namespace
 * JavaScript port of PineScript v6 matrix.* functions
 * 
 * 50 functions
 */

export type Matrix = number[][];

/**
 * Create new matrix
 */
export function new_matrix(rows: number, cols: number, val: number = 0): Matrix {
    return Array(rows).fill(null).map(() => Array(cols).fill(val));
}

export const newtype = new_matrix;

// Basic accessors
export const rows = (m: Matrix): number => m.length;
export const columns = (m: Matrix): number => m[0]?.length || 0;
export const elements_count = (m: Matrix): number => rows(m) * columns(m);
export const get = (m: Matrix, row: number, col: number): number => m[row]?.[col];
export const set = (m: Matrix, row: number, col: number, val: number): Matrix => { m[row][col] = val; return m; };
export const row = (m: Matrix, idx: number): number[] => [...m[idx]];
export const col = (m: Matrix, idx: number): number[] => m.map(r => r[idx]);
export const copy = (m: Matrix): Matrix => m.map(r => [...r]);
export const fill = (m: Matrix, val: number): Matrix => { m.forEach(r => r.fill(val)); return m; };

// Boolean checks
export const is_square = (m: Matrix): boolean => rows(m) === columns(m);
export const is_zero = (m: Matrix): boolean => m.every(r => r.every(v => v === 0));
export const is_binary = (m: Matrix): boolean => m.every(r => r.every(v => v === 0 || v === 1));
export const is_diagonal = (m: Matrix): boolean => {
    if (!is_square(m)) return false;
    for (let i = 0; i < rows(m); i++) {
        for (let j = 0; j < columns(m); j++) {
            if (i !== j && m[i][j] !== 0) return false;
        }
    }
    return true;
};
export const is_identity = (m: Matrix): boolean => {
    if (!is_square(m)) return false;
    for (let i = 0; i < rows(m); i++) {
        for (let j = 0; j < columns(m); j++) {
            if (i === j && m[i][j] !== 1) return false;
            if (i !== j && m[i][j] !== 0) return false;
        }
    }
    return true;
};
export const is_symmetric = (m: Matrix): boolean => {
    if (!is_square(m)) return false;
    for (let i = 0; i < rows(m); i++) {
        for (let j = i + 1; j < columns(m); j++) {
            if (m[i][j] !== m[j][i]) return false;
        }
    }
    return true;
};
export const is_antisymmetric = (m: Matrix): boolean => {
    if (!is_square(m)) return false;
    for (let i = 0; i < rows(m); i++) {
        for (let j = 0; j < columns(m); j++) {
            if (m[i][j] !== -m[j][i]) return false;
        }
    }
    return true;
};
export const is_triangular = (m: Matrix): boolean => {
    if (!is_square(m)) return false;
    let upper = true, lower = true;
    for (let i = 0; i < rows(m); i++) {
        for (let j = 0; j < i; j++) if (m[i][j] !== 0) lower = false;
        for (let j = i + 1; j < columns(m); j++) if (m[i][j] !== 0) upper = false;
    }
    return upper || lower;
};
export const is_antidiagonal = (m: Matrix): boolean => {
    if (!is_square(m)) return false;
    const n = rows(m);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i + j !== n - 1 && m[i][j] !== 0) return false;
        }
    }
    return true;
};
export const is_stochastic = (m: Matrix): boolean => {
    for (const r of m) {
        const s = r.reduce((a, b) => a + b, 0);
        if (Math.abs(s - 1) > 1e-10) return false;
    }
    return true;
};

// Row/column operations
export const add_row = (m: Matrix, idx: number, arr: number[]): Matrix => { m.splice(idx, 0, [...arr]); return m; };
export const add_col = (m: Matrix, idx: number, arr: number[]): Matrix => {
    for (let i = 0; i < m.length; i++) m[i].splice(idx, 0, arr[i]);
    return m;
};
export const remove_row = (m: Matrix, idx: number): Matrix => { m.splice(idx, 1); return m; };
export const remove_col = (m: Matrix, idx: number): Matrix => {
    for (const r of m) r.splice(idx, 1);
    return m;
};
export const swap_rows = (m: Matrix, i: number, j: number): Matrix => { [m[i], m[j]] = [m[j], m[i]]; return m; };
export const swap_columns = (m: Matrix, i: number, j: number): Matrix => {
    for (const r of m) [r[i], r[j]] = [r[j], r[i]];
    return m;
};

// Transformations
export const transpose = (m: Matrix): Matrix => m[0].map((_, i) => m.map(r => r[i]));
export const concat = (m1: Matrix, m2: Matrix, horizontal: boolean = true): Matrix => {
    if (horizontal) return m1.map((r, i) => [...r, ...m2[i]]);
    return [...m1, ...m2];
};
export const submatrix = (m: Matrix, r1: number, c1: number, r2: number, c2: number): Matrix => {
    return m.slice(r1, r2 + 1).map(r => r.slice(c1, c2 + 1));
};
export const reshape = (m: Matrix, newRows: number, newCols: number): Matrix => {
    const flat = m.flat();
    const result: Matrix = [];
    for (let i = 0; i < newRows; i++) {
        result.push(flat.slice(i * newCols, (i + 1) * newCols));
    }
    return result;
};
export const reverse = (m: Matrix): Matrix => m.reverse().map(r => r.reverse());
export const sort = (m: Matrix, colIdx: number = 0, order: 'asc' | 'desc' = 'asc'): Matrix => {
    m.sort((a, b) => order === 'asc' ? a[colIdx] - b[colIdx] : b[colIdx] - a[colIdx]);
    return m;
};

// Arithmetic
export const sum = (m: Matrix, other: Matrix | number): Matrix => {
    if (typeof other === 'number') {
        return m.map(r => r.map(v => v + other));
    }
    return m.map((r, i) => r.map((v, j) => v + other[i][j]));
};
export const diff = (m: Matrix, other: Matrix | number): Matrix => {
    if (typeof other === 'number') {
        return m.map(r => r.map(v => v - other));
    }
    return m.map((r, i) => r.map((v, j) => v - other[i][j]));
};
export const mult = (m: Matrix, other: Matrix | number): Matrix => {
    if (typeof other === 'number') {
        return m.map(r => r.map(v => v * other));
    }
    // Matrix multiplication
    const result = new_matrix(rows(m), columns(other), 0);
    for (let i = 0; i < rows(m); i++) {
        for (let j = 0; j < columns(other); j++) {
            for (let k = 0; k < columns(m); k++) {
                result[i][j] += m[i][k] * other[k][j];
            }
        }
    }
    return result;
};
export const pow = (m: Matrix, p: number): Matrix => {
    let result = copy(m);
    for (let i = 1; i < p; i++) result = mult(result, m);
    return result;
};

// Statistics
export const avg = (m: Matrix): number => {
    let total = 0, count = 0;
    for (const r of m) for (const v of r) { total += v; count++; }
    return total / count;
};
export const min = (m: Matrix): number => Math.min(...m.flat());
export const max = (m: Matrix): number => Math.max(...m.flat());
export const median = (m: Matrix): number => {
    const flat = m.flat().sort((a, b) => a - b);
    const mid = Math.floor(flat.length / 2);
    return flat.length % 2 === 0 ? (flat[mid - 1] + flat[mid]) / 2 : flat[mid];
};
export const mode = (m: Matrix): number => {
    const counts = new Map<number, number>();
    for (const r of m) for (const v of r) counts.set(v, (counts.get(v) || 0) + 1);
    let maxCount = 0, modeVal = NaN;
    for (const [v, c] of counts) if (c > maxCount) { maxCount = c; modeVal = v; }
    return modeVal;
};
export const trace = (m: Matrix): number => {
    let total = 0;
    for (let i = 0; i < Math.min(rows(m), columns(m)); i++) total += m[i][i];
    return total;
};

// Linear algebra
export const det = (m: Matrix): number => {
    const n = rows(m);
    if (n === 1) return m[0][0];
    if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];

    const lu = copy(m);
    let d = 1;
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(lu[k][i]) > Math.abs(lu[maxRow][i])) maxRow = k;
        }
        if (maxRow !== i) {
            [lu[i], lu[maxRow]] = [lu[maxRow], lu[i]];
            d *= -1;
        }
        if (lu[i][i] === 0) return 0;
        d *= lu[i][i];
        for (let k = i + 1; k < n; k++) {
            lu[k][i] /= lu[i][i];
            for (let j = i + 1; j < n; j++) {
                lu[k][j] -= lu[k][i] * lu[i][j];
            }
        }
    }
    return d;
};

export const inv = (m: Matrix): Matrix => {
    const n = rows(m);
    const aug = m.map((r, i) => [...r, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]);

    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) maxRow = k;
        }
        [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

        const div = aug[i][i];
        if (div === 0) throw new Error('Matrix is singular');
        for (let j = 0; j < 2 * n; j++) aug[i][j] /= div;

        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const mult = aug[k][i];
                for (let j = 0; j < 2 * n; j++) aug[k][j] -= mult * aug[i][j];
            }
        }
    }

    return aug.map(r => r.slice(n));
};

export const pinv = (m: Matrix): Matrix => {
    const mt = transpose(m);
    const mtm = mult(mt, m);
    return mult(inv(mtm), mt);
};

export const rank = (m: Matrix): number => {
    const ref = copy(m);
    const n = rows(ref), p = columns(ref);
    let r = 0;

    for (let col = 0; col < p && r < n; col++) {
        let pivot = r;
        for (let i = r + 1; i < n; i++) {
            if (Math.abs(ref[i][col]) > Math.abs(ref[pivot][col])) pivot = i;
        }
        if (Math.abs(ref[pivot][col]) < 1e-10) continue;
        [ref[r], ref[pivot]] = [ref[pivot], ref[r]];

        for (let i = r + 1; i < n; i++) {
            const factor = ref[i][col] / ref[r][col];
            for (let j = col; j < p; j++) ref[i][j] -= factor * ref[r][j];
        }
        r++;
    }
    return r;
};

export const eigenvalues = (m: Matrix): number[] => {
    if (rows(m) === 2) {
        const a = m[0][0], b = m[0][1], c = m[1][0], d = m[1][1];
        const tr = a + d, determinant = a * d - b * c;
        const disc = tr * tr - 4 * determinant;
        if (disc >= 0) {
            return [(tr + Math.sqrt(disc)) / 2, (tr - Math.sqrt(disc)) / 2];
        }
        return [NaN, NaN];
    }
    throw new Error('Eigenvalues only implemented for 2x2 matrices');
};

export const eigenvectors = (m: Matrix): number[][] => {
    const eigs = eigenvalues(m);
    const vecs: number[][] = [];
    for (const e of eigs) {
        const a = m[0][0] - e, b = m[0][1];
        if (Math.abs(a) < 1e-10 && Math.abs(b) < 1e-10) {
            vecs.push([1, 0]);
        } else if (Math.abs(b) < 1e-10) {
            vecs.push([0, 1]);
        } else {
            vecs.push([1, -a / b]);
        }
    }
    return vecs;
};

export const kron = (m1: Matrix, m2: Matrix): Matrix => {
    const r1 = rows(m1), c1 = columns(m1);
    const r2 = rows(m2), c2 = columns(m2);
    const result = new_matrix(r1 * r2, c1 * c2);

    for (let i = 0; i < r1; i++) {
        for (let j = 0; j < c1; j++) {
            for (let ii = 0; ii < r2; ii++) {
                for (let jj = 0; jj < c2; jj++) {
                    result[i * r2 + ii][j * c2 + jj] = m1[i][j] * m2[ii][jj];
                }
            }
        }
    }
    return result;
};

export const FUNCTION_COUNT = 50;
