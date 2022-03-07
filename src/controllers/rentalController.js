import dayjs from "dayjs";
import connection from "../db.js";

export async function getRentals(req, res) {
  const { customerId, gameId } = req.query;

  let searchClients = "";
  if (customerId) {
    searchClients = sqlstring.format(`WHERE id = ?`, customerId);
  }

  let searchGame = "";
  if (gameId) {
    searchGame = sqlstring.format(`WHERE id = ?`, gameId);
  }

  try {
    // falta finalizar seleção
    const resultRentals = await connection.query(`
            SELECT *
            FROM rentals
                JOIN customers ON rentals."customerId" = customers.id
                JOIN games ON rentals."gameId" = games.id
            `);
    const rentals = resultRentals.rows;

    res.status(200).send(rentals);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function createRental(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const rentDate = dayjs().format("YYYY-MM-DD");
  const returnDate = null;
  const delayFee = null;

  if (daysRented <= 0) {
    return res.sendStatus(400);
  }

  try {
    const resultClient = await connection.query(
      "SELECT * FROM customers WHERE id = $1",
      [customerId]
    );
    const clientExist = resultClient.rows.length;

    const resultGame = await connection.query(
      "SELECT * FROM games WHERE id = $1",
      [gameId]
    );
    const gameExist = resultGame.rows.length;

    if (!gameExist || !clientExist) {
      return res.sendStatus(400);
    }

    const { pricePerDay, stockTotal } = resultGame.rows[0];
    const originalPrice = pricePerDay * daysRented;

    const resultRentalsGame = await connection.query(
      `
        SELECT * FROM rentals 
        JOIN games ON rentals."gameId" = games.id
        WHERE games.id = $1
        `,
      [gameId]
    );
    const rentalsGame = resultRentalsGame.rows.length;

    if (rentalsGame >= stockTotal) {
      return res.sendStatus(400);
    }

    await connection.query(
      `INSERT INTO rentals 
      ("customerId", "gameId", "rentDate", "daysRented", 
      "returnDate", "originalPrice", "delayFee")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
      ]
    );

    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function finishRental(req, res) {
  const { id } = req.params;
  const returnDate = dayjs().format("YYYY-MM-DD");

  try {
    const resultRental = await connection.query(
      "SELECT * FROM rentals WHERE id = $1",
      [id]
    );
    const rentalExist = resultRental.rows.length;

    if (!rentalExist) {
      return res.sendStatus(404);
    }

    const { rentDate, daysRented } = resultRental.rows[0];

    const rentDateFormat = dayjs(rentDate).format("YYYY-MM-DD");
    console.log(rentDateFormat);
    console.log(returnDate);
    //diff problem
    rentDateFormat.diff(returnDate, "day");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function deleteRental(req, res) {
  const { id } = req.params;

  try {
    const resultRental = await connection.query(
      "SELECT * FROM rentals WHERE id = $1",
      [id]
    );
    const rentalExist = resultRental.rows.length;

    if (!rentalExist) {
      return res.sendStatus(404);
    }

    const { returnDate } = resultRental.rows[0];

    if (returnDate !== null) {
      res.sendStatus(400);
    }

    await connection.query("DELETE FROM rentals WHERE id = $1", [id]);

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  }
}
