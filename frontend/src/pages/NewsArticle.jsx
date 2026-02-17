import { useEffect, useState } from "react";
import api from "../providers/api.js";

export default function NewsArticle() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        // No auth headers needed for public article
        const { data } = await api.get("/public/article");
        setArticle(data.article);
      } catch (err) {
        console.error("Failed to load article:", err);
      } finally {
        setLoading(false);
      }
    };
    loadArticle();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-700">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          News report unavailable at this time.
        </p>
      </div>
    );
  }

  const officerClues = article.officerClues || [];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* News Header */}
        <div className="bg-red-600 px-6 py-4">
          <h1 className="text-3xl font-bold text-white tracking-wide">⚡ FAST NEWS</h1>
        </div>

        {/* Article Content */}
        <div className="p-8">
          {/* Meta Info */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-500 font-medium">📅 10 days ago</span>
            <span className="text-sm text-gray-500">Breaking News</span>
          </div>

          {/* Article Heading */}
          <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h2>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4 leading-relaxed">
            <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">
              Senior Officers Honored at Community Safety Event
            </h3>

            <p>
              In a heartwarming ceremony held at the City Community Hall, our Senior Investigation Officers were honored for their outstanding service in solving multiple high-profile criminal cases over the past decade.
            </p>

            <p>
              The event took place recently with several government officials, journalists, and local residents in attendance. The atmosphere was filled with appreciation and gratitude for the officers' dedication to public safety.
            </p>

            <p>
              During the ceremony, the officers addressed the audience and spoke about the importance of integrity and teamwork in law enforcement. They emphasized how community cooperation plays a crucial role in maintaining peace and justice.
            </p>

            <p>
              Interestingly, many attendees noticed that the celebration was even more special as it coincided with the birthdays of our esteemed officers!
            </p>

            <p>
              Several senior officials praised their leadership skills, stating that their commitment and discipline have inspired many young recruits.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8 rounded-r-lg">
              <h4 className="text-xl font-bold text-blue-900 mb-4 uppercase tracking-wider">
                 officer clues : list of names and their DD
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {officerClues.map((clue, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-white p-3 rounded shadow-sm border border-blue-100">
                    <span className="font-semibold text-gray-800">{clue.name}</span>
                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-bold shadow-sm border border-blue-200">
                      DD: {clue.dd}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p>
              The program concluded with a cultural performance and a small felicitation ceremony, marking the end of a meaningful and inspiring evening.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              — Fast News Bureau | Community Safety Desk
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
