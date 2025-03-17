const config = require("../config");

const requests = {};

const trackRequests = (req, res, next) => {
  res.on("finish", () => {
    if (req.method === "OPTIONS") return;
    if (!req.baseUrl) return;

    const baseUrl = req.baseUrl;
    const routePath = req.route ? req.route.path : "";
    let fullPath = baseUrl + routePath;

    if (fullPath.length > 1 && fullPath.endsWith("/")) {
      fullPath = fullPath.slice(0, -1);
    }

    const routeName = `${req.method} ${fullPath}`;
    requests[routeName] = (requests[routeName] ?? 0) + 1;
  });

  next();
};

const sendMetrics = async (metricName) => {
  const metrics = {
    resourceMetrics: [
      {
        scopeMetrics: [
          {
            metrics: Object.entries(requests).map(([key, value]) => ({
              name: metricName,
              unit: "1",
              sum: {
                dataPoints: [
                  {
                    asInt: value,
                    timeUnixNano: Date.now() * 1000000,
                    attributes: [
                      {
                        key: "method",
                        value: { stringValue: key.split(" ")[0] },
                      },
                      {
                        key: "endpoint",
                        value: { stringValue: key.split(" ")[1] },
                      },
                      {
                        key: "source",
                        value: { stringValue: config.grafana.source },
                      },
                    ],
                  },
                ],
                aggregationTemporality: "AGGREGATION_TEMPORALITY_CUMULATIVE",
                isMonotonic: true,
              },
            })),
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(config.grafana.url, {
      method: "POST",
      body: JSON.stringify(metrics),
      headers: {
        Authorization: `Bearer ${config.grafana.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to push metrics data to Grafana", response.error);
    }
  } catch (error) {
    console.error("Error pushing metrics:", error);
  }
};

setInterval(() => sendMetrics("requests"), 5000);

module.exports = {
  trackRequests,
};
