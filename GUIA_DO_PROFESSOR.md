# Guia do Professor — Oásis Pedológico 3D

**Tema:** gênese, mineralogia e química do solo aplicadas à recuperação de áreas degradadas
**Duração:** 50 min (25–30 min de jogo + 20 min de debrief) ou 20 min como demonstração
**Pré-requisitos:** CTC e saturação por bases, pH e acidez trocável, complexo de troca,
agregação e estrutura, noções de erosão
**Formato:** individual, duplas ou trios (duplas funcionam melhor: um pilota, o outro lê a Caderneta)
**Equipamento:** navegador atualizado com WebGL. Roda em notebook, Chromebook e celular;
abre por duplo clique no arquivo `index.html`, sem internet.

---

## 1. Objetivos de aprendizagem

Ao final, o estudante deve ser capaz de:

1. **Explicar que o solo tem uma dimensão invisível** — reações na superfície da argila,
   no complexo de troca e entre partículas decidem o que se vê na superfície.
2. **Ligar um sintoma visível a um mecanismo químico ou físico**: raiz curta → Al³⁺;
   água que escorre → sódio dispersando argila; ravina → agregados instáveis.
3. **Escrever e interpretar as reações** de calagem, gessagem e agregação.
4. **Distinguir calcário de gesso** pelo mecanismo, não pelo hábito.
5. **Justificar uma prática de manejo citando o processo**, e não o produto.
6. **Reconhecer que conservação do solo é conservação da reação**: sem estrutura e sem
   cobertura, o corretivo aplicado se perde antes de reagir.
7. **Explicar a topossequência**: por que topo, pediplano e encosta, sob o mesmo
   relevo regional, sustentam ecossistemas e solos diferentes — usando os cinco
   fatores de formação (`S = f(clima, organismos, relevo, material de origem, tempo)`).

## 2. O que cada área ensina

| Área | Conceito central | O erro que ela desmonta |
|---|---|---|
| **Cerrado** — Latossolo vermelho distrófico | Acidez trocável, toxidez por Al³⁺, precipitação como Al(OH)₃, saturação por bases | "Calagem é adubar" e "basta olhar o pH" |
| **Semiárido** — solo salino-sódico + mineração | PST, dispersão de argila, troca catiônica com Ca²⁺, floculação, drenagem | "Sódio se resolve lavando com chuva" |
| **Encosta** — ravina e selamento | Agregação, exsudatos, hifas e glomalina, estabilidade de agregados em água | "Erosão se resolve com obra de contenção" |

### As três paradas do transecto

As áreas do mapa são **paradas de uma topossequência** (tecla `T` ou botão 🧭 abre o
painel com o perfil topográfico). Use a tabela para conduzir a comparação:

| Parada | Ecossistema | Solo | Clima | Relevo | Material | Tempo | Fator dominante |
|---|---|---|---|---|---|---|---|
| **1 · Topo** | Cerrado — savana tropical sazonal | Latossolo Vermelho distrófico | 1.400 mm, verão chuvoso | topo bem drenado | rochas ácidas, pobres em bases | paisagem antiga, perfil > 2 m | clima + tempo |
| **2 · Pediplano** | Caatinga — floresta tropical seca | Solo salino-sódico / Tecnossolo | 600 mm irregular, ETP ~2.200 mm | superfície aplainada, drenagem impedida | sedimentos com sódio + rejeito | jovem (décadas) | clima + relevo + material |
| **3 · Encosta** | Encosta degradada — pasto ralo | Neossolo/Cambissolo raso em ravina | chuva concentrada e intensa | declive longo, ravina ativa | colúvio e saprolito | degradação rápida, recuperação lenta | relevo + organismos + uso |

**Ponto de método:** numa catena clássica, clima e material de origem são
semelhantes e só o relevo varia (topo perde, baixada recebe). Aqui o clima também
muda de propósito, para que os cinco fatores apareçam lado a lado. Diga isso à
turma: o jogo é um transecto **didático**, não um levantamento de campo.

### Números usados no jogo

| Área | Antes | Depois |
|---|---|---|
| Cerrado | pH 4,8 · Al³⁺ 1,2 cmolc/kg · V% 22% · CTC 6,5 cmolc/kg | pH 6,0 · Al³⁺ 0,0 · V% 58% |
| Semiárido | pH 8,7 · PST 18% · CE 6 dS/m · infiltração 2 mm/h | PST 6% · CE 2,5 dS/m · infiltração 14 mm/h |
| Encosta | agregados estáveis 22% · infiltração 4 mm/h · perda 12 t/ha/ano | agregados 68% · infiltração 26 mm/h · perda 2 t/ha/ano |

São valores de ordem de grandeza, escolhidos para serem plausíveis e comparáveis —
não substituem laudo.

## 3. Roteiro de aula (50 min)

| Tempo | O que fazer |
|---|---|
| 0–3 min | Abra o jogo projetado e leia a tela inicial: "três áreas degradadas; em cada uma, uma reação que ninguém vê decide se a planta cresce". |
| 3–6 min | Abra o **transecto** (`T`) projetado: mostre o perfil, as três paradas e o modelo `S = f(...)`. Pergunte o que muda do topo para a encosta. Depois mostre os controles e deixe a turma andar 1 min, observando **cor do solo** e **vegetação**. |
| 6–28 min | Jogo em duplas. Circule e pergunte **"o que essa peça faz na argila?"** antes de deixar arrastar. Ao abrir cada Visor, peça que leiam a entrada **fatores de formação** da Caderneta e liguem a reação ao fator dominante daquela parada. |
| 28–30 min | Todos fecham o Visor da última área → o **Debrief** aparece com as três lições. |
| 30–47 min | Debrief dirigido (perguntas abaixo). |
| 47–50 min | Fechamento: cada dupla escreve **uma frase** ligando uma reação a uma prática de campo. |

**Turma grande / tempo curto:** distribua as três áreas entre grupos (uma por grupo),
cada grupo apresenta o mecanismo em 90 s. O progresso é salvo, então o grupo seguinte
continua de onde parou.

## 4. Respostas dos puzzles

**Cerrado — calagem**
1. `CaCO₃` na solução: o carbonato consome H⁺ e gera OH⁻ (por isso a calagem precisa de umidade).
2. `OH⁻` sobre `Al³⁺` **três vezes**: o íon tem três slots de carga e só fecha com
   `Al³⁺ + 3 OH⁻ → Al(OH)₃↓` — hidróxido insolúvel, o alumínio sai da solução. O H⁺
   trocável também é neutralizado e o sítio fica livre.
3. `Ca²⁺` no sítio vago da argila: V% sobe, a CTC efetiva passa a ser ocupada por
   Ca²⁺ e Mg²⁺.

**Semiárido — gesso + matéria orgânica**
1. Gipsita na solução: `CaSO₄·2H₂O → Ca²⁺ + SO₄²⁻` (não corrige pH — não é calcário).
2. `Ca²⁺` no complexo: desloca dois `Na⁺` (2 cargas contra 1).
3. **Arraste os dois `Na⁺` para a zona de drenagem**: eles ficam visíveis ali e só
   saem do perfil quando a etapa fecha. Sem drenagem, o sódio volta por ascensão
   capilar — é o ponto pedagógico central.
4. Matéria orgânica no agregado: cimenta os flocos, reabre poros, a infiltração volta.

**Encosta — agregação**
1. Exsudato radicular sobre as partículas: ponte de carbono orgânico entre areia, silte e argila.
2. Hifa + glomalina no macroagregado: costura em agregados > 250 µm, estáveis em água.
3. Gota de chuva no agregado: o teste. Agregado estável infiltra em vez de selar.

> **Apoio em sala:** a ficha de cada peça (toque curto) e a dica (`H` ou 💡) existem
> para manter o raciocínio no mecanismo, não no "chute". Use a dica como pista
> socrática: ela mostra *onde* agir, mas não *por que*.

## 5. Perguntas para o debrief

**Reprodução (fácil)**
- Por que o calcário não age "sozinho" e precisa de água?
- Por que o gesso não substitui o calcário no Cerrado?
- O que acontece com a argila quando o Na⁺ ocupa o complexo?

**Topossequência (média)**
- Por que o topo e o pediplano, tão próximos, têm solos tão diferentes? Cite dois fatores.
- O que a encosta "exporta" para a baixada — e o que isso tem a ver com a ravina?
- Se o clima do pediplano fosse úmido, o que aconteceria com os sais e com o PST?

**Transferência (média)**
- O laudo do Cerrado tem V% 22. Se você aplicasse apenas a dose para pH 6,0 sem
  considerar a acidez trocável, o que poderia dar errado?
- No semiárido, o produtor tem gesso mas não tem drenagem. O que muda no resultado?
- Por que "jogar palha" na encosta não substitui raiz e fungo no longo prazo?

**Análise (difícil)**
- A calagem aumenta a CTC? Explique o que realmente muda (cargas dependentes de pH ×
  ocupação dos sítios).
- Em qual das três áreas a matéria orgânica é o **principal** mecanismo, e em qual ela
  é coadjuvante? Justifique.
- Um solo com pH 6,0, V% 60% e PST 15% está "corrigido"? O que falta olhar?
- Escolha uma área e diga **o que você faria diferente** se o solo fosse argiloso
  (2:1) em vez de oxídico.

## 6. Erros conceituais comuns (e como o jogo os trata)

| Concepção do estudante | O que o jogo mostra |
|---|---|
| "Calagem é adubação" | O calcário não fornece N-P-K: ele libera sítios e precipita Al³⁺. A Caderneta repete isso. |
| "pH alto é sempre bom" | No semiárido o pH é 8,7 e o solo está degradado por sódio. |
| "Sódio sai com chuva" | Só sai se for trocado por Ca²⁺ **e** houver drenagem. |
| "Gesso = calcário" | Gesso fornece Ca²⁺ sem neutralizar acidez; o texto do puzzle insiste nisso. |
| "Erosão se resolve com muro" | O puzzle fecha em estrutura: agregado estável → infiltração. |
| "O que não se vê não importa" | É a tese do jogo: a reação na argila decide a paisagem. |
| "Clima explica tudo" | O transecto mostra relevo e material decidindo salinidade e erosão no mesmo clima regional. |
| "Topo e baixada são o mesmo solo" | Topo lixivia e perde; pediplano acumula sais; encosta perde solo. A catena explica a diferença. |
| "Todo solo jovem é raso e todo solo velho é profundo" | O Tecnossolo é jovem e o Latossolo é velho, mas o que muda o perfil é a combinação dos cinco fatores. |

## 7. Avaliação sugerida

O jogo não dá nota. Sugestões de evidência de aprendizagem:

- **Bilhete de saída (2 min):** "Explique em 3 linhas por que o sódio precisa de Ca²⁺
  *e* de drenagem."
- **Questão de transferência:** dado um laudo novo (pH 5,1 · Al³⁺ 0,8 · V% 31% ·
  PST 4%), pedir a sequência de manejo e a justificativa.
- **Mapa conceitual:** ligar sintoma → mecanismo → prática → indicador de sucesso.
- **Transecto em 5 linhas:** escolher uma parada e escrever como clima, organismos,
  relevo, material e tempo agem nela — e qual fator domina. O painel `T` serve de
  consulta, mas a resposta precisa ser escrita com as próprias palavras.
- **Rubrica rápida (0–3):** identifica o mecanismo; escolhe a peça certa; explica a
  reação com a equação; cita um indicador para verificar o resultado.

## 8. Adaptações

- **Sem WebGL** (laboratório antigo): use a versão 2D (`../oasis-pedologico-2/`),
  que cobre química, física e conservação com seis áreas.
- **Acessibilidade:** `prefers-reduced-motion` desliga animações; todos os puzzles
  funcionam por teclado + mouse e por toque. `Enter`/`Espaço` abre a ficha da peça,
  `H` pede dica, `T` abre o transecto (abas navegáveis com ←/→) e o botão 🔊 controla o som.
- **Projeção:** o Visor Nano foi desenhado para leitura a distância (fonte mono,
  contraste alto). Se a turma estiver longe, aumente o zoom do navegador para 125%.

## 9. Referências de apoio

- Brady & Weil — *Elementos da Natureza e Propriedades dos Solos* (cap. acidez, sódio, estrutura).
- Embrapa — *Manual de Métodos de Análise de Solo* e *Sistema Brasileiro de Classificação de Solos*.
- Raij, B. van — *Fertilidade do Solo e Adubação* (calagem e gessagem).
- Six et al. / Tisdall & Oades — agregação, glomalina e estabilidade de agregados.
