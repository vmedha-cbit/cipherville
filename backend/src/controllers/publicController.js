import { Officer } from "../models/Officer.js";

export const getPublicArticle = async (req, res, next) => {
  try {
    const officers = await Officer.find().sort({ name: 1 });
    
    const officerClues = officers.map(o => {
        const dd = o.dob ? o.dob.substring(0, 2) : "??";
        return { name: o.name, dd };
    });

    // Formatting for plain text/markdown display if needed, but we'll send structured data
    const clueString = officerClues.map(o => `${o.name} - ${o.dd}`).join("\n");

    const article = {
      title: "Official Public Meeting with Honorable Officers",
      description: "Local law enforcement recognized at community gathering",
      officerName: "All Officers",
      dateHighlight: null, // No single date to highlight
      content: "This is a public announcement honoring all our serving officers.", // Placeholder, frontend can render better
      officerClues // Frontend can iterate this
    };

    res.json({ article });
  } catch (err) {
    next(err);
  }
};
