'use strict';

const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          ends(toCheck) {
            if (!toCheck.endsWith('@wolox.com') && !toCheck.endsWith('@wolox.com.ar')) {
              throw new Error('E-mail does not belong to Wolox');
            }
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        isAlphanumeric: true,
        validate: {
          notEmpty: true,
          len: {
            args: [8, 255],
            msg: 'Password length is at least 8 characters with 32 characters maximum.'
          }
        }
      },
      isadmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      timestamps: false,
      hooks: {
        afterValidate: (users, options) => {
          const aux = bcrypt.hashSync(users.password, bcrypt.genSaltSync(8), null);
          users.password = aux;
        }
      }
    }
  );
  return users;
};
