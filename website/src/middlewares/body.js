const express = require('express');

module.exports = [express.json(), express.urlencoded({ extended: true })];
