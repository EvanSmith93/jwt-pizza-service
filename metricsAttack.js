const config = require("./src/config");

function sendMetric2Grafana(metrics) {
  // console.log(metrics);
  const metric = {
    resourceMetrics: [
      {
        resource: {
          attributes: [
            { key: "source", value: { stringValue: config.metrics.source } },
          ],
        },
        scopeMetrics: [
          {
            metrics: metrics,
          },
        ],
      },
    ],
  };

  fetch("https://otlp-gateway-prod-us-east-2.grafana.net/otlp/v1/metrics", {
    method: "POST",
    body: JSON.stringify(metric),
    headers: {
      Authorization: `Bearer [TOKEN]`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Failed to push metrics data to Grafana");
        console.log(response);
      } else {
        console.log(`Pushed metrics`);
      }
    })
    .catch((error) => {
      console.error("Error pushing metrics:", error);
    });
}

function latencyMetrics(metrics) {
  const avgLatency = Math.floor(999999999999 * Math.random());
  metrics.push({
    name: "latency",
    unit: "ms",
    gauge: {
      dataPoints: [
        {
          asInt: avgLatency,
          timeUnixNano: Date.now() * 1000000,
          attributes: [
            { key: "source", value: { stringValue: config.metrics.source } },
          ],
        },
      ],
    },
  });
}

setInterval(() => {
  try {
    const metrics = [];
    latencyMetrics(metrics);
    sendMetric2Grafana(metrics);
  } catch (error) {
    console.log(error);
  }
}, 50);