import joi from "joi";

const categorySchema = joi.object({
  name: joi.string().allow("").required(),
});

export default categorySchema;
