# Maré

Jogo de administração de restaurante à beira-mar em Three.js, com oceano FFT Poseidon/WebGPU e modo WebGL2 compatível.

## Desenvolvimento

Requer Node.js 22.12+.

```sh
npm ci
npm run dev
npm test
npm run build
```

Abra http://127.0.0.1:4173/mare/. O build obtém recursos públicos com hashes SHA-256 verificados em assets-manifest.json. Nenhum token é necessário.

## Jogo

Abra o restaurante, selecione mesas para preparar pedidos, sirva os pratos prontos e arrume as mesas. Reponha camarões e invista no chef ou no ambiente. O progresso fica no navegador. Modais e abas ocultas pausam o atendimento. A câmera pode ser orbitada, aproximada ou levada à vista do mar.

## Renderização

O modo avançado usa três cascatas FFT JONSWAP/Tessendorf, espuma persistente, Fresnel e absorção da água, materiais PBR e vegetação detalhada. Há um autoteste numérico FFT na GPU antes da inicialização. `?compat=1` seleciona WebGL2. Essa alternativa mantém a jogabilidade com água reflexiva simplificada.

## Créditos

- Three.js 0.184.0 — MIT.
- Poseidon, Owen Yuwono — MIT; origem 671053b812fcbffe8ecc4668eaa6ab7ffeb63287. Licença preservada em src/third_party/poseidon/LICENSE. Modificações: caminhos /mare e correção da paridade FFT para N=128/512.
- Poly Haven: Wood Planks Grey e Damp Beach Sand — CC0.
- FreeStylized Skybox 131 — CC0, panorama distribuído pelo Poseidon.
- Water normals — distribuição oficial Three.js r180.

## Publicação

Vite usa base /mare/. vercel.json mantém assets e rotas compatíveis com o prefixo. O domínio principal encaminha somente /mare e /mare/* a este projeto, preservando as outras páginas.

## Limites

O acabamento combina materiais fotográficos com geometria procedural. Não representa fotorrealismo completo. A espuma costeira é aproximada; o oceano não simula a quebra física de ondas contra cada objeto. Os garçons decorativos circulam; o atendimento continua controlado pelo jogador. O modo WebGPU depende do navegador e hardware.
