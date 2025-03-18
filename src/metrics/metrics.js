const config = require("../config");
const { getHttpMetrics } = require("./httpMetrics");
const { getSystemMetrics } = require("./systemMetrics");

const sendMetrics = async () => {
  try {
    const metrics = {
      resourceMetrics: [
        {
          scopeMetrics: [getHttpMetrics(), getSystemMetrics()],
        },
      ],
    };

    const response = await fetch(config.grafana.url, {
      method: "POST",
      body: JSON.stringify(metrics),
      headers: {
        Authorization: `Bearer ${config.grafana.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to push metrics data to Grafana", response);
    }
  } catch (error) {
    console.error("Error pushing metrics:", error);
  }
};

const periodicallySendMetrics = () => {
  setInterval(sendMetrics, 5000);
};

module.exports = {
  periodicallySendMetrics,
};
