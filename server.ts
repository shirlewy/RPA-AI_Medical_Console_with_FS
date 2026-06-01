import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

function isValidWebhook(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  app.post("/api/webhook/proxy", async (req, res) => {
    try {
      const { url, payload } = req.body;
      const targetUrl = process.env.FEISHU_WEBHOOK_URL || url;

      if (!targetUrl) {
        return res.status(400).json({ error: "Missing webhook url" });
      }

      if (!isValidWebhook(targetUrl)) {
        return res.status(400).json({ error: "Invalid webhook url" });
      }

      const mappedPayload = payload?.msgtype === "text" && payload?.text?.content
        ? { msg_type: "text", content: { text: payload.text.content } }
        : payload;

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mappedPayload)
      });
      
      const responseData = await response.text();
      res.status(response.status).send(responseData);
    } catch (error: any) {
      console.error("[PROXY ERROR]", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
