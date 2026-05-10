const pool = require("../db/pool");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const mapSqlError = (error) => {
  if (error && (error.code === "ER_SIGNAL_EXCEPTION" || error.sqlState === "45000")) {
    return { status: 409, message: error.sqlMessage || "Constraint conflict detected" };
  }
  if (error && error.code === "ER_DUP_ENTRY") {
    return { status: 409, message: "Duplicate value violates unique constraint" };
  }
  if (error && error.code === "ER_NO_REFERENCED_ROW_2") {
    return { status: 400, message: "Referenced record does not exist" };
  }
  return { status: 500, message: "Internal database error" };
};

const makeCrudController = (table, idField, allowedFields) => ({
  getAll: asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(`SELECT * FROM ${table}`);
    res.json(rows);
  }),
  getById: asyncHandler(async (req, res) => {
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: `${table} not found` });
    res.json(rows[0]);
  }),
  create: asyncHandler(async (req, res) => {
    const data = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    });
    const [result] = await pool.query(`INSERT INTO ${table} SET ?`, [data]);
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  }),
  update: asyncHandler(async (req, res) => {
    const data = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) data[f] = req.body[f];
    });
    const [result] = await pool.query(`UPDATE ${table} SET ? WHERE ${idField} = ?`, [data, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: `${table} not found` });
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [req.params.id]);
    res.json(rows[0]);
  }),
  remove: asyncHandler(async (req, res) => {
    const [result] = await pool.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: `${table} not found` });
    res.json({ message: `${table} deleted successfully` });
  })
});

module.exports = { asyncHandler, mapSqlError, makeCrudController, pool };
