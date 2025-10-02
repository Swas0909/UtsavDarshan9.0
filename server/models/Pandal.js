const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pandal = sequelize.define('Pandal', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: false
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  visitingHours: {
    type: DataTypes.STRING
  },
  crowdLevel: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Low'
  },
  established: {
    type: DataTypes.INTEGER
  }
});

module.exports = Pandal;