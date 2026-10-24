# Direção visual — fase 1

Prancha de personagem para o criador inspecionar o primeiro frame. A figura é o centro; a interface funciona como margem discreta de um artbook, sem arena fictícia ou HUD de combate.

Referência principal: `ref/hero-carequinha/`. Cabeça grande, sobrancelhas incisivas, olhos rubros, corpo compacto e musculoso. Materiais com contorno de tinta e 2–3 tons. Anti-referências: boneco de cápsulas, render plástico, UI de dashboard com cards em excesso.

Paleta canônica do desenho: `Pilot.PAL` em `js/ink.js`. Pele âmbar, sombra terracota, vermelho tecido, ferro azul acinzentado, osso marfim. A marca vermelha e o lenço unem cabeça e corpo.
Tokens da página: `:root` de `styles.css` é a fonte canônica; fundo #181e22, texto #e8dfcc, discreto #aab2b3, acento #dbb56c. Sem fontes remotas; Georgia em títulos, Segoe UI no texto, Consolas em metadados.

Layout: canvas amplo central, coluna lateral de rosto e controles. Abaixo de 760 px, coluna única. Margens 24–40 px, bordas finas, sem sombras borradas ou gradientes. Assinatura: herói e retrato renderizados pelo mesmo código, visíveis juntos.
Controles: botões nativos com foco/hover/pressed, slider rotulado; texto PT-BR. Nenhuma animação nesta fase. Não exibir WASD ou combo como funcionais.
