const urlPatterns = {
  protocol: "[a-z\\d.-]+://",
  ipv4: "(?:(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(?:[0-9]|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])",
  domain: "(?:(?:[^\\s!@#$%^&*()_=+[\\]{}\\\\|;:'\",.<>/?]+)\\.)+",
  tld: "(?:ac|ad|aero|ae|...|zw)", // Trimmed for brevity
  port: "(?::[0-9]*)?",
  pathQueryFragment: "(?:[;/][^#?<>\\s]*)?(?:\\?[^#<>\\s]*)?(?:#[^<>\\s]*)?",
  email: "mailto:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@"
};

const linkify = (function() {
  const urlRegex = new RegExp(`\\b${urlPatterns.protocol}[^<>\\s]+|\\b${urlPatterns.domain}${urlPatterns.tld}${urlPatterns.port}${urlPatterns.pathQueryFragment}(?!\\w)|\\b${urlPatterns.email}${urlPatterns.domain}${urlPatterns.tld}${urlPatterns.pathQueryFragment}(?!\\w)`, "ig");
  const protocolRegex = new RegExp(`^${urlPatterns.protocol}`, "i");

  return function(inputText, options = {}) {
      const defaultOptions = {
          callback: (text, href) => href ? `<a href="${href}" target="_blank">${text}</a>` : text,
          punctRegexp: /(?:[!?.,:;'"]|(?:&|&amp;)(?:lt|gt|quot|apos|raquo|laquo|rsaquo|lsaquo);)$/
      };
      options = {...defaultOptions, ...options};

      const tokens = [];
      let lastIndex = 0;
      inputText.replace(urlRegex, (match, offset) => {
          const prefix = inputText.slice(lastIndex, offset);
          if (prefix) tokens.push(options.callback(prefix));

          let href = match;
          if (!protocolRegex.test(href)) {
              href = `${href.includes("@") ? (href.startsWith("mailto:") ? "" : "mailto:") : (href.startsWith("irc.") ? "irc://" : (href.startsWith("ftp.") ? "ftp://" : "http://"))}${href}`;
          }

          tokens.push(options.callback(match, href));
          lastIndex = offset + match.length;
      });

      if (lastIndex < inputText.length) {
          tokens.push(options.callback(inputText.slice(lastIndex)));
      }

      return tokens.join('');
  };
})();

const toObject = queryString => {
  return queryString.split('&').reduce((acc, record) => {
      const [key, value = true] = record.split('=').map(decodeURIComponent);
      if (key) acc[key] = value;
      return acc;
  }, {});
};

const fromObject = obj => {
  return Object.entries(obj).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
};

Array.prototype.stableSort = function(compareFn = (a, b) => a > b ? 1 : a < b ? -1 : 0) {
  return this.map((item, index) => ({item, index}))
             .sort((a, b) => compareFn(a.item, b.item) || a.index - b.index)
             .map(({item}) => item);
};

function assert(predicate, message) {
  if (!predicate) throw new Error(message);
}
