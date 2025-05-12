import qrcode from "qrcode-terminal";
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import { executablePath } from "puppeteer";
import mysql from 'mysql2/promise';
const aguardandoCPF = new Set();
const aguardandoMatricula = new Set();


// Criação da conexão com o banco
const pool = mysql.createPool({
	host: '10.14.205.9',
	user: 'root',
	password: '123456',
	database: 'sisgep',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
      });
      
// Exporte o pool usando export
export default pool;

// Configuração do WhatsApp
const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: {
		executablePath: executablePath(),
		headless: true,
		args: ["--no-sandbox"],
	},
});

// Utilitário de delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Exibe o QR code
client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

// Quando o WhatsApp estiver pronto
client.on("ready", () => {
	console.log("Tudo certo! WhatsApp conectado.");
});

// Inicializa o cliente
client.initialize();

// Envia uma mensagem simulando digitação com delay
const sendWithTyping = async (chat, to, message, delayTime = 3000) => {
	await delay(delayTime);
	await chat.sendStateTyping();
	await delay(delayTime);
	await client.sendMessage(to, message);
};

// Menu principal
const getMenuPrincipal = () => `
📋 *MENU PRINCIPAL*

Por favor, digite o número correspondente à opção desejada:

1 - 🔐 *Segurança* (Consultar Carteirinha / Rol de Visitas / Sedex/Jumbo)  
2 - 💰 *Pecúlio* (Depósitos / Retiradas)  
3 - 📄 *SIMIC* (Saída Temporária / Auxílio Reclusão)  
4 - 📝 *CRAS* (Registros de Paternidade / Óbitos)  
5 - ⚖️ *Advogados / Oficiais de Justiça*  
6 - 📞 *Telefones Úteis / Endereço*

ℹ️ *Digite "menu" a qualquer momento para voltar a este menu.*
`;

// Submenus da opção 1
const opcoesSeguranca = {
	'10': async (chat, msg) => {
		const media = MessageMedia.fromFilePath("./docs/calendario_visita.pdf");
		await sendWithTyping(chat, msg.from, "📄 CALENDÁRIO DE VISITAÇÃO:");
		await client.sendMessage(msg.from, media);
	},
	'11': async (chat, msg) => {
		const texto = `📌 *Conforme Resolução SAP vigente, as regras sobre vestimentas são:*

📖 *Artigo 115* – Para ingresso em estabelecimento penal, todos os visitantes, inclusive crianças e adolescentes, deverão observar os seguintes critérios quanto ao vestuário:

I - Uso de camisetas com manga (curta ou longa), *exceto* nas cores: azul marinho, branca, caqui/marrom e preta.  
II – Uso de calça de moletom ou legging, *sem botões metálicos, sem zíper e sem estampas*, exceto nas cores acima.  
III – Visitantes do sexo feminino também podem usar *saias tipo “midi”* (abaixo dos joelhos).  
IV – Uso de *chinelo de dedo*, com solado fino e alças de borracha simples.  
V – Em dias frios, é permitido o uso de *meias e blusa de moletom*, desde que *sem capuz, forro, bolsos, botões metálicos ou zíper*, e respeitando as cores permitidas.

🚫 *Artigo 115-A* – É *proibido* à pessoa privada de liberdade *trocar ou emprestar roupas e/ou pertences com visitantes*.`;

		await sendWithTyping(chat, msg.from, texto);
	},
	'12': async (chat, msg) => {
		const mensagens = [
			"📄 *DOCUMENTAÇÃO PARA INCLUSÃO DE VISITANTES*",
			`I - CÓPIA AUTENTICADA DO RG (VALIDADE DE 10 ANOS DA DATA DE EXPEDIÇÃO) E DO CPF OU CNH

II - CÓPIA DO DOCUMENTO DO PRESO COMPROVANDO GRAU DE PARENTESCO, AVÓS DEVEM ENVIAR CERTIDÃO DE NASCIMENTO (OBRIGATÓRIO)

III - AMÁSIA: DECLARAÇÃO DE AMÁSIA OU DE UNIÃO ESTÁVEL DIGITADA, COM ASSINATURA DA DECLARANTE E DUAS TESTEMUNHAS RECONHECIDAS AS ASSINATURAS EM CARTÓRIO, COM DATA DO INÍCIO DA UNIÃO (MÊS E ANO).`,
			`IV - CERTIDÃO DE ANTECEDENTES CRIMINAIS DO ESTADO DE ORIGEM DO RG.  
V - COMPROVANTE DE ENDEREÇO EM NOME DA VISITA OU DECLARAÇÃO COM CONTA.  
VI - GESTANTE: CÓPIA DA CARTEIRA DE GESTANTE.  
VII - 2 FOTOS 3X4.`,

			`📌 *Observações*:  
- *Filhos e Netos (menores de 18 anos)*: Sem antecedentes criminais.  
- *Amásia*: Declaração assinada e reconhecida em cartório.

📬 *Endereço de envio*:  
Rol de Visita  
Av. Drº Antonio de Souza Neto, Nº 300  
Aparecidinha – Sorocaba – SP  
CEP: 18087-210`,

			`🤰 *Gestantes*: cópia onde conste o nome e a data provável do parto.  
📅 Aguardar no mínimo *10 dias* após envio.  
📞 Ligue: *(15) 3335-2303* para saber sobre a carteirinha.`
		];

		for (const texto of mensagens) {
			await sendWithTyping(chat, msg.from, texto, 1000);
		}
	},
'13': async (chat, msg) => {
	const media = MessageMedia.fromFilePath('./docs/anexo_II.pdf');
	
	await sendWithTyping(chat, msg.from, `📄 *Relação de produtos e alimentos permitidos:*  
Segue o arquivo PDF contendo todas as orientações sobre os itens referentes à alimentação e jumbo.

📬 *Atenção:* Telegramas e/ou cartas registradas *somente poderão ser enviados por pessoas devidamente cadastradas no ROL DE VISITAS do sentenciado.*`);
	
	await client.sendMessage(msg.from, media);
},
	'14': async (chat, msg) => {
		await sendWithTyping(chat, msg.from, `
📬 *14 - CONEXÃO FAMILIAR*

🆕 *NOVIDADES DO PROGRAMA CONEXÃO FAMILIAR*

📌 *Nova regra sobre CORRESPONDÊNCIAS VIRTUAIS:*

✉️ *Troca de Mensagens Eletrônicas:*  
Será permitido envio de *01 (uma)* mensagem (e-mail) por mês.  
 O/A visitante receberá por e-mail a confirmação do recebimento pelo reeducando. *NÃO HAVERÁ OUTRA RESPOSTA*, apenas a confirmação do recebimento da mensagem.

🔗 Para mais informações sobre o programa Conexão Familiar, acesse:  
https://www1.sap.sp.gov.br/conexao-familiar.html#top
	`);
	},

	// Solicita o CPF da visita para consulta
	'15': async (chat, msg) => {
		await sendWithTyping(chat, msg.from, '🪪 *Digite o CPF do visitante (somente números):*');
		aguardandoCPF.add(msg.from);
	},

	// Solicita a matrícula para consultar no banco
	'16': async (chat, msg) => {
	await sendWithTyping(chat, msg.from, '👤 *Digite a matrícula do detento (somente números, sem o dígito):*');
	aguardandoMatricula.add(msg.from);
	}


};

// Submenus da opção 2 - Pecúlio
const opcoesPeculio = {
	'21': async (chat, msg) => {
		const texto = `💰 *DEPÓSITO DO SENTENCIADO PARA FAMILIAR:*  
O sentenciado deverá encaminhar solicitação ao Setor de Pecúlio, para que seja efetuado depósito em favor de familiar cadastrado no ROL DE VISITAS, devendo ser fornecido dados completos bancários do favorecido, tais como: nome completo, CPF, nº de agência e conta (corrente ou poupança) e valor.

⚠️ *Atenção:*  
- Só será permitido o depósito em conta corrente ou poupança do Banco do Brasil (banco vinculado para transações bancárias com a SAP).`;

		await sendWithTyping(chat, msg.from, texto);
	},

	'22': async (chat, msg) => {
		const texto = `🏦 *RETIRADA DE VALORES NA UNIDADE PRISIONAL (PÓS LIBERDADE):*  
“Para os casos em que os sentenciados foram beneficiados pela progressão de regime ou cumprimento de pena, antes do pagamento da empresa, e possuem condições de receber os valores de forma presencial.”

📋 *Procedimento para retirada:*  
- Cópia do Alvará de Soltura + original;  
- Cópia do RG + original;  
- Entrar em contato com o Setor de Pecúlio via e-mail: *peculio@cdpsor.sap.sp.gov.br* ou telefone *(15) 3335-2303 – Opção 2*, para agendamento da data para retirada na Unidade Prisional.`;

		await sendWithTyping(chat, msg.from, texto);
	},

	'23': async (chat, msg) => {
		const texto = `🏦 *RECEBER DEPÓSITO EM BANCO (PÓS LIBERDADE):*  
“Para os casos em que os sentenciados foram beneficiados pela progressão de regime ou cumprimento de pena, antes do pagamento da empresa, e não possuem condições de receber os valores de forma presencial.”

📋 *Procedimento via e-mail (peculio@cdpsor.sap.sp.gov.br):*  
- Encaminhar cópia do RG;  
- Encaminhar cópia do Alvará de Soltura;  
- Encaminhar cópia do Cartão ou Extrato da conta, onde conste o banco, agência e conta a ser depositada;  
- Se a conta for de Terceiro, ela deve constar no ROL DE VISITAS, com documentação em ordem.  
- No e-mail, mencionar: nome, RG, CPF e dados bancários completos do titular da conta.`;

		await sendWithTyping(chat, msg.from, texto);
	},

	'24': async (chat, msg) => {
		const texto = `💸 *DEPÓSITO NO PECÚLIO POR PIX*  
Conforme Resolução SAP 56, de 02 de junho de 2022:

✔️ Permitido somente *01 depósito mensal* por pessoa privada de liberdade;  
✔️ Valor máximo permitido: *01 salário mínimo vigente*;  
✔️ Somente visitantes cadastrados e maiores de 16 anos podem realizar ou receber depósitos;  
✔️ Movimentação de valores deve ser feita com conta em nome do visitante cadastrado;  
✔️ O depósito *deve conter o nome e matrícula da pessoa privada de liberdade* no campo "descrição";  
✔️ Despesas com restituições por descumprimento das regras serão debitadas da transação.

🔑 *Chave PIX*: pixcdpsorocaba@sap.sp.gov.br`;

		await sendWithTyping(chat, msg.from, texto);
	}
};

// Submenus da opção 3 - SIMIC
const opcoesSIMIC = {
	'31': async (chat, msg) => {
		const texto = `🚪 *31 - SAÍDA TEMPORÁRIA*  

📋 *REQUISITOS EXIGIDOS AO SENTENCIADO:*  
- Cumprimento de pena em *Regime Semiaberto*;  
- *Bom comportamento carcerário*;  
- Ter cumprido no mínimo *1/6 da pena* para primários e *1/4 para reincidentes*;  
- *Autorização do Juízo competente*;  
- *Recursos financeiros* em conta Pecúlio 15 dias antes da saída para custear passagem de ida e volta.  

📌 *Importante:* Os requisitos devem ser atingidos *15 dias antes* da data da saída temporária, exceto o comportamento, que deve ser mantido até o dia da saída.

📄 *DOCUMENTOS DE REMESSA OBRIGATÓRIA PELOS FAMILIARES:*  
- *Comprovante de endereço atualizado*, enviado por:  
  • E-mail: *cdpsor@sap.sp.gov.br* (informar dados do preso);  
  • Ou carta remetida ao preso.  

✔️ O comprovante deve ser:  
- Conta de consumo do último mês (Luz, Água ou Telefone);  
- Em nome do sentenciado ou do familiar que será visitado;  
- Em caso de imóvel alugado: apresentar *declaração padrão emitida pelo proprietário*, com *firma reconhecida em cartório*.`;

		await sendWithTyping(chat, msg.from, texto);
	},

	'32': async (chat, msg) => {
		const texto = `💼 *32 - AUXÍLIO RECLUSÃO DO INSS*  

📝 *INFORMAÇÕES SOBRE SOLICITAÇÃO DE CERTIDÃO DE RECOLHIMENTO PRISIONAL:*  

A *Certidão de Recolhimento Prisional* é um documento necessário para solicitação do Auxílio Reclusão.  

⚠️ *Atenção:*  
A *Secretaria da Administração Penitenciária (SAP)* não é responsável por autorizar ou pagar o benefício. Toda análise e pagamento são de responsabilidade do *INSS*.

📬 *Solicitação deve ser feita por e-mail:*  
cadastro@cdpsor.sap.sp.gov.br  

📎 *Documentos necessários:*  
- Dados do detento;  
- Para esposa: cópia de documento pessoal da requerente e dos filhos;  
- Para mãe do detento: cópia de documento pessoal;  
- Se for via advogado: *procuração assinada pelo(a) requerente*.  

💡 Também pode ser solicitado nos postos da *CAEF* (Centro de Atendimento ao Egresso e Família), órgão ligado à Coordenadoria de Reintegração Social.`;

		await sendWithTyping(chat, msg.from, texto);
	}
};

// Submenus da opção 4 - CRAS
const opcoesCRAS = {
	'41': async (chat, msg) => {
		const texto = `👶 *ORIENTAÇÕES PARA RECONHECIMENTO DE PATERNIDADE - RECÉM-NASCIDO OU JÁ REGISTRADO:*

📌 *Recém-nascido (registro ainda não feito)*  
Encaminhar para o e-mail *saude@cdpsor.sap.sp.gov.br* os seguintes documentos:  
- Declaração de nascido vivo (folha amarela);  
- RG da mãe;  
- RG do pai (se tiver);  
- Comprovante de endereço em nome da mãe (ou declaração de endereço);  
- Nome que a criança irá se chamar;  
- Nome e matrícula do sentenciado.

Após o envio, será confeccionada uma declaração a ser levada ao cartório. O documento deverá ser retirado na unidade.

📌 *Criança já registrada apenas pela mãe*  
Encaminhar para o e-mail *reintegracao@p2sorocaba.sap.sp.gov.br* os seguintes documentos:  
- Certidão de nascimento da criança;  
- RG da mãe;  
- RG do pai (se tiver);  
- Comprovante de endereço em nome da mãe (ou declaração de endereço);  
- Nome que a criança passará a se chamar;  
- Nome e matrícula do sentenciado.`;
		
		await sendWithTyping(chat, msg.from, texto);
	},

	'42': async (chat, msg) => {
		const texto = `🪦 *ÓBITOS FAMILIARES:*

Deverá encaminhar e-mail para: *reintegracao@p2sorocaba.sap.sp.gov.br* com os seguintes dados:  
- Certidão ou declaração de óbito;  
- Data, local e horário do féretro e sepultamento;  
- Telefone da funerária responsável.

📌 Após verificação da veracidade, o sentenciado será informado.

🔖 *Conforme Art. 120 da Lei nº 7.210/84 (Lei de Execução Penal):*  
Poderá haver saída do sentenciado, mediante escolta ou autorização judicial, nos casos de falecimento de:  
- Cônjuge ou companheira(o);  
- Ascendente (pai, mãe, avós);  
- Descendente (filhos, netos);  
- Irmãos.`;
		
		await sendWithTyping(chat, msg.from, texto);
	},

	'43': async (chat, msg) => {
		const texto = `🧠 *ASSISTÊNCIA SOCIAL / PSICOLOGIA:*

Em caso de dúvidas ou necessidade de atendimento, encaminhar e-mail para:  
📧 *reintegracao@p2sorocaba.sap.sp.gov.br*`;
		
		await sendWithTyping(chat, msg.from, texto);
	}
};

// Submenus da opção 5 - Advogados e Oficiais de Justiça
const opcoesAdvOf = {
	'51': async (chat, msg) => {
		const texto = `⚖️ *ATENDIMENTO PRESENCIAL A ADVOGADOS E OFICIAIS DE JUSTIÇA:*  
O atendimento ocorre das *08h às 17h*.

🕒 *Horário de almoço:* das *11h às 13h*.  
Durante esse período, o atendimento poderá sofrer atrasos em razão das movimentações internas e revezamento da equipe.

📌 *Importante:* Somente serão atendidos advogados e oficiais de justiça com documentação regular.`;
		
		await sendWithTyping(chat, msg.from, texto);
	},

	'52': async (chat, msg) => {
		const texto = `📞 *AGENDAMENTO DE TELEATENDIMENTO A ADVOGADOS:*  
Para realizar o agendamento, siga as instruções abaixo:

📧 Enviar e-mail para: *cdpsorocaba@sp.gov.br*  
🗂️ Arquivos devem estar em *PDF* (não envie links).  
📋 Utilize a planilha padrão do TJSP com a qualificativa do preso. No campo "observação", informe as *folhas a serem assinadas*.  
⏳ Aguarde a resposta com a data e hora do agendamento.

⚠️ *Observações Importantes:*  
- Os agendamentos serão realizados no *período da manhã* (à tarde, as salas são destinadas a teleaudiências dos Fóruns);  
- Enviar *cópia da OAB* e *Procuração*;  
- Limite de *05 presos por agendamento*;  
- Se não houver procuração assinada pelo preso, encaminhar o anexo para a *Supervisão da Unidade* no e-mail: *cdpsor@cdpsor.sap.sp.gov.br* para orientações.`;
		
		await sendWithTyping(chat, msg.from, texto);
	},

	'53': async (chat, msg) => {
		const texto = `📄 *BOLETINS, ATESTADOS E GRADES (ADVOGADOS):*  
Solicitações devem ser feitas por e-mail, com envio da *cópia da OAB* e *Procuração*.

📌 *Contatos específicos:*  
- *Boletim Informativo / Atestado de Conduta* (Setor SIMIC): *cimic@cdpsor.sap.sp.gov.br*  
- *Atestados / Grade de Remissão por Trabalho ou Estudo*: *trabalhoeducacao@cdpsor.sap.sp.gov.br*  
- *Outras solicitações gerais*: *cdpsor@cdpsor.sap.sp.gov.br*`;
		
		await sendWithTyping(chat, msg.from, texto);
	}
};

// Manipulador principal de mensagens
client.on("message", async (msg) => {
	if (!msg.from.endsWith('@c.us')) return;

	const chat = await msg.getChat();
	const messageBody = msg.body.toLowerCase();

	// Saudação inicial
	if (/\b(dia|tarde|noite|oi|Oi|olá|Olá|ola|Ola|oii|oie|preciso|informação|informacao|informação|ajuda)\b/i.test(messageBody)) {
		const contact = await msg.getContact();

		await sendWithTyping(chat, msg.from, `👋 *Olá! Sou o assistente virtual do Centro de Detenção Provisória de Sorocaba.*

⚠️ *Atenção:* Este WhatsApp opera em modo automático.  
Não acessamos as mensagens e não atendemos ligações realizadas via aplicativo.`);

		await sendWithTyping(chat, msg.from, getMenuPrincipal());
		return;
	}

	// Voltar para o menu
	if (messageBody === 'menu') {
		await sendWithTyping(chat, msg.from, getMenuPrincipal(), 2000);
		return;
	}

	// Opção 1 - Segurança
	if (messageBody === '1') {
		await sendWithTyping(chat, msg.from, `
📌 *Digite o número correspondente à opção desejada:*

10 - 📅 Calendário de Visitação  
11 - 👕 Vestuário para Visitantes  
12 - 🧾 Cadastro de Visitantes  
13 - 📦 Sedex e Cartas  
14 - 📞 Conexão Familiar
15 - 🪪 Consultar Carteirinha
16 - 👤 Consultar Detento
		`);
		return;
	}

	// Subopções da opção 1
	if (Object.keys(opcoesSeguranca).includes(messageBody)) {
		await opcoesSeguranca[messageBody](chat, msg);
		return;
	}

	// Opção 2 - Pecúlio
	if (messageBody === '2') {
		await sendWithTyping(chat, msg.from, `
💰 *PECÚLIO - Digite o número da opção desejada:*  

21 - 🧾 Depósito do Reeducando para Familiar  
22 - 🏛️ Retirada de Valores na Unidade Prisional (Pós Liberdade)  
23 - 🏦 Receber Depósito em Banco (Pós Liberdade)  
24 - 💳 Depósito via PIX
	`);
		return;
	}

	// Subopções da opção 2
	if (Object.keys(opcoesPeculio).includes(messageBody)) {
		await opcoesPeculio[messageBody](chat, msg);
		return;
	}

	// Opção 3 - SIMIC
	if (messageBody === '3') {
		await sendWithTyping(chat, msg.from, `
📑 *SIMIC - Digite o número da opção desejada:*

31 - 🏃‍♂️ Saída Temporária  
32 - 💰 Auxílio Reclusão (INSS)
	`);
		return;
	}

	// Subopções da opção 3
	if (Object.keys(opcoesSIMIC).includes(messageBody)) {
		await opcoesSIMIC[messageBody](chat, msg);
		return;
	}

	// Opção 4 - CRAS
	if (messageBody === '4') {
		await sendWithTyping(chat, msg.from, `
🏢 *CRAS - Digite o número da opção desejada:*  

41 - 👶 Reconhecimento de Paternidade  
42 - 🪦 Óbitos Familiares  
43 - 🧠 Assistência Social / Psicologia
	`);
		return;
	}

	// Subopções da opção 4
	if (Object.keys(opcoesCRAS).includes(messageBody)) {
		await opcoesCRAS[messageBody](chat, msg);
		return;
	}

	// Opção 5 - ADVOGADOS E OFICIAIS DE JUSTIÇA
	if (messageBody === '5') {
		await sendWithTyping(chat, msg.from, `
⚖️ *ADVOGADOS E OFICIAIS DE JUSTIÇA - Digite o número da opção desejada:*  

51 - 🏢 Atendimento Presencial  
52 - 📞 Agendamento de Teleatendimento  
53 - 📄 Boletins, Atestados e Grades
	`);
		return;
	}

	// Subopções da opção 5
	if (Object.keys(opcoesAdvOf).includes(messageBody)) {
		await opcoesAdvOf[messageBody](chat, msg);
		return;
	}

	// Opção 6 - Telefones e endereços
	if (messageBody === '6') {
		await sendWithTyping(chat, msg.from, `
📞 *TELEFONES E ENDEREÇO*

📱 *Telefones para contato*  
*(Antes de ligar, consulte as informações no menu do WhatsApp)*  
Telefone Principal: (15) 3335-2303  
Ao ligar, digite a opção desejada:  
1 - Rol de Visitas  
2 - Pecúlio  
3 - Serviço Social  
4 - Alvará/Cadastro  
5 - Recursos Humanos  
6 - Saúde  
7 - Teleaudiência  
8 - Finanças  
9 - Segurança e Disciplina  

📧 *E-mails funcionais:*  
• Rol de Visitas: roldevisitas@cdpsor.sap.sp.gov.br  
• Pecúlio: peculio@cdpsor.sap.sp.gov.br  
• Assistente Social: reintegracao@p2sorocaba.sap.sp.gov.br  
• CIMIC: cimic@cdpsor.sap.sp.gov.br  

📍 *Endereço:*  
Avenida Doutor Antônio de Souza Neto, 300  
Aparecidinha - Sorocaba/SP – CEP 18.087-210  
📌 Localização: https://goo.gl/maps/qCTQ2CBJs92mCYww5  

🌐 *Site da SAP:*  
https://www.sap.sp.gov.br/`);
return;		
	}

if (aguardandoCPF.has(msg.from) && /^\d{11}$/.test(messageBody)) {
	aguardandoCPF.delete(msg.from);

	try {
		// Executando a consulta e pegando o primeiro resultado diretamente
		const [rows] = await pool.execute(
			`SELECT Nome_Visi FROM visitantes_cad WHERE Cpf_Visi = ? AND AUTORIZA = 'A' AND Status_Visi = 'A' LIMIT 1`,
			[messageBody]
		);

		// Verificando se a consulta retornou um resultado
		if (rows.length > 0) {
			const nome = rows[0].Nome_Visi ?? 'Visitante'; // Acessando diretamente o nome
			await sendWithTyping(chat, msg.from, `✅ *Carteirinha encontrada!*  
👤 *Nome:* ${nome}  
📄 *Situação:* Emitida e autorizada para visitação.`);
		} else {
			await sendWithTyping(chat, msg.from, `⚠️ *Nenhuma carteirinha autorizada foi encontrada com esse CPF.*  
Verifique se o cadastro foi realizado corretamente ou aguarde a liberação.`);
		}
	} catch (err) {
		// Log detalhado do erro
		console.error('Erro ao consultar carteirinha:', err);
		await sendWithTyping(chat, msg.from, '❌ Ocorreu um erro ao consultar a carteirinha. Tente novamente mais tarde.');
	}

	return;
}

// Realiza a consulta no banco se o preso ainda está na unidade.
if (aguardandoMatricula.has(msg.from) && /^\d{5,10}$/.test(messageBody)) {
	aguardandoMatricula.delete(msg.from);

	try {
		// Ajuste os nomes das colunas e tabela conforme sua base de dados
		const [rows] = await pool.execute(
			`SELECT Pav_Cel, Cela_Cel FROM celas 
			 WHERE LEFT(Matric_Cel, LENGTH(Matric_Cel) - 1) = ? 
			 AND Dl_Cel = '+' AND Fim_Cel IS NULL 
			 LIMIT 1`,
			[messageBody]
		      );

		if (rows.length > 0) {
			const preso = rows[0];
				await sendWithTyping(chat, msg.from, `✅ *Detento encontrado:*   
 📌 *Ala:* ${preso.Pav_Cel}  
 📌 *Cela:* ${preso.Cela_Cel}`);
		} else {
			await sendWithTyping(chat, msg.from, `⚠️ *Detento não encontrado na unidade.*  
Verifique se a matrícula está correta ou se o sentenciado foi transferido.`);
		}
	} catch (err) {
		console.error('Erro ao consultar sentenciado:', err);
		await sendWithTyping(chat, msg.from, '❌ Ocorreu um erro ao consultar o sentenciado. Tente novamente mais tarde.');
	}

	return;
}

	
		

	// Resposta padrão para mensagens não reconhecidas
	await sendWithTyping(chat, msg.from, `❌ Não entendi sua mensagem.  
Digite *menu* para acessar o menu principal.
Lembrando que este whatsapp *NÃO ATENDE LIGAÇÕES*, pois opera de forma automatizada!`);

});
