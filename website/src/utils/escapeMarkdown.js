module.exports = string => string.replace(/<|>|@|!|#|&|:|_|\*|~|`|\||\\/g, '\\$&');
