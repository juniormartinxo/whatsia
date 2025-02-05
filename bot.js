const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("node:fs");

console.log("Iniciando configuração do cliente WhatsApp...");

// Configuração do cliente
const client = new Client({
	authStrategy: new LocalAuth({ clientId: "bot-whatsapp" }),
	puppeteer: {
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage",
			"--disable-gpu",
			"--disable-extensions",
		],
		executablePath: "/usr/bin/chromium-browser",
	},
});

// Log para depuração de estados
client.on("loading_screen", (percent, message) => {
	console.log(`Carregando: ${percent}% - ${message}`);
});

// Evento do QR Code usando qrcode-terminal
client.on("qr", (qr) => {
	console.log("QR RECEIVED", qr);
	qrcode.generate(qr, { small: true }, (qrcode) => {
		console.log(qrcode);
	});
});

// Evento de autenticação bem-sucedida
client.on("authenticated", () => {
	console.log("AUTHENTICATED");
});

// Evento de falha na autenticação
client.on("auth_failure", (msg) => {
	console.error("AUTHENTICATION FAILURE", msg);
});

// Evento de pronto
client.on("ready", async () => {
	console.log("Client is ready!");
	try {
		const chats = await client.getChats();

		//console.log(JSON.stringify(chats, null, 2));
		const jsonString = JSON.stringify(chats, null, 2);

		fs.writeFileSync("chats.txt", jsonString, "utf8");

		console.log("Arquivo salvo como chats.txt!");

		//const groups = chats.filter((chat) => chat.id.user.includes("-"));
		const groups = chats.filter((chat) => chat.id.user.length > 15);

		console.log("\nGrupos disponíveis:");
		for (const group of groups) {
			console.log(`Nome: ${group.name}`);
			console.log(`ID: ${group.id._serialized}`);
			console.log("-------------------");
		}
	} catch (err) {
		console.error("Erro ao listar grupos:", err);
	}
});

// Monitoramento de mensagens (todas para teste)
client.on("message_create", async (msg) => {
	processMessage(msg);
});

// Inicialização com tratamento de erro
console.log("Tentando inicializar o cliente...");
client.initialize().catch((err) => {
	console.error("Erro na inicialização:", err);
});

// Tratamento de erros não capturados
process.on("uncaughtException", (err) => {
	console.log("Erro não capturado:", err);
});

process.on("unhandledRejection", (err) => {
	console.log("Promise rejection não tratada:", err);
});

function isGroupMessage(message) {
	return message._data.to.includes('@g.us') || message._data.id.remote.includes('@g.us');
}
  
function processMessage(message) {
    const { _data } = message;

    // Verifica se a mensagem é de um grupo
    const isGroupMessage = _data.to.endsWith("@g.us");

    if (isGroupMessage) {
        const groupId = _data.to; // ID do grupo
        const messageText = _data.body; // Texto da mensagem
        const sender = _data.author || _data.from; // Quem enviou a mensagem no grupo

        console.log("Mensagem de grupo recebida!");
        console.log("ID do Grupo:", groupId);
        console.log("Mensagem:", messageText);
        console.log("Enviado por:", sender);
    } else {
        console.log("Mensagem privada recebida.");
		console.log("De:", _data.from);
		console.log("Mensagem:", _data.body);
    }
}