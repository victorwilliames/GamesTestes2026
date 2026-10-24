# Os 7 Prompts Originais na Íntegra (Registro Histórico)

Estes são exatamente os 7 comandos humanos enviados por Rafael na conversa oficial com Claude Code (`/Users/rafafish/Developer/demo_youtube`), arquivados no `index.html` da conversa com o registro de 55 respostas, 594 ações, 170 imagens e 6 relatórios de crítico.

---

## Tabela Resumo dos Prompts

| # | Fase | Mensagem de Rafael | Objetivo / Efeito |
|---|---|---|---|
| **1** | Fase 1 | *Crie um piloto de RPG isométrico (câmera 3/4) para rodar no navegador...* | Criação do motor, esqueleto 3D invisível, IK, animação por poses, pintura HQ, platô e combo de 3 golpes. |
| **2** | Fase 2 | *O rosto do personagem não está nada parecido com a imagem de referencia...* | Foco exclusivo na melhoria do rosto na posição Sul com landmarks e crítica visual. |
| **3** | Fase 2 | *Não esqueça da posição da camera* | Manter enquadramento isométrico 3/4 correto. |
| **4** | Fase 2 | *use o navegador em modo silence sem precisar abrir a janela no meu computador* | Instrução para usar headless browser (Playwright/Puppeteer) sem interrupção na tela. |
| **5** | Fase 2 | *O personagem tem que olhar para frente e não para camera* | Ajuste de orientação do olhar do cavaleiro no espaço 3D relativo ao mundo. |
| **6** | Fase 3 | *Agora não. Quero testar e também saber quanto tempo e token vc gastou...* | Rafael interrompe a geração, testa o protótipo e pede auditoria de tempo, tokens e histórico. |
| **7** | Fase 3 | *Consegue gerar uma pagina html com toda a conversa incluindo as imagens, graficos, etc que foram gerados na conversa?* | Geração da página `index.html` arquivando 100% da conversa com gráficos e imagens. |

---

## Texto Literal de Cada Prompt

### Mensagem 1
> **Data/Hora:** Início da Fase 1  
> **Conteúdo:**  
> "Crie um piloto de RPG isométrico (câmera 3/4) para rodar no navegador, usando Canvas 2D. O piloto é só um pequeno campo aberto com um cavaleiro que dá um combo de espada de 3 golpes, no estilo de Hades (https://store.steampowered.com/app/1145360/Hades/).  
>  
> - Sem WebGL, sem engine e sem imagens: tudo é desenhado por código.  
> - O personagem é um esqueleto 3D invisível, com IK de 2 ossos em braços e pernas, que é pintado em 2D e dá os movimentos ao personagem.  
> - Animações como poses-chave, com antecipação, golpe e recuperação.  
> - Estilo HQ: formas chapadas com 2 ou 3 tons e contorno de tinta escuro.  
> - Árvores, arbustos e pedras são pintados por código no mesmo estilo HQ, pintados uma vez num canvas fora da tela e reaproveitados. Só o balanço do vento é animado.  
> - O chão é pintado uma vez num canvas fora da tela. Só o personagem, o rastro da espada e o vento são redesenhados a cada quadro.  
> - WASD para andar e clique para atacar.  
>  
> Faça o personagem em uma armadura e use a referencia anexa como rosto do personagem. Você tem o gemini com nano banana para usar caso precise criar referencias.  
>  
> Antes de entregar, use um agente crítico para avaliar o resultado artistico e geral: abra no navegador, tire screenshots e corrija o que aparecer."

---

### Mensagem 2
> **Data/Hora:** Transição para a Fase 2  
> **Conteúdo:**  
> "O rosto do personagem não está nada parecido com a imagem de referencia que eu mandei. Eu quero que você trabalhe para melhorar os detalhes do rosto do personagem para que chegue o mais próximo da imagem de referencia. Vamos começar apenas pela posição sul. Analise quadro a quadro os detalhes, posições dos olhos, boca, nariz, cabelos, etc. Coloque um critico para analisar o resultado e só me entregue quando a qualidade estiver próxima ao da imagem de referencia em níveis de detalhe."

---

### Mensagem 3
> **Data/Hora:** Durante a Fase 2  
> **Conteúdo:**  
> "Não esqueça da posição da camera"

---

### Mensagem 4
> **Data/Hora:** Durante a Fase 2  
> **Conteúdo:**  
> "use o navegador em modo silence sem precisar abrir a janela no meu computador"

---

### Mensagem 5
> **Data/Hora:** Durante a Fase 2  
> **Conteúdo:**  
> "O personagem tem que olhar para frente e não para camera"

---

### Mensagem 6
> **Data/Hora:** Conclusão da Fase 2 e início da Fase 3  
> **Conteúdo:**  
> "Agora não. Quero testar e também saber quanto tempo e token vc gastou para criar a primeira versão do piloto e quanto tempo e toquem gastou para ajustar o rosto do personagem na versão sul. Além disso queria ver toda a conversa, eu não consigo mais ver o inicio da conversa aqui."

---

### Mensagem 7
> **Data/Hora:** Fechamento da Fase 3  
> **Conteúdo:**  
> "Consegue gerar uma pagina html com toda a conversa incluindo as imagens, graficos, etc que foram gerados na conversa?"
