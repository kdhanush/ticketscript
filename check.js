require("dotenv").config();
const https = require("https");
const notifier = require("node-notifier");

const url = "https://rcbscaleapi.ticketgenie.in/ticket/eventlist/O";

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

function sendTelegram(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const data = JSON.stringify({
        chat_id: CHAT_ID,
        text: message
    });

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length
        }
    };

    const req = https.request(url, options, (res) => {
        res.on("data", () => {});
    });

    req.on("error", (err) => {
        console.error("Telegram error:", err);
    });

    req.write(data);
    req.end();
}

function check() {
    https.get(url, (res) => {
        let data = "";

        res.on("data", chunk => data += chunk);

        res.on("end", () => {
            try {
                const json = JSON.parse(data);

                if (json.status === "Success" && json.result.length > 1) {
                    console.log("🔥 Tickets available!", json.result);
                    console.log(json.result);
                    sendTelegram(`🔥 Tickets Live!\n\n${JSON.stringify(json.result, null, 2)}`);
                    notifier.notify({
                        title: "Tickets Available 🎟️",
                        message: "RCB tickets are live!",
                        sound: false,
                        wait: true
                    });
                    process.exit();
                } else {
                    console.log("No tickets yet...")
                }
            } catch (e) {
                console.error("Error parsing JSON", e);
            }
        });
    });
}

setInterval(check, 3000);