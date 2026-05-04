const zlib = require("zlib");

const COMPRESSIBLE_TYPES = /json|text|javascript|xml|svg|css|html/i;
const MIN_SIZE = 1024;

function compressionMiddleware(options = {}) {
  const threshold = options.threshold ?? MIN_SIZE;
  const preferBrotli = options.brotli !== false;

  return (req, res, next) => {
    const acceptEncoding = req.headers["accept-encoding"] || "";
    const useBrotli = preferBrotli && acceptEncoding.includes("br");
    const useGzip = acceptEncoding.includes("gzip");

    if (!useBrotli && !useGzip) return next();

    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);
    let compressor = null;
    let headersSent = false;

    function maybeCompress() {
      if (headersSent) return false;
      const contentType = res.getHeader("Content-Type") || "";
      const contentLength = res.getHeader("Content-Length");
      if (!COMPRESSIBLE_TYPES.test(contentType)) return false;
      if (contentLength && Number(contentLength) < threshold) return false;

      res.removeHeader("Content-Length");
      if (useBrotli) {
        res.setHeader("Content-Encoding", "br");
        compressor = zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } });
      } else {
        res.setHeader("Content-Encoding", "gzip");
        compressor = zlib.createGzip({ level: zlib.constants.Z_DEFAULT_COMPRESSION });
      }
      compressor.on("data", (chunk) => originalWrite(chunk));
      compressor.on("end", () => originalEnd());
      res.setHeader("Vary", "Accept-Encoding");
      headersSent = true;
      return true;
    }

    res.write = function (chunk, encoding, callback) {
      if (maybeCompress()) {
        return compressor.write(chunk, encoding, callback);
      }
      return originalWrite(chunk, encoding, callback);
    };

    res.end = function (chunk, encoding, callback) {
      if (maybeCompress()) {
        if (chunk) compressor.write(chunk, encoding);
        return compressor.end();
      }
      return originalEnd(chunk, encoding, callback);
    };

    next();
  };
}

module.exports = { compressionMiddleware };
