'use strict';

module.exports = (sequelize, DataTypes) => {
  const albums = sequelize.define(
    'albums',
    {
      id: {
        primaryKey: true,
        allowNull: false,
        notEmpty: true,
        type: DataTypes.INTEGER
      },
      userid: {
        primaryKey: true,
        allowNull: false,
        notEmpty: true,
        type: DataTypes.INTEGER
      },
      title: {
        allowNull: false,
        notEmpty: true,
        type: DataTypes.STRING
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      timestamps: false
    }
  );
  return albums;
};
