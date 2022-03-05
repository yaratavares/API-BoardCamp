import joi from "joi";

const categorySchema = joi.object({
  name: joi.required().allow("").invalid("undefined", null),
});

export default categorySchema;
