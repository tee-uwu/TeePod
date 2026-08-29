import app from "./app.js";

const PORT = Number(process.env.PORT) || 8787;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TeePod API server listening on http://0.0.0.0:${PORT}`);
});
