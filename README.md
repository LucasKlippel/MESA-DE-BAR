# Mesa de Bar Web — v0.4.1

Conversão independente do projeto Godot enviado para HTML, CSS e JavaScript, com servidor autoritativo. Inclui Bisca, Pife e Blackjack. Não precisa do Godot ou Docker.

## Correção v0.4.1

Corrigido o HTTP 403 causado pelos separadores de pastas no Windows e os endereços de CSS/JavaScript na página inicial. Servidor testado em Linux; caminhos Windows verificados com node:path.win32.

## Começar no Windows

1. Instale Node.js **22 ou superior** pelo site oficial https://nodejs.org/.
2. Extraia todo o ZIP para uma pasta.
3. Abra `INICIAR_WINDOWS.bat`.
4. No navegador, acesse **http://localhost:3000**.
5. Digite seu nome, escolha o jogo e clique em **Jogar agora com bots** ou **Criar sala com amigos**.

Não é necessário `npm install` para o servidor independente. Não abra o HTML com duplo clique: o servidor é necessário para as partidas.

Em Linux/macOS: execute `node server.mjs` na pasta do projeto.

## Jogar com amigos

### Na mesma rede Wi-Fi

- Execute o servidor em apenas um computador e mantenha-o ligado.
- No Windows, use `ipconfig` para localizar o IPv4 do computador.
- Os demais acessam `http://IP-DO-COMPUTADOR:3000` no navegador. Exemplo: `http://192.168.1.10:3000`.
- Se solicitado pelo Windows, permita o Node.js na rede privada.
- Um jogador cria a sala; os outros digitam seu código. O anfitrião inicia quando todos os lugares estiverem preenchidos.
- Bots podem completar lugares livres antes de começar.
- Para testar duas pessoas em um único PC, use dois navegadores ou abas abertas separadamente (não duplique a aba com sessão existente).

### Pela internet

O ZIP já contém o multiplayer de servidor. Para amigos fora da sua rede, hospede o projeto em um servidor que execute Node.js continuamente.

Configuração de hospedagem:
- Runtime: Node.js 22+.
- Comando de início: `node server.mjs`.
- Porta: variável `PORT` fornecida pelo provedor; padrão 3000.
- Um único processo/instância para este adaptador de arquivos.
- Configure HTTPS no domínio e um volume persistente para `data/`.
- Compartilhe o endereço público fornecido pela hospedagem, depois o código da sala.
- Hospedagem puramente estática, somente com upload de HTML/CSS, não executa este servidor.
- Não compartilhe `localhost`: esse endereço só funciona no próprio dispositivo.

A versão de demonstração em Sites é publicada inicialmente com acesso privado do proprietário. Ela permite testar com bots. Para convidados acessarem por esse endereço, é necessário liberar o acesso da publicação. O ZIP é independente dessa publicação.

## Jogos

**Bisca:** 2–4 participantes, 40 cartas, 3 cartas por mão. A-7-K-J-Q-6-5-4-3-2. Pontos 11-10-4-3-2; total 120. Trunfo visível sob o monte, vencedor compra primeiro. Três jogadores removem o 2 de paus. Quatro jogam em duplas alternadas. Nenhuma obrigação de seguir naipe. Clique na carta e confirme.

**Pife:** 2–4 participantes, 52 cartas, 9 por mão. Compre do monte ou descarte e descarte uma. Vitória automática quando todas as nove cartas restantes formarem combinações. Trincas/quartetos de valores iguais e naipes diferentes; sequências de três ou mais no mesmo naipe. Ás baixo ou alto. Ordenação por naipe/valor. Reciclagem do monte e empate preventivo em 500 turnos.

**Blackjack:** 1–4 participantes contra a mesma banca, seis baralhos. Apostas em múltiplos de 10, comprar/parar/dobrar. Banca para em qualquer 17. Natural paga 3:2; vitória comum 1:1; empate devolve aposta. Sem split, seguro ou apostas laterais. Cada assento começa com 1000 fichas virtuais. Saldo abaixo de 10 é reposto automaticamente na próxima rodada. Sem dinheiro real, saques ou compras.

## Recursos

- Salas por código, chat, bots, cartas privadas e validação pelo servidor.
- Fichas visuais no Blackjack e efeitos sonoros sintetizados (botão ♫).
- Layout adaptável para computador e celular.
- Turnos de 90 segundos; jogada automática após expirar.
- Atualizar a página mantém a sessão por aba. Não limpe dados do navegador durante uma partida.
- Sair entrega o assento a um bot. É possível retomar na mesma aba pelo código; o anfitrião passa a outro humano ao sair.
- Salas persistidas localmente em `data/rooms.json`, gravadas a cada 2 segundos; queda abrupta pode perder os últimos 2 segundos.
- No servidor hospedado em Sites, D1 guarda o estado com comparação atômica de versão.

## Limites desta primeira versão web

- Não há contas, ranking global, lista pública de salas, música ambiente ou cenário 3D. Fichas pertencem ao assento/sala, não a uma carteira global.
- Não foi portado o hotseat com troca de mão em uma única tela; cada jogador usa sua aba/dispositivo.
- A sincronização usa HTTP a cada 1,2 segundo (polling), não WebSocket. É adequada ao jogo por turnos; não há promessa de latência instantânea.
- Bots e expiração de turno avançam quando alguma pessoa está consultando a sala. Se todos fecharem, o jogo pausa até alguém voltar.
- Bots usam regras simples, sem níveis de dificuldade.
- Salas expiram após 48 horas sem atualização de estado. O servidor local limpa essas salas. Na versão D1, ficam inacessíveis após expirar, mas não há rotina de remoção física automática nesta versão.
- Projeto para pequenos grupos; não foi feito teste de carga ou validação em aparelhos físicos diferentes. Para operação pública em grande escala, adicionar moderação, limites de criação por identidade, observabilidade e limpeza periódica do banco.
- O código da sala controla a entrada; quem receber o convite pode ocupar uma vaga. A identidade de jogador usa um segredo de sessão mantido na aba. Não é uma conta com senha.

## Arquivos principais

- `public/mesa/index.html`: telas e textos.
- `public/mesa/style.css`: visual e responsividade.
- `public/mesa/app.js`: interface, áudio, convites e comunicação.
- `lib/engine.mjs`: regras e bots.
- `lib/service.mjs`: autorização de sala, comandos, versão e privacidade.
- `server.mjs`: servidor Node.js independente.
- `tests/engine.test.mjs`: testes automatizados (`node --test tests/engine.test.mjs`).

## Validação

Testes automatizados: conservação das cartas e dos 120 pontos; partidas completas de Bisca em 2/3/4; trincas, sequências, ás alto/baixo e fluxo do Pife; totais, natural 3:2, dobra e liquidação única do Blackjack; proteção das mãos, turnos inválidos, concorrência de entrada e reenvio de comandos.

Interface conferida em navegador de desenvolvimento. Testes entre aparelhos físicos e em uma conexão externa ficam para a validação do usuário.

O projeto Godot original não foi alterado. Esta versão reconstrói o visual em CSS e utiliza sons próprios sintetizados; não depende dos addons 3D.
