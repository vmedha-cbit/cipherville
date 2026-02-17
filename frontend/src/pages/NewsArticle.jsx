import { useEffect, useState } from "react";
import api from "../providers/api.js";

export default function NewsArticle() {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const { data } = await api.get("/participants/article");
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
          This article is exclusive to Cipherville investigators. Please login to access your assigned case files.
        </p>
        <a 
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
        >
          Go to Login
        </a>
      </div>
    );
  }

  // Extract day from article dateHighlight (e.g., "10" from "10th")
  const dayNumber = article.dateHighlight || "10";
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };
  const dayOrdinal = `${dayNumber}${getOrdinalSuffix(parseInt(dayNumber))}`;

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
            Official Public Meeting with Honorable {article.officerName}
          </h2>

          {/* Article Body */}
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4 leading-relaxed">
            <h3 className="text-2xl font-semibold text-gray-800 mt-6 mb-4">
              Senior Officer Honored at Community Safety Event
            </h3>

            <p>
              In a heartwarming ceremony held at the City Community Hall, Senior Investigation Officer{" "}
              <strong>{article.officerName}</strong> was honored for his outstanding service in solving multiple
              high-profile criminal cases over the past decade.
            </p>

            <p>
              The event took place on <mark className="bg-yellow-200 font-bold px-1">the {dayOrdinal} of this month</mark>,
              with several government officials, journalists, and local residents in attendance. The atmosphere was
              filled with appreciation and gratitude for the officer's dedication to public safety.
            </p>

            <p>
              During the ceremony, Officer addressed the audience and spoke about the importance of integrity and
              teamwork in law enforcement. He emphasized how community cooperation plays a crucial role in maintaining
              peace and justice.
            </p>

            <p>
              Interestingly, many attendees noticed that the celebration was even more special, as the function
              coincided with Officer <strong>{article.officerName}</strong>'s birthday, making the day memorable for both him
              and his colleagues.
            </p>

            <p>
              Several senior officers praised his leadership skills, stating that his commitment and discipline have
              inspired many young recruits to follow in his footsteps.
            </p>

            <p>
              The program concluded with a cultural performance and a small felicitation ceremony, marking the end of a
              meaningful and inspiring evening.
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
