import { nanoid } from "nanoid";

export const makeId = (size = 8) => nanoid(size);
