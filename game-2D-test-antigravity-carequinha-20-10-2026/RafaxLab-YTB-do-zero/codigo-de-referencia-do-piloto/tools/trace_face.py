#!/usr/bin/env python3
"""
trace_face.py — vetoriza o rosto de referência em camadas de cor chapada.

Ferramenta OFFLINE de desenvolvimento (o jogo nunca carrega a imagem):
  1. pré-filtra a textura de pincel (mediana), preservando as linhas escuras;
  2. classifica cada pixel numa paleta curta (pele, cabelo, raspado, tinta…);
  3. limpa no nível dos rótulos (maioria + remoção de ilhas), protegendo as
     linhas finas, e transforma o anel externo da silhueta em tinta;
  4. separa o interior dos olhos (branco, íris, faixa azul-marinho, pupila,
     brilho) numa pilha própria — o jogo a desenha recortada pela abertura do
     olho, o que permite deslocar a íris conforme a direção do olhar;
  5. para cada camada gera a máscara "esta cor ou qualquer cor acima dela"
     (camadas empilhadas, sem frestas), com o MESMO σ em todas para manter o
     aninhamento; extrai contornos (marching squares) e simplifica (RDP);
  6. escreve js/face_trace.js com os polígonos em meio-pixels da referência.

Uso: python3 tools/trace_face.py   (rodar na raiz do projeto)
"""
import json
import subprocess
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

SRC = 'referencias/rosto_referencia.png'
OUT = 'js/face_trace.js'
SIGMA = 0.85

# ----------------------------------------------------------------- paletas
# Ordem = ordem de pintura (de baixo para cima).
MAIN = [
    ('skin_base', '#f2a86e'),
    ('skin_light', '#fcb888'),
    ('skin_mid', '#e08f5a'),
    ('skin_shadow', '#c8703f'),
    ('warm_mid', '#b97650'),
    ('skin_deep', '#a9532f'),
    ('buzz_dark', '#91553f'),
    ('hair_hi2', '#e0a070'),
    ('hair_light', '#9a5030'),
    ('hair_mid', '#793a25'),
    ('brow', '#663020'),
    ('hair_base', '#57281d'),
    ('hair_dark', '#321614'),
    ('ink', '#1a0808'),
]
EYE = [
    ('eye_white', '#f5d4c3'),
    ('eye_white2', '#d8aa9a'),
    ('eye_shadow', '#9a6056'),
    ('iris_light', '#4a8ec0'),   # daqui para cima as camadas se deslocam com o olhar
    ('iris', '#2f6d9c'),
    ('iris_dark', '#1d4a7a'),
    ('iris_navy', '#131d3e'),
    ('pupil', '#05070d'),
    ('glint', '#fafafa'),
]
EYE_SHIFT_FROM = 'iris_light'
PROTECT = {'ink', 'hair_dark', 'brow'}       # linhas finas: não sofrem filtro de maioria
WEIGHT = np.array([0.9, 1.2, 0.8], dtype=np.float32)


def hex2rgb(h):
    return np.array([int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)], dtype=np.float32)


def nearest(img, pal, allowed=None):
    cols = np.stack([hex2rgb(c) for _, c in pal])
    d = (((img[..., None, :] - cols) * WEIGHT) ** 2).sum(-1)
    if allowed is not None:
        d = np.where(allowed[None, None, :], d, 1e12)
    return np.argmin(d, -1)


def poly_mask(shape, polys, dilate=0):
    m = Image.new('L', (shape[1], shape[0]), 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        d.polygon([tuple(q[:2]) for q in p], fill=255)
    a = np.asarray(m) > 0
    if dilate > 0:
        a = ndimage.binary_dilation(a, iterations=dilate)
    return a


# ----------------------------------------------------------------- marching squares
def contours(f, iso=0.5):
    tl = f[:-1, :-1] > iso
    tr = f[:-1, 1:] > iso
    br = f[1:, 1:] > iso
    bl = f[1:, :-1] > iso
    case = tl * 8 + tr * 4 + br * 2 + bl * 1
    ys, xs = np.nonzero((case != 0) & (case != 15))

    def interp(y0, x0, y1, x1):
        a, b = f[y0, x0], f[y1, x1]
        t = (iso - a) / (b - a) if b != a else 0.5
        return (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)

    def key(y, x, e):
        return ('h', y, x) if e == 0 else ('h', y + 1, x) if e == 2 else ('v', y, x) if e == 3 else ('v', y, x + 1)

    def pt(y, x, e):
        if e == 0: return interp(y, x, y, x + 1)
        if e == 2: return interp(y + 1, x, y + 1, x + 1)
        if e == 3: return interp(y, x, y + 1, x)
        return interp(y, x + 1, y + 1, x + 1)

    SEG = {1: [(3, 2)], 2: [(2, 1)], 3: [(3, 1)], 4: [(0, 1)], 6: [(0, 2)], 7: [(3, 0)],
           8: [(3, 0)], 9: [(0, 2)], 11: [(0, 1)], 12: [(3, 1)], 13: [(2, 1)], 14: [(3, 2)]}
    adj, pts = {}, {}
    for y, x in zip(ys.tolist(), xs.tolist()):
        c = int(case[y, x])
        if c in (5, 10):
            center = (f[y, x] + f[y, x + 1] + f[y + 1, x] + f[y + 1, x + 1]) / 4
            if c == 5:
                segs = [(3, 0), (2, 1)] if center > iso else [(0, 1), (3, 2)]
            else:
                segs = [(0, 1), (3, 2)] if center > iso else [(3, 0), (2, 1)]
        else:
            segs = SEG[c]
        for a, b in segs:
            ka, kb = key(y, x, a), key(y, x, b)
            pts.setdefault(ka, pt(y, x, a))
            pts.setdefault(kb, pt(y, x, b))
            adj.setdefault(ka, []).append(kb)
            adj.setdefault(kb, []).append(ka)
    seen, loops = set(), []
    for start in adj:
        if start in seen:
            continue
        loop = [start]
        seen.add(start)
        prev, cur = None, start
        while True:
            nxt = next((n for n in adj[cur] if n != prev and n not in seen), None)
            if nxt is None:
                break
            loop.append(nxt)
            seen.add(nxt)
            prev, cur = cur, nxt
        if len(loop) >= 3:
            loops.append(np.array([pts[k] for k in loop], dtype=np.float64))
    return loops


def rdp(points, eps):
    n = len(points)
    if n < 3:
        return points
    keep = np.zeros(n, dtype=bool)
    keep[0] = keep[-1] = True
    stack = [(0, n - 1)]
    while stack:
        a, b = stack.pop()
        if b <= a + 1:
            continue
        p, q = points[a], points[b]
        seg = q - p
        L = np.hypot(*seg)
        sub = points[a + 1:b]
        d = np.hypot(*(sub - p).T) if L < 1e-9 else np.abs(seg[0] * (sub[:, 1] - p[1]) - seg[1] * (sub[:, 0] - p[0])) / L
        i = int(np.argmax(d))
        if d[i] > eps:
            m = a + 1 + i
            keep[m] = True
            stack += [(a, m), (m, b)]
    return points[keep]


def simplify_loop(loop, eps):
    far = int(np.argmax(np.hypot(*(loop - loop[0]).T)))
    a = rdp(loop[:far + 1], eps)
    b = rdp(np.vstack([loop[far:], loop[:1]]), eps)
    return np.vstack([a[:-1], b[:-1]])


def area(loop):
    x, y = loop[:, 0], loop[:, 1]
    return 0.5 * abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))


def mask_paths(mask, eps, min_area=3.0, sigma=SIGMA):
    f = np.pad(ndimage.gaussian_filter(mask.astype(np.float32), sigma), 1)
    out = []
    for loop in contours(f):
        loop = loop - 0.5
        if area(loop) < min_area:
            continue
        s = simplify_loop(loop, eps)
        if len(s) >= 3:
            out.append(s)
    return out


def flat(paths):
    # inteiros em meio-pixel (q = 0.5 px)
    return [[int(round(float(v) * 2)) for v in p.reshape(-1)] for p in paths]


# ----------------------------------------------------------------- limpeza de rótulos
def majority(label, region, size, protect_ids, K):
    """Filtro de maioria: pixels não protegidos assumem o rótulo mais comum
    (entre os não protegi
… (8391 caracteres a mais)