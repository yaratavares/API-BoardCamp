import dayjs from "dayjs";
import sqlstring from "sqlstring";
import connection from "../db.js";

export async function getRentals(req, res) {
  const { customerId, gameId, offset, limit, order, desc, status, startDate } =
    req.query;

  let searchClients = "";
  if (customerId && !gameId) {
    searchClients = sqlstring.format(
      `WHERE rentals."customerId" = ?`,
      customerId
    );
  }

  let searchGame = "";
  if (gameId && !customerId) {
    searchGame = sqlstring.format(`WHERE rentals."gameId" = ?`, gameId);
  }

  if (gameId && customerId) {
    searchGame = sqlstring.format(
      `WHERE rentals."gameId" = ? AND rentals."customerId" = ? `,
      [gameId, customerId]
    );
  }

  if (dayjs(startDate).isValid()) {
    if (searchGame.length === 0) {
      searchGame = sqlstring.format("WHERE ");
    } else {
      searchGame += sqlstring.format("AND ");
    }

    searchGame += sqlstring.format(`rentals."rentDate" >= ?`, [startDate]);
  }

  if (status === "open" || status === "closed") {
    if (searchGame.length === 0) {
      searchGame = sqlstring.format("WHERE ");
    } else {
      searchGame += sqlstring.format("AND ");
    }

    if (status === "closed") {
      searchGame += sqlstring.format(`rentals."returnDate" IS NULL`);
    }

    if (status === "open") {
      searchGame += sqlstring.format(`rentals."returnDate" IS NOT NULL`);
    }
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
    customerId: 2,
    gameId: 3,
    rentDate: 4,
    daysRented: 5,
    returnDate: 6,
    originalPrice: 7,
    delayFee: 8,
  };

  let setOrder = "";
  if (orderByFilter[order] && !desc) {
    setOrder = sqlstring.format(`ORDER BY ${orderByFilter[order]}`);
  }

  if (orderByFilter[order] && desc) {
    setOrder = sqlstring.format(`ORDER BY ${orderByFilter[order]} DESC`);
  }

  try {
    const resultRentals = await connection.query({
      text: `SELECT rentals.*, customers.id AS "idCustomer", 
              customers.name AS "nameCustomer", games.id AS "idGame", 
              games.name AS "gameName", games."categoryId", 
              categories.name AS "categoryName"
            FROM rentals
              JOIN customers ON rentals."customerId" = customers.id
              JOIN games ON rentals."gameId" = games.id
              JOIN categories ON games."categoryId" = categories.id
            ${searchClients} ${searchGame} 
            ${setOffset} ${setLimit} 
            ${setOrder}`,
      rowMode: "array",
    });

    const rentals = resultRentals.rows.map((row) => {
      const [
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        idCostumer,
        nameCustomer,
        idGame,
        gameName,
        categoryId,
        categoryName,
      ] = row;

      return {
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        customer: { id: idCostumer, name: nameCustomer },
        game: { id: idGame, name: gameName, categoryId, categoryName },
      };
    });

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
