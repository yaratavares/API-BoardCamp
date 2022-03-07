import sqlstring from "sqlstring";
import connection from "../db.js";

export async function getGames(req, res) {
  const { name, offset, limit, order, desc } = req.query;

  let searchName = "";
  if (name) {
    searchName = sqlstring.format(`WHERE games.name ILIKE ?`, name + "%");
  }

  let setOffset = "";
  if (offset) {
    setOffset = sqlstring.format(`OFFSET ?`, [offset]);
  }

  let setLimit = "";
  if (limit) {
    setLimit = sqlstring.format(`LIMIT ?`, [limit]);
  }

  const orderByFilter = {
    id: 1,
    name: 2,
    image: 3,
    stockTotal: 4,
    categoryId: 5,
    pricePerDay: 6,
  };

  let setOrder = "";
  if (orderByFilter[order] && !desc) {
    setOrder = sqlstring.format(`ORDER BY ${orderByFilter[order]}`);
  }

  if (orderByFilter[order] && desc) {
    setOrder = sqlstring.format(`ORDER BY ${orderByFilter[order]} DESC`);
  }

  try {
    const resultGames = await connection.query(
      `SELECT games.*, categories.name AS "categoryName" FROM games 
        JOIN categories ON categories.id = games."categoryId"
        ${searchName}
        ${setOffset}
        ${setLimit}
        ${setOrder}
        `
    );
    const games = resultGames.rows;
    res.status(200).send(games);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function createGame(req, res) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

  try {
    const resultCategory = await connection.query(
      "SELECT * FROM categories WHERE id = $1",
      [categoryId]
    );
    const categoryExist = resultCategory.rows.length;

    if (!categoryExist) {
      return res.sendStatus(400);
    }

    await connection.query(
      `INSERT INTO games 
        (name, image, "stockTotal", "categoryId", "pricePerDay") 
            VALUES ($1, $2, $3, $4, $5)`,
      [
        name,
        image,
        parseInt(stockTotal),
        categoryId,
        parseInt(pricePerDay) * 100,
      ]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
}
