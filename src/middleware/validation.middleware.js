function validate(schema, source = "body") {
  return (req, res, next) => {
    const target = req[source];
    const result = schema.safeParse(target);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
