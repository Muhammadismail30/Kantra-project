const User = require('./User');
const Board = require('./Board');
const Column = require('./Column');
const Card = require('./Card');

// Relasi User -> Board
User.hasMany(Board, { foreignKey: 'owner_id' });
Board.belongsTo(User, { foreignKey: 'owner_id' });

User.belongsToMany(Board, { 
    through: 'BoardMembers', 
    foreignKey: 'user_id',
    as: 'SharedBoards' // Opsional untuk penamaan
});

Board.belongsToMany(User, { 
    through: 'BoardMembers', 
    foreignKey: 'board_id',
    as: 'Users'
});

// Relasi Board -> Column
Board.hasMany(Column, { foreignKey: 'board_id' });
Column.belongsTo(Board, { foreignKey: 'board_id' });

// Relasi Column -> Card
Column.hasMany(Card, { foreignKey: 'column_id' });
Card.belongsTo(Column, { foreignKey: 'column_id' });

module.exports = { User, Board, Column, Card };