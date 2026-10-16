// Sequelize instances returned through our plain interfaces carry internal
// fields (dataValues, _changed, ...) that must never reach JSON responses.
// This strips them while keeping the object's public shape intact.
export const plain = <T>(row: T): T =>
  JSON.parse(JSON.stringify(row)) as T;
