import sqlstring from "sqlstring";
import connection from "../db.js";

export async function getClients(req, res) {
  const { cpf } = req.query;

  let searchClients = "";
  if (cpf) {
    searchClients = sqlstring.format(`WHERE cpf LIKE ?`, cpf + "%");
  }

  try {
    const resultClients = await connection.query(
      `SELECT * FROM customers 
        ${searchClients}`
    );
    const clients = resultClients.rows;
    res.status(200).send(clients);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function getClient(req, res) {
  const { id } = req.params;

  if (!id) {
    return res.sendStatus(400);
  }

  try {
    const resultClient = await connection.query(
      "SELECT * FROM customers WHERE id = $1",
      [id]
    );
    const clientExist = resultClient.rows;

    if (!clientExist.length) {
      return res.sendStatus(404);
    }

    res.status(200).send(clientExist[0]);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function createClient(req, res) {
  const { name, phone, cpf, birthday } = req.body;

  try {
    const resultClient = await connection.query(
      "SELECT * FROM customers WHERE cpf = $1",
      [cpf]
    );
    const clientExist = resultClient.rows.length;
    console.log(birthday);
    if (clientExist) {
      return res.sendStatus(409);
    }

    await connection.query(
      `INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)`,
      [name, phone, cpf, birthday]
    );

    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function updateClient(req, res) {
  const { name, phone, cpf, birthday } = req.body;
  const { id } = req.params;

  if (!id) {
    return res.sendStatus(404);
  }

  try {
    const resultClient = await connection.query(
      "SELECT * FROM customers WHERE id = $1",
      [id]
    );
    const clientExist = resultClient.rows.length;

    if (!clientExist) {
      return res.sendStatus(404);
    }

    const resultClientCpf = await connection.query(
      "SELECT * FROM customers WHERE cpf = $1 AND id NOT IN ($2)",
      [cpf, id]
    );
    const clientCpfExist = resultClientCpf.rows.length;

    if (clientCpfExist) {
      return res.sendStatus(409);
    }

    await connection.query(
      `UPDATE customers
        SET name = $1, phone = $2, cpf = $3, birthday = $4
        WHERE id = $5`,
      [name, phone, cpf, birthday, id]
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  }
}
