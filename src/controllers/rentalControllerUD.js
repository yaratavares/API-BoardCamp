import dayjs from "dayjs";
import connection from "../db.js";

export async function finishRental(req, res) {
  const { id } = req.params;
  const returnDateFinish = dayjs().format("YYYY-MM-DD");

  try {
    const resultRental = await connection.query(
      `
        SELECT * FROM rentals
          JOIN games ON rentals."gameId" = games.id
        WHERE rentals.id = $1`,
      [id]
    );
    const rentalExist = resultRental.rows.length;

    if (!rentalExist) {
      return res.sendStatus(404);
    }

    const { rentDate, daysRented, returnDate, pricePerDay } =
      resultRental.rows[0];

    if (returnDate !== null) {
      return res.sendStatus(400);
    }

    const diffDates = dayjs(rentDate).diff(dayjs(returnDateFinish), "day");

    let delayFee = 0;
    if (daysRented < diffDates) {
      delayFee = (diffDates - daysRented) * pricePerDay;
    }

    await connection.query(
      `
        UPDATE rentals 
          SET "delayFee" = $1 , "returnDate" = $2
        WHERE id = $3
      `,
      [delayFee, returnDateFinish, id]
    );

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
      return res.sendStatus(400);
    }

    await connection.query("DELETE FROM rentals WHERE id = $1", [id]);

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err);
  }
}
