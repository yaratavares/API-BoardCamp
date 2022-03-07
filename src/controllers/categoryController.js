import connection from "../db.js";

export async function getCategory(req, res) {
  try {
    const resultCategories = await connection.query("SELECT * FROM categories");
    const categories = resultCategories.rows;
    res.status(200).send(categories);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function createCategory(req, res) {
  const { name } = req.body;

  try {
    const resultcategory = await connection.query(
      "SELECT * FROM categories WHERE name = $1",
      [name]
    );
    const categoryExist = resultcategory.rows.length;

    if (categoryExist) {
      return res.sendStatus(409);
    }

    await connection.query("INSERT INTO categories (name) VALUES ($1)", [name]);
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
}
