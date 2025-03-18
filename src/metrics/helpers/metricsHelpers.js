const config = require("../../config");

const sourceAttribute = {
  key: "source",
  value: { stringValue: config.grafana.source },
};

module.exports = {
  sourceAttribute,
};
