/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('User', {
    Id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    FirstName: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    LastName: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    Mobile: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    CreatedBy: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    CreateOn: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    ModifiedBy: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ModifiedOn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ActiveFlag: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    Role: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'User'
  });
};
