import SqlString from "sqlstring";
import connection from "../db.js";

export async function getGames(req, res) {
  const { name } = req.query;

  let searchName = "";
  if (name) {
    searchName = SqlString.format(`WHERE games.name ILIKE ?`, name + "%");
  }

  try {
    const resultGames = await connection.query(
      `SELECT games.*, categories.name AS "categoryName" FROM games 
            JOIN categories ON categories.id = games."categoryId"
            ${searchName}`
    );
    const games = resultGames.rows;
    res.status(200).send(games);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function createGame(req, res) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

  if (!name) {
    return res.sendStatus(400);
  }

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
      [name, image, parseInt(stockTotal), categoryId, parseInt(pricePerDay)]
    );
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
}
