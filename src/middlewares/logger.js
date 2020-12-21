const logger = (req, res, next) => {
  const { method, originalUrl } = req;
  const date = new Date();

  console.log(`${method} ${originalUrl} - ${date}`);

  next();
};

module.exports = logger;