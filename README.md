# Oásis Pedológico 3D

Serious game 3D de ciência do solo para graduação. Um mapa explorável em terceira
pessoa com três biomas degradados; em cada um o jogador entra na área, ativa o
**Visor Nano** e resolve, por arrastar e soltar, a reação físico-química que decide
se o solo se recupera — reações que ninguém vê a olho nu.

- **3D real (WebGL)** com Three.js, tudo local: abre por duplo clique, offline.
- **Duração:** 20–30 min (exploração + 3 puzzles + debrief).
- **Público:** Agronomia, Engenharia Agronômica, Ciência do Solo, Eng. Ambiental.
- **Convenções:** SiBCS; valores de pH, Al³⁺, V%, PST e CE dentro das faixas usuais
  de Latossolos ácidos, solos salino-sódicos e áreas de mineração.

## Como rodar

**Opção 1 — abrir direto:** duplo clique em `index.html`. Funciona offline
(as fontes do Google são opcionais; sem rede cai para monoespaçada do sistema).

**Opção 2 — servidor local** (recomendado para testar no celular na mesma rede):

```bash
cd ~/www/soil-games/oasis-pedologico-3d
python3 -m http.server 8902
# desktop: http://127.0.0.1:8902
# celular: http://<ip-da-máquina>:8902
```

## Controles

| Ação | Desktop | Celular |
|---|---|---|
| Andar | `WASD` / setas | joystick no canto inferior esquerdo |
| Olhar / girar câmera | arrastar com o mouse | arrastar com o dedo no cenário |
| Zoom da câmera | roda do mouse | (fixo, ajustado ao tamanho da tela) |
| Analisar a área | `E` ou clique no aviso | toque no aviso "E · Parada 2 · Semiárido" |
| Abrir/fechar o transecto | `T` ou botão 🧭 | botão 🧭 no HUD |
| Arrastar peças no Visor | clique e arraste | arraste com o dedo |
| Ver a ficha de uma peça | clique curto na peça | toque curto na peça |
| Pedir dica | `H` ou botão 💡 | botão 💡 |
| Ligar/desligar som | botão 🔊 no Visor | botão 🔊 no Visor |
| Fechar o Visor | `ESC` ou "DESLIGAR" | "DESLIGAR" |
| Reiniciar progresso | botão ↺ (pede confirmação) | idem |

O aviso de análise só aparece **dentro** do anel de cada área. O progresso fica
salvo em `localStorage` (`oasis-pedologico-3d:v1`).

## O que mudou nesta versão

**Transecto explícito:** as três áreas agora são **paradas de uma topossequência**
(1 Topo, 2 Pediplano, 3 Encosta), com rótulo flutuante em cada baliza, número no
aviso de interação e um painel de **transecto** (`T` ou 🧭) com perfil topográfico,
ecossistema de cada parada, os cinco fatores de formação e uma tabela comparativa.
A Caderneta de cada puzzle ganhou a entrada "fatores de formação".

**Visual menos "quadrado":** avatar arredondado (cápsulas e esferas, chapéu de palha,
mochila), árvores e arbustos com copas esféricas, mandacarus em cápsula, crostas de
sal irregulares com borda, pilhas de rejeito cônicas, trilha contínua com borda,
céu em gradiente, nuvens e colinas ao fundo, capim instanciado e balizas de área com
anel, halo e pilar de luz colorido.

**Visor Nano mais jogável:** alvo destacado durante o arraste, ficha de cada peça
(toque curto), estequiometria em slots (3 OH⁻ por Al³⁺), etapa de lixiviação do Na⁺
com os íons visíveis na drenagem, equação que acende por etapa, dica contextual,
som sintetizado, vibração e partículas de sucesso.

## Topossequência e fatores de formação

O mapa não é um conjunto de três ilhas: é um **transecto**. O jogador sai do topo,
atravessa o pediplano e chega à encosta, e o solo muda a cada parada. O painel
**Transecto** (`T` ou 🧭) mostra o perfil topográfico, o ecossistema de cada parada
e como os cinco fatores de formação atuam ali:

```text
S = f(clima, organismos, relevo, material de origem, tempo)
```

| Parada | Ecossistema | Solo | Fator dominante |
|---|---|---|---|
| **1 · Topo** | Cerrado — savana tropical sazonal | Latossolo Vermelho distrófico | clima (lixiviação) + tempo (intemperismo) |
| **2 · Pediplano** | Caatinga — floresta tropical seca e caducifólia | Solo salino-sódico / Tecnossolo | clima (evaporação) + relevo (drenagem impedida) + material (sais) |
| **3 · Encosta** | Encosta degradada — solo exposto e pasto ralo | Neossolo/Cambissolo raso em ravina | relevo (declive) + organismos + uso do solo |

Numa **catena** clássica o clima e o material de origem são parecidos e só o relevo
varia: topo perde, baixada recebe. Aqui o clima também muda de propósito, para
comparar os cinco fatores lado a lado — o painel diz isso na abertura e no rodapé.
Cada parada traz ainda a **reação** que o Visor resolve e a **conservação**
correspondente, e a tabela "Comparar as 3 paradas" (cartões no celular) resume
ecossistema, solo, clima, fator dominante e manejo.

## As três áreas

| Bioma | Solo / problema | Reação que o jogador monta |
|---|---|---|
| **Cerrado** | Latossolo vermelho distrófico, pH 4,8, Al³⁺ 1,2 cmolc/kg, V% 22% | `CaCO₃` → `Ca²⁺ + OH⁻`; `Al³⁺ + 3 OH⁻ → Al(OH)₃↓`; `Ca²⁺` ocupa o sítio da argila |
| **Semiárido** | Solo salino-sódico + área de mineração, pH 8,7, PST 18%, CE 6 dS/m, infiltração 2 mm/h | gipsita → `Ca²⁺ + SO₄²⁻`; `Ca²⁺` desloca 2 `Na⁺`; os `Na⁺` são arrastados para a **drenagem** e saem do perfil; matéria orgânica cimenta o agregado |
| **Encosta** | Ravina e selamento, agregados estáveis 22%, infiltração 4 mm/h, perda 12 t/ha/ano | exsudato radicular cola as partículas; hifa + glomalina costuram o macroagregado; a gota de chuva testa a estabilidade |

Cada puzzle tem 3 ou 4 etapas (o semiárido inclui a lixiviação do sódio). Errar não
pune: a peça volta com um tremor e a **Caderneta de Campo** registra uma "tentativa"
com a dica do que fazer.

### Interações do Visor Nano

- **Arrastar com alvo destacado:** o alvo sob o cursor ganha contorno sólido, brilho
  e leve zoom; se a peça não serve, o alvo não reage.
- **Ficha da peça:** um toque curto (sem arrastar) abre um cartão com o que aquele íon
  ou mineral faz no solo.
- **Estequiometria visível:** o `Al³⁺` mostra **três slots**; cada `OH⁻` acende um.
  Só com os três o alumínio precipita como `Al(OH)₃`.
- **Lixiviação:** no semiárido, os `Na⁺` deslocados ficam visíveis dentro da zona de
  drenagem e descem pelo perfil quando a etapa fecha.
- **Equação progressiva:** a equação da reação acende linha por linha conforme as
  etapas são resolvidas.
- **Dica contextual:** `H` ou 💡 pulsa as peças e o alvo da etapa atual.
- **Som e háptica:** síntese WebAudio (sem arquivos) + vibração curta no celular;
  preferência de mudo fica salva.

## Estrutura do código

```
index.html          markup, HUD, Visor Nano, telas; lista as bibliotecas
css/style.css       identidade visual Agrosoil + layout responsivo
js/vendor/three.min.js   Three.js r149 (MIT) — única dependência de runtime
js/config.js        paleta, biomas, zonas, parâmetros de câmera/jogador
js/world.js         terreno, mistura de biomas, luzes, props low poly, trilha
js/player.js        avatar e controlador cinemático (WASD + joystick)
js/camera.js        órbita em terceira pessoa + foco no Visor Nano
js/zones.js         balizas das áreas (anel, halo, pilar, rótulo da parada) e proximidade
js/puzzles.js       dados científicos das três reações (etapas, equações, fichas)
js/nano.js          motor do Visor: palco, drag-and-drop, slots, dicas, caderneta
js/factors.js       conteúdo do transecto: 5 fatores, 3 paradas, reação e conservação
js/transect.js      painel do transecto: SVG do perfil, abas, comparação, tecla T
js/sfx.js           efeitos sonoros sintetizados (WebAudio) e vibração
js/ui.js            HUD, aviso de interação, joystick, toasts, debrief
js/main.js          bootstrap, loop, input, ligação zona → puzzle, persistência
```

**A lógica 3D não conhece a lógica de puzzle.** `puzzles.js` só descreve dados e
uma função `build(api)` que monta o palco via uma API pequena (`chip`, `zone`,
`flow`, `move`, `remove`, `slots`, `fillSlot`, `pop`, `say`, `values`, `hint`).
Etapas aceitam `need` (quantas peças), `partial` (feedback parcial), `replenish`
(a peça volta à bancada) e `keep` (a peça fica parada no alvo, como na drenagem).
Para criar um quarto bioma basta acrescentar uma zona em `config.js` e um objeto
em `puzzles.js`.

### Bibliotecas

| Biblioteca | Versão | Onde | Por quê |
|---|---|---|---|
| Three.js | r149 (UMD, local) | `js/vendor/three.min.js` | render WebGL; UMD porque ES modules quebram em `file://` |
| Google Fonts | — | `<link>` no `index.html` | identidade visual (Press Start 2P / Space Mono); opcional |

Não há engine de física: o controlador é cinemático e usa `OP.World.heightAt(x, z)`
para colar o avatar no terreno. Se quiser corpos rígidos, `cannon-es` entra depois
sem tocar na lógica de puzzles.

## Acessibilidade e desempenho

- `prefers-reduced-motion`: desliga bobbing, pulsos e animações CSS.
- Alvos de toque com no mínimo 44 px; layout do Visor em coluna no celular.
- Sombras desligadas automaticamente em telas de toque; ~40 mil triângulos,
  ~110 draw calls no desktop e ~80 no celular (60 fps em máquina de escritório).
- Peças do Visor têm `role="button"` e `tabindex`; `Enter`/`Espaço` abre a ficha.
- Botão de som com estado `aria-pressed`; dicas também por teclado (`H`).
- Transecto: `T` abre/fecha, `Esc` fecha, abas com `role="tab"` e setas ←/→,
  marcadores do perfil com `role="button"`; o jogador fica pausado com o painel aberto.

## Personalização rápida

- Cores e nomes das áreas: `js/config.js` (`palette`, `zones`).
- Textos, valores e etapas das reações: `js/puzzles.js`.
- Transecto, fatores e paradas: `js/factors.js` (texto) e `js/transect.js` (SVG/UI).
- Velocidade, distância da câmera: `OP.CONFIG.player.speed` e `OP.CONFIG.camera`.
- Progresso salvo: `localStorage['oasis-pedologico-3d:v1']`.

## Arquivos relacionados

- `GUIA_DO_PROFESSOR.md` — roteiro de aula, respostas, erros conceituais comuns.
- `../oasis-pedologico-2/` — versão 2D com seis áreas (outro jogo, independente).
