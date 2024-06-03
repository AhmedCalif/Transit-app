import { Sequelize, Model, DataTypes } from 'sequelize';
import sequelize from './dbconnection.js';

// Define User model
class User extends Model {}

User.init({
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true
  });
  
// Define FavoriteRoute model
class FavoriteRoute extends Model {}

FavoriteRoute.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  startLocation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  endLocation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'userId'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
}, {
  sequelize,
  modelName: 'FavoriteRoute'
});

User.hasMany(FavoriteRoute, { foreignKey: 'userId' });
FavoriteRoute.belongsTo(User, { foreignKey: 'userId' });

// Define DirectionsRequest model
class DirectionsRequest extends Model {}

DirectionsRequest.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  startLocation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  endLocation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'userId'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
}, {
  sequelize,
  modelName: 'DirectionsRequest'
});

User.hasMany(DirectionsRequest, { foreignKey: 'userId' });
DirectionsRequest.belongsTo(User, { foreignKey: 'userId' });

export { User, FavoriteRoute, DirectionsRequest, sequelize };
