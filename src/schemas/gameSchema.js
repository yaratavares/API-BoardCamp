import joi from "joi";

const gameSchema = joi.object({
  name: joi.string().allow("").required(),
  image: joi.string().uri().required(),
  stockTotal: joi.string().required(),
  categoryId: joi.number().required(),
  pricePerDay: joi.string().required(),
});

export default gameSchema;
