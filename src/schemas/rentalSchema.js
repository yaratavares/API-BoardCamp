import joi from "joi";

const rentalSchema = joi.object({
  customerId: joi.number().required(),
  gameId: joi.number().required(),
  rentDate: joi.string().required(),
  daysRented: joi.number().required(),
  returnDate: joi.number().required(), // null or string
  originalPrice: joi.number().required(),
  delayFee: joi.number().required(), // null or string
});

export default rentalSchema;
