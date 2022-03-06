import DateExtension from "@joi/date";
import JoiImport from "joi";
const Joi = JoiImport.extend(DateExtension);

const clientSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string()
    .pattern(/[0-9]{10,11}/)
    .required(),
  cpf: Joi.string()
    .pattern(/[0-9]{11}/)
    .required(),
  birthday: Joi.date().format("YYYY-MM-DD").required(),
});

export default clientSchema;
