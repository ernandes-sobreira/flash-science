# FLASH SCIENCE

**Antes do título, uma decisão.** Uma experiência digital independente para refletir, aprender e preparar a entrada no mestrado ou doutorado.

## Acesse

Após ativar GitHub Pages no repositório:
**https://ernandes-sobreira.github.io/flash-science/**

Ativação: **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**.

## Recursos

- 35 perguntas reflexivas distribuídas em cinco etapas, das motivações pessoais aos métodos científicos.
- Microaulas no próprio aplicativo: ao responder inclusive “Ainda não sei”, aparece uma explicação e uma missão de aprendizagem.
- Porcentagem de **preparação autodeclarada** por dimensão. Não é teste de aptidão validado nem previsão de aprovação.
- Plano de tarefas, recomendações temáticas de programas e professores da UNEMAT, links institucionais, relatório em JSON e impressão/PDF.
- **Salvar minha jornada em qualquer etapa:** respostas e reflexões são registradas automaticamente em `localStorage`; o botão **Salvar** permite confirmar o registro no aparelho.
- **Baixar backup da jornada** durante ou depois das 35 perguntas; arquivo JSON com respostas, reflexões, progresso, missões e, quando disponível, memória e foto do Dia 1.
- **Restaurar a jornada** em outro navegador ou aparelho, sem precisar começar de novo. O aplicativo pede confirmação antes de substituir respostas existentes.
- Identidade visual branca e azul inspirada na linguagem do projeto **Chuva MT**, com transições e animações leves e acessíveis.
- **Dia 1**: foto opcional, data e mensagem para lembrar do dia especial em que a pessoa decidiu iniciar o caminho acadêmico.
- Tela comemorativa com opção de revisitar a memória, baixar cartão PNG, criar backup JSON com a foto e restaurá-lo em outro dispositivo.

## Privacidade do Dia 1

As respostas e a data/mensagem são salvas localmente no navegador (localStorage). A foto é redimensionada/comprimida e salva no IndexedDB. Os botões de backup restauram dados apenas no navegador atual; não criam sincronização em nuvem. **Nenhuma foto é enviada ao GitHub nem a servidores nossos.** A pessoa escolhe se deseja uma foto; continuar sem imagem é possível.

**Atenção:** limpar dados do navegador, usar modo privado ou trocar de aparelho pode apagar a memória local. Para preservar o momento, baixar o cartão PNG e o arquivo de backup e guardá-los em local seguro. O backup contém imagem e mensagem pessoais; não publique esse arquivo no repositório.

## Fontes institucionais

- [Catálogo de mestrado e doutorado da UNEMAT](https://unemat.br/pro-reitoria/prppg/cursos-de-mestrado-e-doutorado)
- [SIGAA — seleções](https://sigaa.unemat.br/sigaa/public/processo_seletivo/lista.jsf?aba=p-processo&nivel=S)
- [PPGCA — docentes](https://caceres.unemat.br/faculdades/facab/stricto/ppgca/docentes)

Os dados de programas e docentes exigem atualização periódica; correspondência temática não significa vaga ou disponibilidade de orientação.

## Estrutura

- `index.html` — questionário e relatório
- `theme.css` — interface clean azul / Chuva MT
- `day1.js` — cápsula de memória do Dia 1, fotografia, cartão e backup
- `.nojekyll` — GitHub Pages

Não utiliza backend, chave de API nem banco remoto. Funciona com hospedagem estática HTTPS; recomenda-se Chrome, Firefox, Edge ou Safari atualizados.

- `save-tools.js` — salvamento explícito e backup/restauração completa.
- `save-tools.css` — interface responsiva dos controles de salvamento.
