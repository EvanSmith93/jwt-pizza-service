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

const getHttpMetrics = () => {
  return {
    metrics: Object.entries(requests).map(([key, value]) => ({
      name: "requests",
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
  };
};

module.exports = {
  trackRequests,
  getHttpMetrics,
};
