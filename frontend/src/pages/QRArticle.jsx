import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../providers/api.js";

export default function QRArticle() {
  const navigate = useNavigate();
  const location = useLocation();
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-ember">Article not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-haze hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back to Puzzle
        </button>

        {/* Article Container */}
        <article className="bg-steel/70 rounded-xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-ember/20 to-transparent p-8 border-b border-white/10">
            <h1 className="text-4xl font-bold text-white mb-2">{article.title || "Breaking News"}</h1>
            <p className="text-haze text-sm">
              Published: {new Date(article.publishDate || Date.now()).toLocaleDateString()} | 
              {article.section && ` Section: ${article.section}`}
            </p>
          </div>

          {/* Featured Image */}
          {article.imageUrl && (
            <div className="w-full h-96 bg-ink overflow-hidden border-b border-white/10">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Subtitle/Description */}
            {article.description && (
              <p className="text-lg text-haze italic border-l-4 border-ember pl-4">
                {article.description}
              </p>
            )}

            {/* Main Text */}
            <div className="text-white leading-relaxed space-y-4">
              {article.contentParagraphs ? (
                article.contentParagraphs.map((para, idx) => (
                  <p key={idx} className="text-white/90">
                    {para}
                  </p>
                ))
              ) : (
                <p className="text-white/90">{article.content || article.articleText}</p>
              )}
            </div>

            {/* Highlight Box - Key Clue */}
            <div className="bg-ember/20 border-2 border-ember p-6 rounded-lg mt-8">
              <p className="text-ember font-bold text-lg">
                💡 Key Detail: {article.keyClue || `On ${article.dateHighlight}, this event occurred during Officer ${article.officerName}'s birthday!`}
              </p>
            </div>

            {/* Byline */}
            {article.byline && (
              <div className="border-t border-white/10 pt-6 mt-6">
                <p className="text-haze text-sm">By {article.byline}</p>
              </div>
            )}
          </div>
        </article>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white/10 text-white font-semibold rounded hover:bg-white/20"
          >
            ← Back
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
          >
            Got the Date → 
          </button>
        </div>
      </div>
    </div>
  );
}
